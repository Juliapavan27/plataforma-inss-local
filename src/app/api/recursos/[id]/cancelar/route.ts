import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { computeRefundEligibility } from "@/lib/refund-policy";
import { marcarNotaAposCancelamento } from "@/lib/nota-fiscal-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/** Cancelamento simples — só para pedidos sem pagamento confirmado. */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const appeal = await db.appeal.findUnique({
      where: { id: params.id },
      include: { payment: true, refundRequest: true },
    });
    if (!appeal) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (appeal.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const eligibility = computeRefundEligibility({
      status: appeal.status,
      paidAt: appeal.payment?.paidAt ?? null,
      hasRefundRequest: Boolean(appeal.refundRequest),
    });
    if (!eligibility.canCancel) {
      return NextResponse.json({ error: eligibility.message }, { status: 409 });
    }

    await db.appeal.update({
      where: { id: appeal.id },
      data: { status: "CANCELED", canceledAt: new Date() },
    });

    // Acerta a situação da nota. Não pode derrubar o cancelamento: para o
    // cliente o pedido cancelou, e o acerto fiscal vira pendência no painel.
    await marcarNotaAposCancelamento(appeal.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Falta de sessão não é erro do servidor — responde 401 sem poluir o Sentry.
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
    }
    logger.error("recursos.cancelar falhou", err, { appealId: params.id });
    return NextResponse.json({ error: "Não foi possível cancelar." }, { status: 500 });
  }
}
