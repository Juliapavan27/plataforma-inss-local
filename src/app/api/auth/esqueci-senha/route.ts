import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendPasswordSetupEmail } from "@/lib/email";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const BodySchema = z.object({ email: z.string().email() });

/**
 * Pede o link de senha por e-mail.
 *
 * Responde sempre a mesma coisa, exista a conta ou não: se respondesse
 * diferente, qualquer pessoa poderia descobrir quem é cliente daqui só
 * testando e-mails — e a lista de clientes é gente que teve benefício negado
 * pelo INSS, informação sensível.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`senha:pedido:${ip}`, {
    max: 5,
    windowMs: 60 * 60_000,
    blockMs: 30 * 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl);

  const ok = NextResponse.json({ ok: true });

  try {
    const { email } = BodySchema.parse(await req.json());
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true, passwordSetAt: true },
    });
    if (!user) return ok;

    const token = await createPasswordResetToken(user.id);
    await sendPasswordSetupEmail({
      to: user.email,
      name: user.name,
      url: `${process.env.APP_URL}/definir-senha?token=${encodeURIComponent(token)}`,
      firstTime: user.passwordSetAt === null,
    });
    return ok;
  } catch (err) {
    // Falha nossa também sai como sucesso, pelo mesmo motivo acima.
    logger.error("esqueci-senha falhou", err);
    return ok;
  }
}
