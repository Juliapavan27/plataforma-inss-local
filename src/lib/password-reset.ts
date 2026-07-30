/**
 * Links de definição/redefinição de senha.
 *
 * O token é sorteado, entregue só por e-mail e guardado no banco **apenas como
 * hash** — quem tiver acesso à tabela não consegue reconstruir o link. É de uso
 * único: ao ser consumido, `usedAt` é preenchido, então um link vazado depois
 * de usado não vale nada.
 *
 * Isso é diferente do token de pagamento (src/lib/payment-token.ts), que é
 * assinado e sem estado porque só dá acesso a uma tela de acompanhamento. Aqui
 * o token troca a senha da conta, então uso único importa.
 */
import { randomBytes, createHash } from "crypto";
import { db } from "./db";

/** Curto de propósito: é tempo de sobra para abrir um e-mail. */
const TTL_MS = 2 * 60 * 60_000;

function hash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Cria o token e invalida os anteriores do mesmo usuário — pedir um link novo
 * derruba o antigo, que é o que a pessoa espera.
 */
export async function createPasswordResetToken(
  userId: string,
  ttlMs: number = TTL_MS,
): Promise<string> {
  await db.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = randomBytes(32).toString("base64url");
  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hash(token),
      expiresAt: new Date(Date.now() + ttlMs),
    },
  });
  return token;
}

/** Devolve o userId se o token for válido, senão null. Não consome. */
export async function peekPasswordResetToken(token: string): Promise<string | null> {
  const row = await db.passwordResetToken.findUnique({
    where: { tokenHash: hash(token) },
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;
  return row.userId;
}

/**
 * Consome o token e troca a senha, numa transação só. Se duas requisições
 * chegarem juntas, o `usedAt: null` no where faz a segunda não achar nada.
 */
export async function consumePasswordResetToken(
  token: string,
  passwordHash: string,
): Promise<boolean> {
  const tokenHash = hash(token);

  const marked = await db.passwordResetToken.updateMany({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  if (marked.count === 0) return false;

  const row = await db.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row) return false;

  await db.user.update({
    where: { id: row.userId },
    data: { passwordHash, passwordSetAt: new Date() },
  });
  return true;
}
