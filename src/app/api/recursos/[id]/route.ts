import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const appeal = await db.appeal.findUnique({
      where: { id: params.id },
      include: { payment: true, documents: true },
    });
    if (!appeal) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (appeal.userId !== user.id && user.role !== "ADMIN")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    return NextResponse.json(appeal);
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
