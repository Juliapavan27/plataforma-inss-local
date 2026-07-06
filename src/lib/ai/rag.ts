import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import type { BenefitType, DenialReason } from "../types";

/**
 * Retrieval simples para RAG — versão SQLite.
 * Tags são armazenadas como JSON string; fazemos LIKE no JSON para match.
 * Para produção com Postgres, volte a usar `tags: { hasSome: tags }`.
 */
export async function retrieveKnowledge(opts: {
  benefitType: BenefitType;
  denialReason: DenialReason;
  query: string;
  topK?: number;
}): Promise<string> {
  const topK = opts.topK ?? 6;

  const tags = [opts.benefitType, opts.denialReason, "TODOS"];
  // Faz um OR com LIKE '%tag%' no JSON das tags.
  const orClauses = tags.map((t) => ({
    tagsJson: { contains: `"${t}"` },
  }));

  const entries = await db.knowledgeEntry.findMany({
    where: { OR: orClauses },
    take: topK,
  });

  return entries
    .map((e) => `[${e.kind} — ${e.title}]\n${e.content.slice(0, 2000)}`)
    .join("\n\n---\n\n");
}

// Export do client Anthropic para eventual uso futuro (embeddings custom, etc.)
export function anthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}
