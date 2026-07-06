import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { processAppealGeneration } from "@/lib/appeal-service";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { redactPii } from "@/lib/pii";

/** Endpoint manual para forçar geração (admin ou casos onde o webhook não rodou). */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const ip = getClientIp(req);
  const rl = rateLimit(`gerar:${ip}:${params.id}`, {
    max: 3,
    windowMs: 10 * 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl);
  try {
    const user = await requireUser();
    const appeal = await db.appeal.findUnique({ where: { id: params.id } });
    if (!appeal) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (appeal.userId !== user.id && user.role !== "ADMIN")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    if (appeal.status !== "PAID" && appeal.status !== "FAILED" && user.role !== "ADMIN")
      return NextResponse.json(
        { error: "Pagamento não confirmado" },
        { status: 402 },
      );
    const result = await processAppealGeneration(appeal.id);
    return NextResponse.json({ status: result.status });
  } catch (err) {
    console.error("[gerar.POST]", redactPii(err));
    return NextResponse.json(
      { error: "Falha ao iniciar geração." },
      { status: 500 },
    );
  }
}
