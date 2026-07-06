import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { saveBuffer } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXT = new Set([
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
]);

// Magic bytes para validar conteúdo real (defesa contra MIME spoof).
function detectMimeFromBytes(buf: Buffer): string | null {
  if (buf.length < 4) return null;
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46)
    return "application/pdf";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
    return "image/png";
  // RIFF....WEBP
  if (
    buf.length >= 12 &&
    buf.slice(0, 4).toString("ascii") === "RIFF" &&
    buf.slice(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  // ZIP-based (DOCX) — PK\x03\x04
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04)
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  // DOC antigo (OLE) — D0 CF 11 E0
  if (
    buf[0] === 0xd0 &&
    buf[1] === 0xcf &&
    buf[2] === 0x11 &&
    buf[3] === 0xe0
  )
    return "application/msword";
  // HEIC: bytes 4..8 == "ftyp" e marca heic/heif
  if (buf.length >= 12 && buf.slice(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.slice(8, 12).toString("ascii");
    if (/^(heic|heix|hevc|heim|heis|mif1|msf1)$/.test(brand))
      return "image/heic";
  }
  return null;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const appeal = await db.appeal.findUnique({ where: { id: params.id } });
    if (!appeal) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (appeal.userId !== user.id)
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const kindRaw = (form.get("kind") as string) ?? "outro";
    const kind = kindRaw.replace(/[^\w-]/g, "").slice(0, 32) || "outro";
    if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
    if (file.size === 0)
      return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "Arquivo acima de 10MB" }, { status: 413 });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Envie PDF, DOC/DOCX ou imagem." },
        { status: 415 },
      );
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido." },
        { status: 415 },
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const detected = detectMimeFromBytes(buf);
    if (!detected || !ALLOWED_MIME.has(detected)) {
      return NextResponse.json(
        { error: "Conteúdo do arquivo não corresponde a um tipo permitido." },
        { status: 415 },
      );
    }

    const { url, sizeBytes } = await saveBuffer(buf, {
      filename: file.name,
      mimeType: detected,
    });
    const doc = await db.document.create({
      data: {
        appealId: appeal.id,
        filename: file.name,
        mimeType: detected,
        sizeBytes,
        storageUrl: url,
        kind,
      },
    });
    return NextResponse.json(doc);
  } catch (err) {
    const { redactPii } = await import("@/lib/pii");
    console.error("[documents.POST]", redactPii(err));
    return NextResponse.json(
      { error: "Falha ao salvar o arquivo." },
      { status: 500 },
    );
  }
}
