import { NextResponse } from "next/server";

/** Valida o header x-cron-secret / Authorization: Bearer contra CRON_SECRET. */
export function checkCronAuth(req: Request): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 503 });
  }
  const provided =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
