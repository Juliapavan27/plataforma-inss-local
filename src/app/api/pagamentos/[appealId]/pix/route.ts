import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPixOrder, isMercadoPagoConfigured, PixUnavailableError } from "@/lib/mercadopago";
import { loadPaymentForCheckout, amountToCharge } from "@/lib/payment-access";
import { PRICE_PIX_CENTS, PRICE_CARD_CENTS } from "@/lib/pricing";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { markPaidAndNotifyAdmin } from "@/lib/appeal-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/** Gera o QR Code do Pix para o pedido. O pagamento em si acontece no banco do cliente. */
export async function POST(
  req: Request,
  { params }: { params: { appealId: string } },
) {
  const ip = getClientIp(req);
  const rl = rateLimit(`pagamento:pix:${ip}`, { max: 20, windowMs: 60 * 60_000 });
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
      return NextResponse.json({ alreadyPaid: true });
    }

    const amountCents = amountToCharge(payment, "pix", {
      pix: PRICE_PIX_CENTS,
      card: PRICE_CARD_CENTS,
    });

    const order = await createPixOrder({
      appealId: params.appealId,
      amountCents,
      description: "Recurso Administrativo INSS",
      payer: {
        email: payment.user.email,
        firstName: payment.user.name?.split(" ")[0],
        lastName: payment.user.name?.split(" ").slice(1).join(" ") || undefined,
        cpf: (payment.user as any).cpf ?? undefined,
      },
      expiresInMinutes: 30,
    });

    await db.payment.update({
      where: { id: payment.id },
      data: {
        provider: "mercadopago",
        paymentMethod: "pix",
        amountCents,
        mercadopagoOrderId: order.orderId,
        mercadopagoPaymentId: order.paymentId,
      },
    });

    // Pix quase nunca é aprovado na criação, mas se for já libera a entrega.
    if (order.paid) {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      await markPaidAndNotifyAdmin(params.appealId);
    }

    return NextResponse.json({
      paid: order.paid,
      qrCode: order.pix?.qrCode ?? null,
      qrCodeBase64: order.pix?.qrCodeBase64 ?? null,
      amountCents,
    });
  } catch (err) {
    // Falha de configuração da conta vai com o motivo: sem isso não há como
    // descobrir, de fora do servidor, o que precisa ser ajustado no Mercado Pago.
    if (err instanceof PixUnavailableError) {
      logger.error("pagamento.pix indisponivel", err, {
        appealId: params.appealId,
        detalhe: err.detalheOriginal.slice(0, 400),
      });
      return NextResponse.json({ error: err.message, configuracao: true }, { status: 503 });
    }
    logger.error("pagamento.pix falhou", err, { appealId: params.appealId });
    return NextResponse.json(
      { error: "Não foi possível gerar o Pix. Tente novamente." },
      { status: 400 },
    );
  }
}
