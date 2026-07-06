/**
 * Logger estruturado mínimo, com redact de PII por padrão.
 * Sem deps externas. Quando você tiver SENTRY_DSN, adicione @sentry/nextjs
 * e troque os hooks abaixo — a API pública não muda.
 */

import { redactPii } from "./pii";

type Level = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: Level;
  msg: string;
  ts: string;
  ctx?: Record<string, unknown>;
  err?: { message: string; stack?: string; name?: string };
}

function format(level: Level, msg: string, ctx?: Record<string, unknown>, err?: unknown): LogEntry {
  const entry: LogEntry = {
    level,
    msg: redactPii(msg),
    ts: new Date().toISOString(),
  };
  if (ctx) {
    const safeCtx: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(ctx)) {
      safeCtx[k] = typeof v === "string" ? redactPii(v) : v;
    }
    entry.ctx = safeCtx;
  }
  if (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    entry.err = {
      name: e.name,
      message: redactPii(e.message),
      stack: e.stack ? redactPii(e.stack) : undefined,
    };
  }
  return entry;
}

function emit(entry: LogEntry) {
  const out = JSON.stringify(entry);
  if (entry.level === "error") console.error(out);
  else if (entry.level === "warn") console.warn(out);
  else console.log(out);

  // Hook Sentry — ativa automaticamente quando o pacote estiver instalado
  // e SENTRY_DSN configurado. Por enquanto é no-op.
  // if (entry.level === "error" && globalThis.Sentry) {
  //   globalThis.Sentry.captureException(entry);
  // }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) =>
    emit(format("debug", msg, ctx)),
  info: (msg: string, ctx?: Record<string, unknown>) =>
    emit(format("info", msg, ctx)),
  warn: (msg: string, ctx?: Record<string, unknown>) =>
    emit(format("warn", msg, ctx)),
  error: (msg: string, err?: unknown, ctx?: Record<string, unknown>) =>
    emit(format("error", msg, ctx, err)),
};
