import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { computeRefundEligibility } from "@/lib/refund-policy";
import { sendAdminRefundRequestEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  reason: z.string().min(5, "Conte brevemente o motivo").max(2000),
});

/** Cliente solicita reembolso — fica pendente de análise do admin. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const { reason } = schema.parse(await req.json());

    const appeal = await db.appeal.findUnique({
      where: { id: params.id },
      include: { payment: true, refundRequest: true, user: true },
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
    if (!eligibility.canRequestRefund) {
      return NextResponse.json({ error: eligibility.message }, { status: 409 });
    }

    await db.refundRequest.create({
      data: { appealId: appeal.id, reason },
    });

    await sendAdminRefundRequestEmail({
      appealId: appeal.id,
      userName: appeal.user.name,
      reason,
      amountCents: appeal.payment?.amountCents ?? 0,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Falta de sessão não é erro do servidor — responde 401 sem poluir o Sentry.
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
    }
    logger.error("recursos.reembolso falhou", err, { appealId: params.id });
    return NextResponse.json(
      { error: "Não foi possível registrar a solicitação." },
      { status: 500 },
    );
  }
}
