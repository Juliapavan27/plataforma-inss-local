/**
 * Fluxo de compra e entrega dos manuais em PDF.
 *
 * Auto-contido e separado do fluxo de recurso: o manual é um produto fixo,
 * comprado só com nome+e-mail, pago por Pix (ninguém parcela R$ 9,90). Reaproveita
 * as funções do Mercado Pago (createPixOrder/getOrder) e o token assinado do
 * checkout, mas grava numa tabela própria (ManualOrder).
 *
 * A finalização (marcar pago + entregar) é idempotente e roda por dois
 * caminhos: o polling da página de pagamento e o webhook do Mercado Pago —
 * assim a entrega acontece mesmo se a pessoa fechar a aba.
 */
import { db } from "./db";
import { getManual } from "@/content/manuais";
import { createPixOrder, createCardOrder, getOrder } from "./mercadopago";
import { createPaymentToken } from "./payment-token";
import { buildManualPdf } from "./docgen/manual-pdf";
import { sendManualDeliveryEmail } from "./email";
import { trackServerPurchase } from "./ga4-mp";
import { logger } from "./logger";

const ENTREGA_TTL_MS = 90 * 24 * 60 * 60_000; // 90 dias de acesso ao link

export interface CriarManualResult {
  orderId: string;
  token: string;
  amountCents: number;
  paid: boolean;
  qrCode: string | null;
  qrCodeBase64: string | null;
}

/** Cria o pedido do manual e gera o Pix. */
export async function createManualOrder(input: {
  slug: string;
  nome: string;
  email: string;
}): Promise<CriarManualResult> {
  const manual = getManual(input.slug);
  if (!manual) throw new Error("Manual não encontrado");

  const nome = input.nome.trim();
  const email = input.email.toLowerCase().trim();

  const order = await db.manualOrder.create({
    data: {
      manualSlug: manual.slug,
      buyerName: nome,
      buyerEmail: email,
      amountCents: manual.precoCents,
      provider: "mercadopago",
      status: "PENDING",
    },
  });

  const pix = await createPixOrder({
    // O id do pedido do manual é o external_reference no Mercado Pago.
    appealId: order.id,
    amountCents: manual.precoCents,
    description: `Manual em PDF - ${manual.titulo}`.slice(0, 120),
    payer: {
      email,
      firstName: nome.split(" ")[0] || undefined,
      lastName: nome.split(" ").slice(1).join(" ") || undefined,
    },
    expiresInMinutes: 30,
  });

  await db.manualOrder.update({
    where: { id: order.id },
    data: {
      mercadopagoOrderId: pix.orderId,
      mercadopagoPaymentId: pix.paymentId,
      paymentMethod: "pix",
    },
  });

  // Pix quase nunca aprova na criação, mas se aprovar já entrega.
  if (pix.paid) await finalizeManualOrder(order.id);

  return {
    orderId: order.id,
    token: createPaymentToken(order.id),
    amountCents: manual.precoCents,
    paid: pix.paid,
    qrCode: pix.pix?.qrCode ?? null,
    qrCodeBase64: pix.pix?.qrCodeBase64 ?? null,
  };
}

/**
 * Cria só o pedido (rascunho), sem gerar pagamento ainda.
 *
 * É o ponto de partida do fluxo de cartão: primeiro grava nome+e-mail e devolve
 * o id+token, depois o Brick do Mercado Pago manda o cartão para /cartao. O
 * caminho do Pix continua usando createManualOrder (pedido + Pix num passo só).
 */
export async function createManualDraft(input: {
  slug: string;
  nome: string;
  email: string;
}): Promise<{ orderId: string; token: string; amountCents: number }> {
  const manual = getManual(input.slug);
  if (!manual) throw new Error("Manual não encontrado");

  const order = await db.manualOrder.create({
    data: {
      manualSlug: manual.slug,
      buyerName: input.nome.trim(),
      buyerEmail: input.email.toLowerCase().trim(),
      amountCents: manual.precoCents,
      provider: "mercadopago",
      status: "PENDING",
    },
  });

  return {
    orderId: order.id,
    token: createPaymentToken(order.id),
    amountCents: manual.precoCents,
  };
}

/**
 * Cobra o manual no cartão a partir do token gerado pelo Brick no navegador.
 *
 * O valor NÃO vem do cliente: é o preço fixo do manual gravado no pedido. Se
 * aprovado na hora, marca e entrega (reusa finalizeManualOrder, idempotente).
 * Recusa vira CardDeclinedError lá no createCardOrder e sobe para a rota.
 */
