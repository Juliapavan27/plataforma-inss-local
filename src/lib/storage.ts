/**
 * Abstração de armazenamento. Por padrão salva em disco local (./uploads).
 * Em produção, trocar por S3/R2 (stub abaixo comentado) — mantém a mesma API.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Resolve `storageKey` dentro de UPLOAD_DIR e rejeita qualquer tentativa de
 * escapar do diretório (path traversal via `..`, separadores ou caminhos absolutos).
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
  await ensureDir();
  const sanitized = opts.filename.replace(/[^\w.\-]+/g, "_").replace(/^\.+/, "_");
  const storageKey = `${randomUUID()}-${sanitized}`;
  const fullPath = safeResolve(storageKey);
  await fs.writeFile(fullPath, buf);
  return {
    storageKey,
    url: `/api/files/${encodeURIComponent(storageKey)}`,
    sizeBytes: buf.byteLength,
  };
}

export async function readBuffer(storageKey: string): Promise<Buffer> {
  return fs.readFile(safeResolve(storageKey));
}

export function resolveStoragePath(storageKey: string) {
  return safeResolve(storageKey);
}

/* ============================================================
 * Versão S3 (trocar quando tiver credenciais):
 *
 * import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
 * import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
 *
 * const s3 = new S3Client({
 *   region: process.env.S3_REGION,
 *   endpoint: process.env.S3_ENDPOINT,
 *   credentials: {
 *     accessKeyId: process.env.S3_ACCESS_KEY_ID!,
 *     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
 *   },
 * });
 * ============================================================ */
