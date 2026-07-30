/**
 * Token de acesso à página de pagamento.
 *
 * O formulário aceita pedidos de quem não tem conta (o usuário é criado como
 * lead durante o envio), então a página de pagamento não pode exigir login —
 * seria travar a compra. Mas ela também não pode ser aberta só com o appealId,
 * que é um cuid previsível o suficiente para não servir de segredo.
 *
 * Então a URL carrega um token assinado com NEXTAUTH_SECRET e com validade
 * curta. Quem tem sessão e é dono do pedido entra sem token.
 */
import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 24 * 60 * 60_000;

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET ausente — não é possível assinar o token de pagamento");
  return s;
}

function sign(appealId: string, expiresAt: number) {
  return createHmac("sha256", secret())
    .update(`${appealId}.${expiresAt}`)
    .digest("base64url");
}

export function createPaymentToken(appealId: string, ttlMs: number = TTL_MS): string {
  const expiresAt = Date.now() + ttlMs;
  return `${expiresAt}.${sign(appealId, expiresAt)}`;
}

export function verifyPaymentToken(appealId: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const [rawExpiry, signature] = token.split(".");
  const expiresAt = Number(rawExpiry);
  if (!Number.isFinite(expiresAt) || !signature) return false;
  if (Date.now() > expiresAt) return false;

  const expected = Buffer.from(sign(appealId, expiresAt), "utf8");
  const got = Buffer.from(signature, "utf8");
  return expected.length === got.length && timingSafeEqual(expected, got);
}
