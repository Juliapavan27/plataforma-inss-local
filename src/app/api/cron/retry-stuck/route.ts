import { NextResponse } from "next/server";
import { sweepStuckAppeals } from "@/lib/appeal-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint chamado por cron externo (Railway cron, Vercel cron, GitHub Action).
 * Protegido por CRON_SECRET — passado via header `x-cron-secret` ou
 * `Authorization: Bearer <secret>`.
 *
 * Sugestão de schedule: a cada 5 minutos.
 */
export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET não configurado" },
      { status: 503 },
    );
  }
  const provided =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await sweepStuckAppeals();
    logger.info("cron.sweep concluído", result);
    return NextResponse.json(result);
  } catch (err) {
    logger.error("cron.sweep falhou", err);
    return NextResponse.json({ error: "sweep failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
