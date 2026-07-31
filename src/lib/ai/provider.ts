/**
 * Camada única de acesso ao modelo.
 *
 * O site usa IA em dois lugares (a Sofia e o analisador de indeferimento) e
 * não deve depender de um fornecedor específico: quem estiver configurado
 * atende. A ordem é Anthropic > Gemini, e nenhum dos dois é obrigatório —
 * sem chave alguma, quem chama decide o que fazer (a Sofia cai para respostas
 * fixas, o analisador informa indisponibilidade).
 */
import Anthropic from "@anthropic-ai/sdk";

export type Provedor = "anthropic" | "gemini" | null;

/**
 * Falha que depende de conta/faturamento, não de código nem do texto enviado.
 * Separada para a interface poder dizer o que houve em vez de mandar a pessoa
 * "tentar de novo em instantes" — o que, sem crédito, nunca vai funcionar.
 */
export class AIIndisponivelError extends Error {
  constructor(
    readonly motivo: "sem_credito" | "chave_invalida" | "limite_excedido",
    message: string,
  ) {
    super(message);
    this.name = "AIIndisponivelError";
  }
}

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";

export function provedorAtivo(): Provedor {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

export function isAIDisponivel() {
  return provedorAtivo() !== null;
}

export interface GerarOpts {
  system: string;
  user: string;
  maxTokens?: number;
  /** Baixa por padrão: as duas usos são extração e resposta factual. */
  temperature?: number;
}

/** Gera texto com o provedor configurado. Lança se nenhum estiver disponível. */
export async function gerarTexto(opts: GerarOpts): Promise<string> {
  const provedor = provedorAtivo();
  if (provedor === "anthropic") return gerarAnthropic(opts);
  if (provedor === "gemini") return gerarGemini(opts);
  throw new Error("Nenhum provedor de IA configurado");
}

async function gerarAnthropic({ system, user, maxTokens, temperature }: GerarOpts) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const res = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens ?? 1500,
    temperature: temperature ?? 0.2,
    system,
    messages: [{ role: "user", content: user }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/**
 * Chamada REST direta, sem SDK.
 *
 * O SDK do Gemini traz dependências que só usaríamos para isto, e o contrato
 * do endpoint é estável o suficiente para não compensar.
 */
async function gerarGemini({ system, user, maxTokens, temperature }: GerarOpts) {
  const key = process.env.GEMINI_API_KEY!;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      cache: "no-store",
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          temperature: temperature ?? 0.2,
          maxOutputTokens: maxTokens ?? 1500,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const corpo = (await res.text().catch(() => "")).replace(key, "[CHAVE]");

    if (/prepayment credits|billing|quota|RESOURCE_EXHAUSTED/i.test(corpo)) {
      throw new AIIndisponivelError(
        /prepayment credits|billing/i.test(corpo) ? "sem_credito" : "limite_excedido",
        /prepayment credits|billing/i.test(corpo)
          ? "A conta do Gemini está sem crédito. Adicione saldo no Google AI Studio para reativar a análise."
          : "O limite de uso do Gemini foi atingido. Tente novamente mais tarde.",
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new AIIndisponivelError(
        "chave_invalida",
        "A chave do Gemini foi recusada. Confira a variável GEMINI_API_KEY.",
      );
    }
    // A chave pode aparecer na URL de erro do Google — nunca propagar o corpo cru.
    throw new Error(`Gemini respondeu ${res.status}: ${corpo.slice(0, 300)}`);
  }

  const data = await res.json();
  const texto = data?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text ?? "")
    .join("");

  if (!texto) {
    // Resposta vazia costuma ser bloqueio do filtro de segurança do Google —
    // que dispara com facilidade em texto clínico, comum numa carta do INSS.
    const motivo = data?.candidates?.[0]?.finishReason ?? data?.promptFeedback?.blockReason;
    throw new Error(`Gemini não retornou texto${motivo ? ` (${motivo})` : ""}`);
  }
  return texto;
}
