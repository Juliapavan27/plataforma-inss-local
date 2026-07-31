/**
 * Análise da carta de indeferimento do INSS.
 *
 * DECISÕES QUE NÃO PODEM SER REVERTIDAS SEM PENSAR DE NOVO:
 *
 * 1. **Não estimamos chance de êxito.** Nem percentual, nem "alta/baixa", nem
 *    "seu caso é forte". Isso é prognóstico de resultado jurídico, que nem
 *    advogado pode prometer, e a fundadora responde pela OAB. O prompt proíbe
 *    explicitamente, e há uma checagem no retorno.
 *
 * 2. **A carta nunca chega inteira aqui.** O texto é extraído e limpo no
 *    navegador; o servidor ainda redige de novo (defesa em profundidade) antes
 *    de enviar ao modelo. CPF, NB, e-mail e telefone não são necessários para
 *    dizer qual é o motivo da negativa.
 *
 * 3. **Nada é gravado.** Nem o texto, nem a análise. É dado de saúde (LGPD
 *    art. 11); guardar exigiria base legal, prazo de retenção e um motivo — e
 *    não há motivo, a análise é entregue na hora.
 */
import Anthropic from "@anthropic-ai/sdk";
import { limparTextoCarta } from "../carta-inss";
import { MOTIVOS, type MotivoKey } from "../pre-analise";
import { beneficiosNegados } from "@/content/beneficios";

const MODEL = "claude-sonnet-4-5-20250929";

export interface AnaliseIndeferimento {
  /** Slug do benefício identificado, quando reconhecido. */
  beneficioSlug: string | null;
  beneficioNome: string | null;
  motivo: MotivoKey;
  motivoLabel: string;
  /** O que o INSS disse, em linguagem simples. */
  resumoDaNegativa: string;
  /** Data da decisão encontrada no texto, YYYY-MM-DD, se houver. */
  dataDecisao: string | null;
  /** O que costuma ser discutido nesse tipo de negativa. */
  pontosDeDiscussao: string[];
  documentosSugeridos: string[];
  /** Trechos que o modelo não conseguiu interpretar — honestidade sobre limites. */
  observacoes: string | null;
}

const SISTEMA = `Você analisa cartas de indeferimento do INSS para ajudar segurados brasileiros a entender por que o pedido foi negado.

REGRAS ABSOLUTAS — violar qualquer uma torna a resposta inútil:
1. NUNCA estime chance de sucesso, probabilidade, percentual, nem qualifique o caso como forte/fraco/promissor. Não escreva nada que possa ser lido como previsão de resultado.
2. NUNCA afirme que a pessoa tem direito ao benefício. Você identifica o que o INSS decidiu e o que costuma ser discutido, não quem está certo.
3. Se o texto não permitir identificar algo com segurança, diga isso em "observacoes" em vez de inventar.
4. Escreva em português do Brasil, direto e sem jargão. Quem lê acabou de ter um benefício negado e pode não ter estudo formal.
5. O texto pode vir com marcadores como [CPF] ou [NB] no lugar de dados pessoais. Isso é esperado — ignore-os.

Responda APENAS com um objeto JSON válido, sem markdown e sem texto fora dele:
{
  "beneficioSlug": "auxilio-doenca" | "bpc-loas" | "aposentadoria-por-incapacidade" | "aposentadoria-por-idade" | "pensao-por-morte" | "salario-maternidade" | "auxilio-acidente" | null,
  "motivo": "pericia" | "qualidade_segurado" | "carencia" | "renda" | "tempo_contribuicao" | "dependencia" | "documentacao" | "outro",
  "resumoDaNegativa": "1 a 2 frases explicando o que o INSS decidiu e por quê",
  "dataDecisao": "YYYY-MM-DD ou null",
  "pontosDeDiscussao": ["3 a 5 pontos que costumam ser discutidos nesse tipo de negativa"],
  "documentosSugeridos": ["4 a 6 documentos que costumam ser relevantes"],
  "observacoes": "o que não deu para identificar, ou null"
}`;

/** Palavras que denunciam prognóstico de resultado escapando pelo modelo. */
const PROIBIDAS =
  /\b(chance|probabilidade|\d{1,3}\s*%|prov[áa]vel [êe]xito|voc[êe] (vai|deve) (ganhar|conseguir)|caso (forte|fraco|s[óo]lido)|alta[s]? possibilidade)/i;

function limpar(texto: string) {
  // Redação no servidor mesmo já vindo limpo do navegador: se o cliente for
  // contornado, o dado sensível ainda não chega ao modelo.
  return limparTextoCarta(texto).slice(0, 12_000);
}

export function isAnalisadorConfigurado() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function analisarIndeferimento(
  textoCarta: string,
): Promise<AnaliseIndeferimento> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY não configurada");

  const client = new Anthropic({ apiKey: key });
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SISTEMA,
    messages: [
      {
        role: "user",
        content: `Analise esta comunicação de decisão do INSS:\n\n${limpar(textoCarta)}`,
      },
    ],
  });

  const bruto = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim()
    .replace(/^```(?:json)?\s*|\s*```$/g, "");

  let dados: any;
  try {
    dados = JSON.parse(bruto);
  } catch {
    throw new Error("Resposta do modelo não veio em JSON válido");
  }

  const textoTodo = JSON.stringify(dados);
  if (PROIBIDAS.test(textoTodo)) {
    // Preferimos falhar a entregar prognóstico de resultado ao cliente.
    throw new Error("Resposta do modelo continha estimativa de resultado — descartada");
  }

  const motivo: MotivoKey = MOTIVOS.some((m) => m.key === dados.motivo)
    ? dados.motivo
    : "outro";
  const beneficio = beneficiosNegados.find((b) => b.slug === dados.beneficioSlug) ?? null;

  return {
    beneficioSlug: beneficio?.slug ?? null,
    beneficioNome: beneficio?.nome ?? null,
    motivo,
    motivoLabel: MOTIVOS.find((m) => m.key === motivo)!.label,
    resumoDaNegativa: String(dados.resumoDaNegativa ?? "").slice(0, 600),
    dataDecisao:
      typeof dados.dataDecisao === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dados.dataDecisao)
        ? dados.dataDecisao
        : null,
    pontosDeDiscussao: (Array.isArray(dados.pontosDeDiscussao) ? dados.pontosDeDiscussao : [])
      .slice(0, 6)
      .map((x: unknown) => String(x).slice(0, 300)),
    documentosSugeridos: (Array.isArray(dados.documentosSugeridos)
      ? dados.documentosSugeridos
      : []
    )
      .slice(0, 8)
      .map((x: unknown) => String(x).slice(0, 200)),
    observacoes: dados.observacoes ? String(dados.observacoes).slice(0, 400) : null,
  };
}
