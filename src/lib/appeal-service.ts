/**
 * Orquestrador do recurso. Geração é MANUAL por enquanto (a fundadora escreve/gera
 * fora da plataforma e anexa o PDF/DOCX pronto via /admin/pedidos/[id]) — a IA
 * (generateAppeal/scoreAppeal) fica reservada para uso futuro/opcional pelo admin.
 */

import { db } from "./db";
import { generateAppeal, scoreAppeal } from "./ai";
import { buildAppealPdf } from "./docgen/pdf";
import { buildAppealDocx } from "./docgen/docx";
import { saveBuffer } from "./storage";
import { redactPii } from "./pii";
import { logger } from "./logger";
import {
  sendAdminNewOrderEmail,
  sendAbandonedCartEmail,
  sendPaymentConfirmationEmail,
} from "./email";
import { stripe, isStripeConfigured, getOrCreateAbandonedCartCoupon } from "./stripe";
import { isInfinitePayConfigured, createCheckoutLink } from "./infinitepay";
import { isMercadoPagoConfigured } from "./mercadopago";
import { createPaymentToken } from "./payment-token";
import { PRICE_CARD_CENTS } from "./pricing";
import type { BenefitType, DenialReason } from "./types";

const MAX_ATTEMPTS = 3;
const STUCK_AFTER_MS = 10 * 60_000; // 10 min

const WAIVED_DELIVERY_MS = 24 * 60 * 60_000; // 24h
const STANDARD_DELIVERY_MS = 8 * 24 * 60 * 60_000; // 8 dias (mantém arrependimento CDC art. 49)

export function computeDueAt(withdrawalWaived: boolean, from: Date = new Date()): Date {
  return new Date(from.getTime() + (withdrawalWaived ? WAIVED_DELIVERY_MS : STANDARD_DELIVERY_MS));
}

/**
 * Marca o appeal como pago, define o prazo de entrega e avisa o admin por e-mail —
 * substitui o antigo disparo automático de IA (processAppealGeneration).
 */
export async function markPaidAndNotifyAdmin(appealId: string) {
  const appeal = await db.appeal.findUnique({
    where: { id: appealId },
    include: { user: true },
  });
  if (!appeal) return;

  const dueAt = computeDueAt(appeal.withdrawalWaived);
  await db.appeal.update({
    where: { id: appealId },
    data: { status: "PAID", dueAt },
  });

  await sendAdminNewOrderEmail({
    id: appeal.id,
    userName: appeal.user.name,
    dueAt,
  });

  // O comprovante do cliente não pode derrubar a confirmação do pagamento: se o
  // e-mail falhar, o pedido continua pago e o admin já foi avisado.
  try {
    const payment = await db.payment.findUnique({ where: { appealId } });
    await sendPaymentConfirmationEmail({
      to: appeal.user.email,
      name: appeal.user.name,
      appealId: appeal.id,
      amountCents: payment?.amountCents ?? 0,
      dueAt,
      trackingUrl: `${process.env.APP_URL}/pagamento/${appeal.id}/confirmado?t=${encodeURIComponent(
        createPaymentToken(appeal.id, 30 * 24 * 60 * 60_000),
      )}`,
    });
  } catch (e) {
    logger.error("confirmacao de pagamento nao enviada", e, { appealId });
  }
}

const ABANDONED_AFTER_MS = 60 * 60_000; // 1h sem concluir o pagamento

/**
 * Encontra checkouts abandonados (Payment PENDING há mais de 1h) e envia e-mail
 * com cupom de 10% e um novo link de checkout. Chamado por /api/cron/abandoned-cart.
 */
