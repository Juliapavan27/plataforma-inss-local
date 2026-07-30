import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrder, verifyWebhookSignature } from "@/lib/mercadopago";
import { markPaidAndNotifyAdmin } from "@/lib/appeal-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * Webhook do Mercado Pago.
 *
 * Duas travas, nesta ordem:
 * 1. `x-signature` (HMAC-SHA256 com o segredo do painel) prova que a
 *    notificação veio mesmo deles.
 * 2. Mesmo assinada, o corpo não é usado como verdade: reconsultamos a order
 *    pela API antes de marcar qualquer coisa como paga.
 *
 * Sempre devolvemos 200 quando a assinatura confere, mesmo se não houver nada a
 * fazer — 4xx faz o Mercado Pago reenviar a mesma notificação por horas.
 */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = await req.text();
    let body: any = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      /* corpo inválido cai na checagem de dataId abaixo */
    }

    // O id assinado é o da query string (`data.id`); o do corpo serve de reserva.
    const dataId = url.searchParams.get("data.id") ?? body?.data?.id ?? null;

    const ok = verifyWebhookSignature({
      signatureHeader: req.headers.get("x-signature"),
      requestId: req.headers.get("x-request-id"),
      dataId: dataId != null ? String(dataId) : null,
    });
    if (!ok) {
      logger.warn("mercadopago.webhook com assinatura inválida — ignorado");
      return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
    }

    // Só as notificações de order carregam o id que sabemos consultar. As
    // demais (payment, merchant_order) são reconhecidas e descartadas.
    const topic = body?.type ?? body?.topic ?? url.searchParams.get("type");
    if (topic !== "order" || !dataId) {
      return NextResponse.json({ received: true });
    }

    const order = await getOrder(String(dataId));
    const appealId = order.orderId ? await appealIdFromOrder(String(dataId)) : null;
    if (!appealId) {
      logger.warn("mercadopago.webhook: pedido não encontrado", { orderId: dataId });
      return NextResponse.json({ received: true });
    }

    if (!order.paid) return NextResponse.json({ received: true });

    const payment = await db.payment.findUnique({ where: { appealId } });
    if (!payment) return NextResponse.json({ received: true });
    if (payment.status === "PAID") return NextResponse.json({ received: true }); // idempotente

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        mercadopagoPaymentId: order.paymentId ?? payment.mercadopagoPaymentId,
      },
    });
    await markPaidAndNotifyAdmin(appealId);

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("mercadopago.webhook falhou", err);
    // 500 faz o Mercado Pago tentar de novo — é o que queremos num erro nosso.
    return NextResponse.json({ error: "erro" }, { status: 500 });
  }
}

async function appealIdFromOrder(orderId: string): Promise<string | null> {
  const payment = await db.payment.findFirst({
    where: { mercadopagoOrderId: orderId },
    select: { appealId: true },
  });
  return payment?.appealId ?? null;
}
