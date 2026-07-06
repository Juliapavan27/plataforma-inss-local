/**
 * Orquestrador de geração do recurso.
 * Chamado após confirmação de pagamento (webhook Stripe) ou via job de fila.
 */

import { db } from "./db";
import { generateAppeal, scoreAppeal } from "./ai";
import { buildAppealPdf } from "./docgen/pdf";
import { buildAppealDocx } from "./docgen/docx";
import { saveBuffer } from "./storage";
import { redactPii } from "./pii";
import { logger } from "./logger";
import type { BenefitType, DenialReason } from "./types";

const MAX_ATTEMPTS = 3;
const STUCK_AFTER_MS = 10 * 60_000; // 10 min

async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  attempts = MAX_ATTEMPTS,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      logger.warn(`retry ${label}`, { attempt: i, of: attempts });
      if (i < attempts) {
        const backoff = 500 * Math.pow(2, i - 1) + Math.random() * 250;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastErr;
}

export async function processAppealGeneration(appealId: string) {
  const appeal = await db.appeal.findUnique({
    where: { id: appealId },
    include: { user: true },
  });
  if (!appeal) throw new Error("Recurso não encontrado");
  if (appeal.status === "GENERATING" || appeal.status === "READY") return appeal;

  await db.appeal.update({
    where: { id: appealId },
    data: { status: "GENERATING", generationError: null },
  });

  try {
    const extraFacts = appeal.extraFactsJson
      ? (JSON.parse(appeal.extraFactsJson) as Record<string, unknown>)
      : null;
    const input = {
      fullName: appeal.user.name,
      cpf: appeal.user.cpf ?? "",
      benefitType: appeal.benefitType as BenefitType,
      denialReason: appeal.denialReason as DenialReason,
      denialDate: appeal.denialDate?.toISOString().slice(0, 10) ?? null,
      beneficioNumero: appeal.beneficioNumero ?? null,
      inssProtocolo: appeal.inssProtocolo ?? null,
      caseSummary: appeal.caseSummary,
      extra: extraFacts,
    };

    // 1) redação do recurso (com retry/backoff)
    const t0 = Date.now();
    const draft = await withRetry(() => generateAppeal(input), "drafting");
    await logPhase(appealId, "drafting", {
      model: draft.model,
      promptTokens: draft.promptTokens,
      outputTokens: draft.outputTokens,
      durationMs: draft.durationMs,
      success: true,
    });

    // 2) score paralelo (com retry)
    const scoreResult = await withRetry(() => scoreAppeal(input), "scoring");
    await logPhase(appealId, "scoring", {
      model: scoreResult.model,
      durationMs: scoreResult.durationMs,
      success: true,
    });

    // 3) export PDF/DOCX
    const title = `Recurso Administrativo - ${appeal.user.name}`;
    const [pdfBuf, docxBuf] = await Promise.all([
      buildAppealPdf({ title, body: draft.text }),
      buildAppealDocx({ title, body: draft.text }),
    ]);
    const pdf = await saveBuffer(pdfBuf, {
      filename: `recurso-${appeal.id}.pdf`,
      mimeType: "application/pdf",
    });
    const docx = await saveBuffer(docxBuf, {
      filename: `recurso-${appeal.id}.docx`,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    await logPhase(appealId, "export", {
      durationMs: Date.now() - t0,
      success: true,
    });

    const updated = await db.appeal.update({
      where: { id: appealId },
      data: {
        status: "READY",
        generatedText: draft.text,
        successScore: scoreResult.score,
        scoreRationale: scoreResult.rationale,
        suggestionsJson: JSON.stringify(scoreResult.suggestions),
        pdfUrl: pdf.url,
        docxUrl: docx.url,
        generatedAt: new Date(),
      },
    });
    return updated;
  } catch (err) {
    const safeMessage = redactPii(err);
    await db.appeal.update({
      where: { id: appealId },
      data: { status: "FAILED", generationError: safeMessage },
    });
    await logPhase(appealId, "drafting", {
      success: false,
      errorMessage: safeMessage,
    });
    throw err;
  }
}

async function logPhase(
  appealId: string,
  phase: string,
  data: {
    model?: string;
    promptTokens?: number;
    outputTokens?: number;
    durationMs?: number;
    success: boolean;
    errorMessage?: string;
  },
) {
  await db.generationLog.create({
    data: { appealId, phase, ...data },
  });
}

export function estimateReadyInMinutes() {
  // MVP: estimativa fixa — refinar com média dos últimos N processamentos.
  return 3;
}

/**
 * Sweeper: encontra e reprocessa appeals travados (PAID sem gerar, GENERATING
 * parado há > STUCK_AFTER_MS, ou FAILED com chance de retry).
 * Chamado por /api/cron/retry-stuck.
 */
export async function sweepStuckAppeals(): Promise<{
  scanned: number;
  retried: string[];
}> {
  const stuckBefore = new Date(Date.now() - STUCK_AFTER_MS);
  const candidates = await db.appeal.findMany({
    where: {
      OR: [
        { status: "PAID" },
        { status: "GENERATING", updatedAt: { lt: stuckBefore } },
        { status: "FAILED", updatedAt: { lt: stuckBefore } },
      ],
    },
    select: { id: true, status: true },
    take: 50,
  });

  const retried: string[] = [];
  for (const c of candidates) {
    try {
      // Em FAILED, libera o status para reprocessamento.
      if (c.status === "FAILED" || c.status === "GENERATING") {
        await db.appeal.update({
          where: { id: c.id },
          data: { status: "PAID", generationError: null },
        });
      }
      // Dispara async sem aguardar — sweeper precisa retornar rápido.
      processAppealGeneration(c.id).catch((e) =>
        logger.error("sweep.retry falhou", e, { appealId: c.id }),
      );
      retried.push(c.id);
    } catch (e) {
      logger.error("sweep.kickoff falhou", e, { appealId: c.id });
    }
  }
  return { scanned: candidates.length, retried };
}
