/**
 * Abstração de armazenamento, com dois modos:
 *
 * 1. S3 (ou compatível: R2, Backblaze) quando S3_BUCKET + credenciais existem.
 * 2. Disco, no caminho de UPLOAD_DIR (padrão: ./uploads).
 *
 * IMPORTANTE sobre o modo disco: o filesystem de um container é efêmero — os
 * arquivos somem a cada redeploy. Em produção, ele só é seguro se UPLOAD_DIR
 * apontar para um volume persistente montado (ex.: volume da Railway em /data).
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"),
);

const s3Bucket = process.env.S3_BUCKET;
const s3 =
  s3Bucket && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
    ? new S3Client({
        region: process.env.S3_REGION ?? "us-east-1",
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
      })
    : null;

export function isS3Configured() {
  return s3 !== null;
}

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Valida `storageKey` (contra path traversal, separadores, caminhos
 * absolutos) e, no modo disco local, resolve o caminho dentro de UPLOAD_DIR.
 */
function safeResolve(storageKey: string): string {
  if (typeof storageKey !== "string" || storageKey.length === 0) {
    throw new Error("storageKey inválido");
  }
  if (
    storageKey.includes("\0") ||
    storageKey.includes("/") ||
    storageKey.includes("\\") ||
    storageKey.includes("..") ||
    path.isAbsolute(storageKey)
  ) {
    throw new Error("storageKey inválido");
  }
  const full = path.resolve(UPLOAD_DIR, storageKey);
  if (full !== path.join(UPLOAD_DIR, storageKey) || !full.startsWith(UPLOAD_DIR + path.sep)) {
    throw new Error("storageKey inválido");
  }
  return full;
}

export async function saveBuffer(
  buf: Buffer,
  opts: { filename: string; mimeType?: string },
): Promise<{ url: string; storageKey: string; sizeBytes: number }> {
  const sanitized = opts.filename.replace(/[^\w.\-]+/g, "_").replace(/^\.+/, "_");
  const storageKey = `${randomUUID()}-${sanitized}`;

  if (s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: storageKey,
        Body: buf,
        ContentType: opts.mimeType,
      }),
    );
  } else {
    await ensureDir();
    await fs.writeFile(safeResolve(storageKey), buf);
  }

  return {
    storageKey,
    url: `/api/files/${encodeURIComponent(storageKey)}`,
    sizeBytes: buf.byteLength,
  };
}

export async function readBuffer(storageKey: string): Promise<Buffer> {
  if (s3) {
    if (storageKey.includes("\0") || path.isAbsolute(storageKey)) {
      throw new Error("storageKey inválido");
    }
    const res = await s3.send(
      new GetObjectCommand({ Bucket: s3Bucket, Key: storageKey }),
    );
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) throw new Error("arquivo vazio");
    return Buffer.from(bytes);
  }
  return fs.readFile(safeResolve(storageKey));
}
