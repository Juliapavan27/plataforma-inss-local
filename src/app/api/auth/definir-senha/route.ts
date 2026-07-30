import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { consumePasswordResetToken } from "@/lib/password-reset";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const BodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Mínimo de 8 caracteres").max(200),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`senha:definir:${ip}`, {
    max: 10,
    windowMs: 60 * 60_000,
    blockMs: 30 * 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl);

  try {
    const { token, password } = BodySchema.parse(await req.json());
    const ok = await consumePasswordResetToken(token, await hashPassword(password));

    if (!ok) {
      return NextResponse.json(
        { error: "Este link expirou ou já foi usado. Peça um novo." },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? "Senha inválida." },
        { status: 400 },
      );
    }
    logger.error("definir-senha falhou", err);
    return NextResponse.json(
      { error: "Não foi possível definir a senha. Tente novamente." },
      { status: 400 },
    );
  }
}
