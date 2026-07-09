import { NextResponse } from "next/server";
import { sweepAbandonedCarts } from "@/lib/appeal-service";
import { logger } from "@/lib/logger";
import { checkCronAuth } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint chamado por cron externo (Railway cron, Vercel cron, GitHub Action).
 * Protegido por CRON_SECRET — passado via header `x-cron-secret` ou
 * `Authorization: Bearer <secret>`.
 *
 * Sugestão de schedule: a cada 30 minutos.
 */
export async function POST(req: Request) {
  const authError = checkCronAuth(req);
  if (authError) return authError;
  try {
    const result = await sweepAbandonedCarts();
    logger.info("cron.abandonedCart concluído", result);
    return NextResponse.json(result);
  } catch (err) {
    logger.error("cron.abandonedCart falhou", err);
    return NextResponse.json({ error: "sweep failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
