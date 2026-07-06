import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { redactPii } from "@/lib/pii";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`register:${ip}`, {
    max: 5,
    windowMs: 60 * 60_000,
    blockMs: 15 * 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl);
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const exists = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (exists) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 409 },
      );
    }
    const passwordHash = await hashPassword(data.password);
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    });
    return NextResponse.json(user);
  } catch (err) {
    console.error("[register.POST]", redactPii(err));
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro." },
      { status: 400 },
    );
  }
}
