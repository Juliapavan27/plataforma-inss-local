import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(2),
  kind: z.enum(["JURISPRUDENCIA", "DOUTRINA", "LEGISLACAO", "MODELO_RECURSO", "OUTRO"]),
  content: z.string().min(10),
  sourceUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());
    const entry = await db.knowledgeEntry.create({
      data: {
        title: body.title,
        kind: body.kind,
        content: body.content,
        sourceUrl: body.sourceUrl ?? undefined,
        tagsJson: JSON.stringify(body.tags ?? []),
      },
    });
    return NextResponse.json(entry);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro" },
      { status: 400 },
    );
  }
}
