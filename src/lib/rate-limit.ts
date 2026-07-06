/**
 * Rate limiter in-memory (sliding window). Funciona para instância única
 * (deploy padrão Railway/Vercel single-region). Quando escalar para múltiplas
 * instâncias, trocar a implementação interna por Upstash Redis mantendo a API.
 */

type Bucket = { hits: number[]; blockedUntil?: number };

const store = new Map<string, Bucket>();

// Limpeza periódica para evitar leak de memória.
const SWEEP_MS = 60_000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_MS) return;
  lastSweep = now;
  for (const [key, b] of store) {
    if (b.blockedUntil && b.blockedUntil < now) b.blockedUntil = undefined;
    b.hits = b.hits.filter((t) => now - t < 60 * 60_000);
    if (b.hits.length === 0 && !b.blockedUntil) store.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec?: number;
};

/**
 * @param key  identificador (ex.: "login:1.2.3.4" ou "register:email:foo@bar")
 * @param max  máximo de hits permitidos na janela
 * @param windowMs  tamanho da janela em ms
 * @param blockMs  opcional: se exceder, bloqueia por X ms adicionais
 */
export function rateLimit(
  key: string,
  opts: { max: number; windowMs: number; blockMs?: number },
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  let bucket = store.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    store.set(key, bucket);
  }

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }

  bucket.hits = bucket.hits.filter((t) => now - t < opts.windowMs);

  if (bucket.hits.length >= opts.max) {
    if (opts.blockMs) bucket.blockedUntil = now + opts.blockMs;
    const oldest = bucket.hits[0];
    const retryAfterSec = Math.ceil(
      (opts.blockMs ?? opts.windowMs - (now - oldest)) / 1000,
    );
    return { ok: false, remaining: 0, retryAfterSec };
  }

  bucket.hits.push(now);
  return { ok: true, remaining: opts.max - bucket.hits.length };
}

/** Extrai um IP "razoável" de Request (Vercel/Railway expõem via headers). */
export function getClientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    h.get("x-real-ip") ??
    h.get("cf-connecting-ip") ??
    h.get("x-client-ip") ??
    "unknown"
  );
}

/** Resposta padronizada 429. */
export function tooManyRequests(result: RateLimitResult) {
  const headers: Record<string, string> = {};
  if (result.retryAfterSec) headers["Retry-After"] = String(result.retryAfterSec);
  return new Response(
    JSON.stringify({
      error: "Muitas requisições. Tente novamente em instantes.",
    }),
    {
      status: 429,
      headers: { ...headers, "Content-Type": "application/json" },
    },
  );
}
