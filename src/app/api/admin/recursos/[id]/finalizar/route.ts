import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveBuffer } from "@/lib/storage";
import { sendAppealReadyEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

/** Admin anexa o PDF/DOCX finais (escritos manualmente) e marca o recurso como pronto. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();

    const appeal = await db.appeal.findUnique({
      where: { id: params.id },
      include: { user: true },
    });
    if (!appeal) return NextResponse.json({ error: "not found" }, { status: 404 });

    const form = await req.formData();
    const pdfFile = form.get("pdf");
    const docxFile = form.get("docx");
    if (!(pdfFile instanceof File) || !(docxFile instanceof File)) {
      return NextResponse.json(
        { error: "Envie o PDF e o DOCX finais." },
        { status: 400 },
      );
    }
    if (pdfFile.size > MAX_SIZE || docxFile.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo acima de 15MB" }, { status: 413 });
    }

    const pdfBuf = Buffer.from(await pdfFile.arrayBuffer());
    const docxBuf = Buffer.from(await docxFile.arrayBuffer());

    const pdf = await saveBuffer(pdfBuf, {
      filename: `recurso-${appeal.id}.pdf`,
      mimeType: "application/pdf",
    });
    const docx = await saveBuffer(docxBuf, {
      filename: `recurso-${appeal.id}.docx`,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    await db.appeal.update({
      where: { id: appeal.id },
      data: {
        status: "READY",
        pdfUrl: pdf.url,
        docxUrl: docx.url,
        generatedAt: new Date(),
      },
    });

    await sendAppealReadyEmail({ to: appeal.user.email, appealId: appeal.id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("admin.finalizar falhou", err, { appealId: params.id });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao finalizar" },
      { status: 500 },
    );
  }
}
