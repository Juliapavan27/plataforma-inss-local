import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { NfStatus } from "@/lib/nota-fiscal";

export const runtime = "nodejs";

const BodySchema = z.object({
  status: z.enum(["PENDENTE", "EMITIDA", "CANCELAR", "CANCELADA", "DISPENSADA"]),
  numero: z.string().max(60).optional(),
  observacao: z.string().max(500).optional(),
});

/** Registra o que aconteceu com a nota de um pagamento. Só admin. */
export async function POST(
  req: Request,
  { params }: { params: { paymentId: string } },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  try {
    const { status, numero, observacao } = BodySchema.parse(await req.json());

    // Marcar como emitida sem o número deixa a lista limpa e a contabilidade
    // sem rastro — é justamente o que este controle existe para evitar.
    if (status === "EMITIDA" && !numero?.trim()) {
      return NextResponse.json(
        { error: "Informe o número da nota para marcar como emitida." },
        { status: 400 },
      );
    }

    const pagamento = await db.payment.findUnique({ where: { id: params.paymentId } });
    if (!pagamento) {
      return NextResponse.json({ error: "pagamento não encontrado" }, { status: 404 });
    }

    await db.payment.update({
      where: { id: params.paymentId },
      data: {
        nfStatus: status satisfies NfStatus,
        nfNumero: numero?.trim() || null,
        nfObservacao: observacao?.trim() || null,
        // A data marca quando a nota passou a existir; sai se ela deixar de existir.
        nfEmitidaEm:
          status === "EMITIDA"
            ? (pagamento.nfEmitidaEm ?? new Date())
            : status === "CANCELADA" || status === "PENDENTE"
              ? null
              : pagamento.nfEmitidaEm,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
    }
    logger.error("admin.notaFiscal falhou", err, { paymentId: params.paymentId });
    return NextResponse.json({ error: "erro ao salvar" }, { status: 400 });
  }
}
