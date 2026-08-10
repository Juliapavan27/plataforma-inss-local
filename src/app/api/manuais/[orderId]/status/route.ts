import { NextResponse } from "next/server";
import { finalizeManualOrder } from "@/lib/manuais-service";
import { verifyPaymentToken } from "@/lib/payment-token";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/** Polling da página de pagamento: reconsulta o Pix e entrega se pago. */
export async function GET(req: Request, { params }: { params: { orderId: string } }) {
  const token = new URL(req.url).searchParams.get("t");
  if (!verifyPaymentToken(params.orderId, token)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  try {
    const status = await finalizeManualOrder(params.orderId);
    return NextResponse.json({ status });
  } catch (e) {
    // Não derruba o polling — uma falha momentânea no Mercado Pago vira "pending".
    logger.error("manuais.status falhou", e, { orderId: params.orderId });
    return NextResponse.json({ status: "pending" });
  }
}
