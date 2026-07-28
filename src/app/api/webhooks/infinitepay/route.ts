import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPayment } from "@/lib/infinitepay";
import { markPaidAndNotifyAdmin } from "@/lib/appeal-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * Webhook da InfinitePay. Sem assinatura verificável — por isso NUNCA confiamos
 * no corpo recebido sozinho. Toda confirmação passa por verifyPayment
 * (payment_check), uma chamada nossa direta pro servidor da InfinitePay.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderNsu: string | undefined = body.order_nsu;
    const transactionNsu: string | undefined = body.transaction_nsu;
    const slug: string | undefined = body.invoice_slug;

    if (!orderNsu || !transactionNsu || !slug) {
      return NextResponse.json({ error: "payload incompleto" }, { status: 400 });
    }

    const verified = await verifyPayment({ orderNsu, transactionNsu, slug });
    if (!verified.paid) {
      logger.warn("infinitepay.webhook não confirmado via payment_check", { orderNsu });
      return NextResponse.json({ error: "não confirmado" }, { status: 400 });
    }

    // order_nsu é o appealId (definido na criação do link em /api/recursos).
    const appealId = orderNsu;
    const payment = await db.payment.findUnique({ where: { appealId } });
    if (!payment) {
      logger.warn("infinitepay.webhook: payment não encontrado", { appealId });
      return NextResponse.json({ error: "not found" }, { status: 400 });
    }
    if (payment.status === "PAID") {
      return NextResponse.json({ received: true }); // idempotente — já processado
    }

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        infinitepayTransactionNsu: transactionNsu,
        infinitepaySlug: slug,
      },
    });

    await markPaidAndNotifyAdmin(appealId);

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("infinitepay.webhook falhou", err);
    return NextResponse.json({ error: "erro" }, { status: 400 });
  }
}
