import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createCardOrder, isMercadoPagoConfigured, CardDeclinedError } from "@/lib/mercadopago";
import { loadPaymentForCheckout, amountToCharge } from "@/lib/payment-access";
import { PRICE_PIX_CENTS, PRICE_CARD_CENTS } from "@/lib/pricing";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { markPaidAndNotifyAdmin } from "@/lib/appeal-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * O corpo vem do Brick do Mercado Pago. `token` representa o cartão — os dados
 * reais nunca passam por aqui, o que mantém a certificação PCI simplificada.
 *
 * O valor NÃO vem do cliente: é calculado no servidor a partir do pedido. Se
 * viesse do formulário, dava para pagar R$ 1 no recurso.
 */
const BodySchema = z.object({
  token: z.string().min(1),
  payment_method_id: z.string().min(1),
  installments: z.number().int().min(1).max(12),
  issuer_id: z.union([z.string(), z.number()]).optional(),
  payer: z
    .object({
      email: z.string().email().optional(),
      identification: z
        .object({ type: z.string().optional(), number: z.string().optional() })
        .optional(),
    })
    .optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { appealId: string } },
) {
  const ip = getClientIp(req);
  const rl = rateLimit(`pagamento:cartao:${ip}`, {
    max: 10,
    windowMs: 60 * 60_000,
    blockMs: 30 * 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl);

  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: "Pagamento indisponível no momento." }, { status: 503 });
  }

  try {
    const url = new URL(req.url);
    const payment = await loadPaymentForCheckout(params.appealId, url.searchParams.get("t"));
    if (!payment) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    if (payment.status === "PAID") {
      return NextResponse.json({ paid: true, alreadyPaid: true });
    }

    const body = BodySchema.parse(await req.json());
    const amountCents = amountToCharge(payment, "credit_card", {
      pix: PRICE_PIX_CENTS,
      card: PRICE_CARD_CENTS,
    });

    const order = await createCardOrder({
      appealId: params.appealId,
      amountCents,
      description: "Recurso Administrativo INSS",
      token: body.token,
      paymentMethodId: body.payment_method_id,
      installments: body.installments,
      issuerId: body.issuer_id != null ? String(body.issuer_id) : undefined,
      payer: {
        email: body.payer?.email || payment.user.email,
        firstName: payment.user.name?.split(" ")[0],
        lastName: payment.user.name?.split(" ").slice(1).join(" ") || undefined,
        cpf:
          body.payer?.identification?.number?.replace(/\D/g, "") ||
          ((payment.user as any).cpf ?? undefined),
      },
    });

    await db.payment.update({
      where: { id: payment.id },
      data: {
        provider: "mercadopago",
        paymentMethod: "credit_card",
        amountCents,
        mercadopagoOrderId: order.orderId,
        mercadopagoPaymentId: order.paymentId,
        ...(order.paid ? { status: "PAID", paidAt: new Date() } : {}),
      },
    });

    if (order.paid) {
      await markPaidAndNotifyAdmin(params.appealId);
      return NextResponse.json({ paid: true });
    }

    // Análise manual e recusa são coisas diferentes para o cliente: numa ele
    // espera, na outra precisa tentar outro cartão.
    const pending = order.status === "processing" || order.status === "action_required";
    return NextResponse.json({
      paid: false,
      pending,
      status: order.status,
      statusDetail: order.statusDetail,
    });
  } catch (err) {
    // Cartão recusado não é erro de sistema — é o banco dizendo não. Vai como
    // aviso, com o motivo, e o cliente vê o que precisa fazer.
    if (err instanceof CardDeclinedError) {
      logger.warn("pagamento.cartao recusado", {
        appealId: params.appealId,
        motivo: err.reason,
      });
      return NextResponse.json({ paid: false, declined: true, error: err.message }, { status: 200 });
    }
    logger.error("pagamento.cartao falhou", err, { appealId: params.appealId });
    return NextResponse.json(
      { error: "Não foi possível processar o cartão. Confira os dados e tente novamente." },
      { status: 400 },
    );
  }
}
