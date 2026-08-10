import { db } from "@/lib/db";
import { verifyPaymentToken } from "@/lib/payment-token";
import { getManual } from "@/content/manuais";
import { buildManualPdf } from "@/lib/docgen/manual-pdf";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/** Serve o PDF do manual, atrás do token de pagamento e só se o pedido está pago. */
export async function GET(req: Request, { params }: { params: { orderId: string } }) {
  const token = new URL(req.url).searchParams.get("t");
  if (!verifyPaymentToken(params.orderId, token)) {
    return new Response("não autorizado", { status: 401 });
  }
  const order = await db.manualOrder.findUnique({ where: { id: params.orderId } });
  if (!order || order.status !== "PAID") {
    return new Response("pedido não encontrado ou não pago", { status: 404 });
  }
  const manual = getManual(order.manualSlug);
  if (!manual) return new Response("manual não encontrado", { status: 404 });

  try {
    const pdf = await buildManualPdf(manual);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="manual-${manual.slug}.pdf"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (e) {
    logger.error("manuais.pdf falhou", e, { orderId: params.orderId });
    return new Response("erro ao gerar o PDF", { status: 500 });
  }
}
