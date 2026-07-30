import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrder } from "@/lib/mercadopago";
import { loadPaymentForCheckout } from "@/lib/payment-access";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { markPaidAndNotifyAdmin } from "@/lib/appeal-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Consultado pela tela do Pix enquanto o cliente paga no app do banco.
 *
 * Não depende do webhook: reconsulta o Mercado Pago direto. Se o webhook
 * falhar ou atrasar, o cliente ainda vê a confirmação — e a entrega é
 * disparada aqui do mesmo jeito.
 */
export async function GET(
  req: Request,
  { params }: { params: { appealId: string } },
) {
  const ip = getClientIp(req);
  const rl = rateLimit(`pagamento:status:${ip}`, { max: 240, windowMs: 60 * 60_000 });
  if (!rl.ok) return tooManyRequests(rl);

  try {
    const url = new URL(req.url);
    const payment = await loadPaymentForCheckout(params.appealId, url.searchParams.get("t"));
    if (!payment) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    if (payment.status === "PAID") return NextResponse.json({ paid: true });
    if (!payment.mercadopagoOrderId) return NextResponse.json({ paid: false });

    const order = await getOrder(payment.mercadopagoOrderId);
    if (!order.paid) {
      return NextResponse.json({ paid: false, status: order.status });
    }

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        mercadopagoPaymentId: order.paymentId ?? payment.mercadopagoPaymentId,
      },
    });
    await markPaidAndNotifyAdmin(params.appealId);

    return NextResponse.json({ paid: true });
  } catch (err) {
    logger.error("pagamento.status falhou", err, { appealId: params.appealId });
    return NextResponse.json({ paid: false }, { status: 200 });
  }
}