export async function sweepAbandonedCarts(): Promise<{
  scanned: number;
  emailed: string[];
}> {
  if (!isStripeConfigured() && !isInfinitePayConfigured() && !isMercadoPagoConfigured()) {
    return { scanned: 0, emailed: [] };
  }

  const olderThan = new Date(Date.now() - ABANDONED_AFTER_MS);
  const payments = await db.payment.findMany({
    where: {
      status: "PENDING",
      abandonedEmailSentAt: null,
      createdAt: { lt: olderThan },
    },
    include: { appeal: true, user: true },
    take: 50,
  });

  const emailed: string[] = [];
  const couponId = isStripeConfigured() ? await getOrCreateAbandonedCartCoupon() : null;

  for (const p of payments) {
    try {
      // No Mercado Pago o `amountCents` gravado é só um placeholder até o
      // cliente escolher o meio de pagamento — o e-mail compara com o preço
      // anunciado do cartão, que é o que ele viu no site.
      const fullCents =
        p.provider === "mercadopago" ? PRICE_CARD_CENTS : p.amountCents;
      const discountedCents = Math.round(fullCents * 0.9);
      let checkoutUrl: string | null = null;

      if (p.provider === "mercadopago" && isMercadoPagoConfigured()) {
        // Aqui o desconto é gravado no pedido, não num link novo: a nossa
        // página de pagamento recalcula o valor dos dois meios a partir dele.
        // Assim o cliente escolhe Pix ou cartão e o desconto vale igual.
        await db.payment.update({
          where: { id: p.id },
          data: { discountCents: Math.round(PRICE_CARD_CENTS * 0.1) },
        });
        checkoutUrl = `${process.env.APP_URL}/pagamento/${p.appealId}?t=${encodeURIComponent(
          // 7 dias: o e-mail de recuperação precisa continuar válido por mais
          // tempo que o link normal do checkout.
          createPaymentToken(p.appealId, 7 * 24 * 60 * 60_000),
        )}`;
      } else if (p.provider === "infinitepay" && isInfinitePayConfigured()) {
        // InfinitePay não tem conceito de cupom — o desconto é só um preço menor no novo link.
        const { url } = await createCheckoutLink({
          orderNsu: p.appealId,
          amountCents: discountedCents,
          description: "Recurso Administrativo INSS (10% de desconto)",
          redirectUrl: `${process.env.APP_URL}/dashboard/recursos/${p.appealId}?paid=1`,
          webhookUrl: `${process.env.APP_URL}/api/webhooks/infinitepay`,
          customerName: p.user.name,
          customerEmail: p.user.email,
          customerPhone: p.user.phone ?? undefined,
        });
        checkoutUrl = url;
      } else if (p.provider === "stripe" && isStripeConfigured() && couponId) {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "brl",
                product_data: { name: "Recurso Administrativo INSS" },
                unit_amount: p.amountCents,
              },
              quantity: 1,
            },
          ],
          discounts: [{ coupon: couponId }],
          metadata: { appealId: p.appealId },
          success_url: `${process.env.APP_URL}/dashboard/recursos/${p.appealId}?paid=1`,
          cancel_url: `${process.env.APP_URL}/novo-recurso?canceled=1`,
          customer_email: p.user.email,
        });
        checkoutUrl = session.url;
      } else {
        continue;
      }
      if (!checkoutUrl) continue;

      await sendAbandonedCartEmail({
        to: p.user.email,
        name: p.user.name,
        checkoutUrl,
        amountCents: fullCents,
        discountedCents,
      });
      await db.payment.update({
        where: { id: p.id },
        data: { abandonedEmailSentAt: new Date() },
      });
      emailed.push(p.id);
    } catch (e) {
      logger.error("abandonedCart.email falhou", e, { paymentId: p.id });
    }
  }

  return { scanned: payments.length, emailed };
}

async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  attempts = MAX_ATTEMPTS,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      logger.warn(`retry ${label}`, { attempt: i, of: attempts });
      if (i < attempts) {
        const backoff = 500 * Math.pow(2, i - 1) + Math.random() * 250;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastErr;
}

