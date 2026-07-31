import { NextResponse } from "next/server";
import { z } from "zod";
import { analisarIndeferimento, isAnalisadorConfigurado } from "@/lib/ai/indeferimento";
import { AIIndisponivelError } from "@/lib/ai/provider";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recebe o texto da carta e devolve a leitura dela.
 *
 * Nada é gravado: nem o texto, nem o resultado. É dado de saúde (LGPD art. 11)
 * e a análise é entregue na resposta — guardar exigiria base legal e prazo de
 * retenção para nenhum ganho.
 *
 * Pelo mesmo motivo o log de erro NÃO inclui o texto enviado.
 */
const BodySchema = z.object({
  texto: z
    .string()
    .min(80, "Texto curto demais para analisar")
    .max(20_000, "Texto longo demais"),
  consentimento: z.literal(true, {
    errorMap: () => ({ message: "É preciso concordar com o tratamento dos dados" }),
  }),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  // Chamada cara (modelo) e sem autenticação — limite mais apertado que o resto.
  const rl = rateLimit(`analise:indeferimento:${ip}`, {
    max: 8,
    windowMs: 60 * 60_000,
    blockMs: 30 * 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl);

  try {
    // Valida antes de checar configuração: pedido malformado é erro do pedido,
    // independentemente de o serviço estar disponível.
    const { texto } = BodySchema.parse(await req.json());

    if (!isAnalisadorConfigurado()) {
      return NextResponse.json(
        { error: "A análise automática está indisponível no momento." },
        { status: 503 },
      );
    }

    const analise = await analisarIndeferimento(texto);
    return NextResponse.json({ analise });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? "Dados inválidos" },
        { status: 400 },
      );
    }
    // Problema de conta vai com o motivo: mandar "tente de novo" quando falta
    // crédito é conselho errado, e esconde de nós o que precisa ser resolvido.
    if (err instanceof AIIndisponivelError) {
      logger.error("analise.indeferimento indisponivel", err, { motivo: err.motivo });
      return NextResponse.json({ error: err.message, configuracao: true }, { status: 503 });
    }
    // Sem contexto extra de propósito: qualquer campo aqui poderia carregar
    // trecho da carta para o log.
    logger.error("analise.indeferimento falhou", err);
    return NextResponse.json(
      { error: "Não foi possível analisar a carta. Tente de novo em instantes." },
      { status: 400 },
    );
  }
}