export async function payManualWithCard(
  orderId: string,
  input: {
    token: string;
    paymentMethodId: string;
    installments: number;
    issuerId?: string;
    payerEmail?: string;
    cpf?: string;
  },
): Promise<{ paid: boolean; pending: boolean; status: string }> {
  const order = await db.manualOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pedido não encontrado");
  if (order.status === "PAID") return { paid: true, pending: false, status: "processed" };

  const manual = getManual(order.manualSlug);
  if (!manual) throw new Error("Manual não encontrado");

  const mp = await createCardOrder({
    appealId: order.id,
    amountCents: order.amountCents,
    description: `Manual em PDF - ${manual.titulo}`.slice(0, 120),
    token: input.token,
    paymentMethodId: input.paymentMethodId,
    installments: input.installments,
    issuerId: input.issuerId,
    payer: {
      email: input.payerEmail || order.buyerEmail,
      firstName: order.buyerName.split(" ")[0] || undefined,
      lastName: order.buyerName.split(" ").slice(1).join(" ") || undefined,
      cpf: input.cpf?.replace(/\D/g, "") || undefined,
    },
  });

  await db.manualOrder.update({
    where: { id: orderId },
    data: {
      paymentMethod: "credit_card",
      mercadopagoOrderId: mp.orderId,
      mercadopagoPaymentId: mp.paymentId,
      ...(mp.paid ? { status: "PAID", paidAt: new Date() } : {}),
    },
  });

  if (mp.paid) await finalizeManualOrder(orderId);

  const pending = mp.status === "processing" || mp.status === "action_required";
  return { paid: mp.paid, pending, status: mp.status };
}

/**
 * Reconsulta o pagamento no Mercado Pago e, se pago, marca e entrega.
 * Idempotente: pode ser chamada quantas vezes for (polling + webhook).
 */
export async function finalizeManualOrder(
  orderId: string,
): Promise<"paid" | "pending" | "notfound"> {
  const order = await db.manualOrder.findUnique({ where: { id: orderId } });
  if (!order) return "notfound";

  if (order.status !== "PAID") {
    if (!order.mercadopagoOrderId) return "pending";
    const mp = await getOrder(order.mercadopagoOrderId);
    if (!mp.paid) return "pending";
    await db.manualOrder.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        mercadopagoPaymentId: mp.paymentId ?? order.mercadopagoPaymentId,
      },
    });
  }

  await deliverManual(orderId);
  return "paid";
}

/** Gera o PDF, envia por e-mail e conta a conversão. Idempotente por deliveredAt. */
async function deliverManual(orderId: string): Promise<void> {
  const order = await db.manualOrder.findUnique({ where: { id: orderId } });
  if (!order || order.deliveredAt) return;
  const manual = getManual(order.manualSlug);
  if (!manual) return;

  try {
    const pdf = await buildManualPdf(manual);
    const token = createPaymentToken(order.id, ENTREGA_TTL_MS);
    const readUrl = `${process.env.APP_URL}/manuais/${manual.slug}/entrega/${order.id}?t=${encodeURIComponent(token)}`;

    // send() interno não lança; se o provedor falhar, fica logado e a pessoa
    // ainda acessa pelo link na própria tela de pós-pagamento.
    await sendManualDeliveryEmail({
      to: order.buyerEmail,
      name: order.buyerName,
      manualTitle: manual.titulo,
      readUrl,
      pdf,
      pdfName: `manual-${manual.slug}.pdf`,
    });

    // Conversão pelo servidor — dedup por transaction_id no GA4.
    await trackServerPurchase({
      transactionId: order.id,
      valueCents: order.amountCents,
      itemName: `Manual: ${manual.titulo}`,
    });

    await db.manualOrder.update({
      where: { id: orderId },
      data: { deliveredAt: new Date() },
    });
  } catch (e) {
    // Não seta deliveredAt: o próximo polling/webhook tenta de novo.
    logger.error("manual.deliver falhou", e, { orderId });
  }
}

/** Carrega o pedido para a página de entrega, autorizando pelo token assinado. */
export async function loadManualForDelivery(orderId: string, token: string | null) {
  const { verifyPaymentToken } = await import("./payment-token");
  if (!verifyPaymentToken(orderId, token)) return null;
  const order = await db.manualOrder.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PAID") return null;
  const manual = getManual(order.manualSlug);
  if (!manual) return null;
  return { order, manual };
}