export async function processAppealGeneration(appealId: string) {
  const appeal = await db.appeal.findUnique({
    where: { id: appealId },
    include: { user: true },
  });
  if (!appeal) throw new Error("Recurso não encontrado");
  if (appeal.status === "GENERATING" || appeal.status === "READY") return appeal;

  await db.appeal.update({
    where: { id: appealId },
    data: { status: "GENERATING", generationError: null },
  });

  try {
    const extraFacts = appeal.extraFactsJson
      ? (JSON.parse(appeal.extraFactsJson) as Record<string, unknown>)
      : null;
    const input = {
      fullName: appeal.user.name,
      cpf: appeal.user.cpf ?? "",
      benefitType: appeal.benefitType as BenefitType,
      denialReason: appeal.denialReason as DenialReason,
      denialDate: appeal.denialDate?.toISOString().slice(0, 10) ?? null,
      beneficioNumero: appeal.beneficioNumero ?? null,
      inssProtocolo: appeal.inssProtocolo ?? null,
      caseSummary: appeal.caseSummary,
      extra: extraFacts,
    };

    // 1) redação do recurso (com retry/backoff)
    const t0 = Date.now();
    const draft = await withRetry(() => generateAppeal(input), "drafting");
    await logPhase(appealId, "drafting", {
      model: draft.model,
      promptTokens: draft.promptTokens,
      outputTokens: draft.outputTokens,
      durationMs: draft.durationMs,
      success: true,
    });

    // 2) score paralelo (com retry)
    const scoreResult = await withRetry(() => scoreAppeal(input), "scoring");
    await logPhase(appealId, "scoring", {
      model: scoreResult.model,
      durationMs: scoreResult.durationMs,
      success: true,
    });

    // 3) export PDF/DOCX
    const title = `Recurso Administrativo - ${appeal.user.name}`;
    const [pdfBuf, docxBuf] = await Promise.all([
      buildAppealPdf({ title, body: draft.text }),
      buildAppealDocx({ title, body: draft.text }),
    ]);
    const pdf = await saveBuffer(pdfBuf, {
      filename: `recurso-${appeal.id}.pdf`,
      mimeType: "application/pdf",
    });
    const docx = await saveBuffer(docxBuf, {
      filename: `recurso-${appeal.id}.docx`,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    await logPhase(appealId, "export", {
      durationMs: Date.now() - t0,
      success: true,
    });

    const updated = await db.appeal.update({
      where: { id: appealId },
      data: {
        status: "READY",
        generatedText: draft.text,
        successScore: scoreResult.score,
        scoreRationale: scoreResult.rationale,
        suggestionsJson: JSON.stringify(scoreResult.suggestions),
        pdfUrl: pdf.url,
        docxUrl: docx.url,
        generatedAt: new Date(),
      },
    });
    return updated;
  } catch (err) {
    const safeMessage = redactPii(err);
    await db.appeal.update({
      where: { id: appealId },
      data: { status: "FAILED", generationError: safeMessage },
    });
    await logPhase(appealId, "drafting", {
      success: false,
      errorMessage: safeMessage,
    });
    throw err;
  }
}

async function logPhase(
  appealId: string,
  phase: string,
  data: {
    model?: string;
    promptTokens?: number;
    outputTokens?: number;
    durationMs?: number;
    success: boolean;
    errorMessage?: string;
  },
) {
  await db.generationLog.create({
    data: { appealId, phase, ...data },
  });
}

/**
 * Sweeper: reprocessa appeals travados no uso opcional de IA pelo admin
 * (GENERATING parado há > STUCK_AFTER_MS, ou FAILED). Appeals "PAID" não entram
 * mais aqui — geração é manual, então "PAID" só significa "aguardando o admin",
 * não "travado". Chamado por /api/cron/retry-stuck.
 */
export async function sweepStuckAppeals(): Promise<{
  scanned: number;
  retried: string[];
}> {
  const stuckBefore = new Date(Date.now() - STUCK_AFTER_MS);
  const candidates = await db.appeal.findMany({
    where: {
      OR: [
        { status: "GENERATING", updatedAt: { lt: stuckBefore } },
        { status: "FAILED", updatedAt: { lt: stuckBefore } },
      ],
    },
    select: { id: true, status: true },
    take: 50,
  });

  const retried: string[] = [];
  for (const c of candidates) {
    try {
      // Em FAILED, libera o status para reprocessamento.
      if (c.status === "FAILED" || c.status === "GENERATING") {
        await db.appeal.update({
          where: { id: c.id },
          data: { status: "PAID", generationError: null },
        });
      }
      // Dispara async sem aguardar — sweeper precisa retornar rápido.
      processAppealGeneration(c.id).catch((e) =>
        logger.error("sweep.retry falhou", e, { appealId: c.id }),
      );
      retried.push(c.id);
    } catch (e) {
      logger.error("sweep.kickoff falhou", e, { appealId: c.id });
    }
  }
  return { scanned: candidates.length, retried };
}
