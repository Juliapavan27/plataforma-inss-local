import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendRefundDecisionEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { marcarNotaAposCancelamento } from "@/lib/nota-fiscal-service";

export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(2000).optional(),
});

/**
 * Admin decide sobre a solicitação de reembolso.
 *
 * Atenção: aprovar aqui registra a decisão e avisa o cliente, mas NÃO devolve o
 * dinheiro automaticamente — o estorno precisa ser feito no painel do provedor
 * (InfinitePay ou Stripe).
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    const { action, note } = schema.parse(await req.json());

    const appeal = await db.appeal.findUnique({
      where: { id: params.id },
      include: { refundRequest: true, payment: true, user: true },
    });
    if (!appeal?.refundRequest) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
    }
    if (appeal.refundRequest.status !== "REQUESTED") {
      return NextResponse.json({ error: "Solicitação já decidida" }, { status: 409 });
    }

    const approved = action === "approve";

    await db.refundRequest.update({
      where: { id: appeal.refundRequest.id },
      data: {
        status: approved ? "APPROVED" : "REJECTED",
        decisionNote: note ?? null,
        decidedAt: new Date(),
      },
    });

    if (approved) {
      await db.appeal.update({
        where: { id: appeal.id },
        data: { status: "CANCELED", canceledAt: new Date() },
      });
      if (appeal.payment) {
        await db.payment.update({
          where: { id: appeal.payment.id },
          data: { status: "REFUNDED" },
        });
      }
      // Acerta a situação da nota — vira pendência no painel se já foi emitida.
      await marcarNotaAposCancelamento(appeal.id);
    }

    await sendRefundDecisionEmail({
      to: appeal.user.email,
      name: appeal.user.name,
      approved,
      note: note ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("admin.reembolso falhou", err, { appealId: params.id });
    return NextResponse.json({ error: "Erro ao decidir" }, { status: 500 });
  }
}
