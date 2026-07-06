import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { readBuffer } from "@/lib/storage";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") === "docx" ? "docx" : "pdf";

    const appeal = await db.appeal.findUnique({ where: { id: params.id } });
    if (!appeal) return new NextResponse("not found", { status: 404 });
    if (appeal.userId !== user.id && user.role !== "ADMIN")
      return new NextResponse("forbidden", { status: 403 });
    if (appeal.status !== "READY")
      return new NextResponse("not ready", { status: 409 });

    const url = format === "docx" ? appeal.docxUrl : appeal.pdfUrl;
    if (!url) return new NextResponse("file missing", { status: 404 });

    // O url local é /api/files/<key> — extrai o key.
    const key = decodeURIComponent(url.replace(/^\/api\/files\//, ""));
    const buf = await readBuffer(key);
    const contentType =
      format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf";
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="recurso-${appeal.id}.${format}"`,
      },
    });
  } catch (err) {
    return new NextResponse(err instanceof Error ? err.message : "error", {
      status: 500,
    });
  }
}
