import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { readBuffer } from "@/lib/storage";

export async function GET(
  _req: Request,
  { params }: { params: { key: string } },
) {
  try {
    // Exige autenticação para ler qualquer arquivo.
    await requireUser();
    const buf = await readBuffer(decodeURIComponent(params.key));
    return new NextResponse(buf, {
      status: 200,
      headers: { "Content-Type": "application/octet-stream" },
    });
  } catch (err) {
    return new NextResponse("unauthorized", { status: 401 });
  }
}
