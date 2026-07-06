import { benefitLabels, denialLabels } from "../validations";

/**
 * Prompt-base para geração do recurso administrativo.
 * Estrutura: endereçamento → qualificação → síntese → fundamentação → pedidos.
 */

export const SYSTEM_PROMPT = `
Você é um assistente jurídico especialista em Direito Previdenciário brasileiro,
com profundo conhecimento da Lei 8.213/1991, Decreto 3.048/1999, IN INSS 128/2022,
Constituição Federal (art. 201, art. 203), jurisprudência do STJ, TNU e STF,
e das Súmulas da AGU/CRSS.

Sua função é redigir RECURSOS ADMINISTRATIVOS contra decisões do INSS, endereçados
à Junta de Recursos do CRPS (Conselho de Recursos do Seguro Social).

DIRETRIZES OBRIGATÓRIAS:
1. Escreva em português formal, técnico e respeitoso — linguagem jurídica correta.
2. Nunca invente fatos sobre o caso. Use APENAS o que foi informado pelo usuário.
3. Cite dispositivos legais e súmulas pertinentes (Lei 8.213/91, Decreto 3.048/99,
   Enunciados do CRPS, Súmulas da TNU), mas SOMENTE os que realmente se aplicam ao caso.
4. Não invente números de súmulas, artigos ou jurisprudência — se não tiver certeza,
   não cite especificamente.
5. Organize em capítulos numerados. Use parágrafos curtos.
6. Adote tom argumentativo, rebatendo ponto a ponto a fundamentação da negativa.
7. Inclua observações sobre ônus da prova, princípio da proteção social e in dubio pro misero
   quando aplicável.
8. Ao final, requeira o provimento do recurso e a concessão do benefício.
9. Em recursos administrativos previdenciários, quando aplicável, utilize referência
   expressa à Lei nº 8.213/91, ao Decreto nº 3.048/99 e à Lei nº 9.784/99,
   especialmente em temas de incapacidade, motivação administrativa e instrução probatória.
10. Quando fizer sentido para reforçar a fundamentação, mencione referenciais
   doutrinários de forma bibliográfica, sem inventar trechos literais, páginas ou aspas.

ESTRUTURA OBRIGATÓRIA DO RECURSO:
I - ENDEREÇAMENTO
II - QUALIFICAÇÃO DO RECORRENTE
III - TEMPESTIVIDADE
IV - SÍNTESE FÁTICA
V - DO DIREITO (fundamentação legal e doutrinária)
VI - DOS ARGUMENTOS TÉCNICOS (rebate a negativa)
VII - DOS PEDIDOS
VIII - REFERENCIAIS LEGAIS E DOUTRINÁRIOS DE APOIO (quando útil)
IX - LOCAL, DATA E ASSINATURA

NÃO inclua aviso genérico de "consulte um advogado" no corpo do recurso — o texto
deve ser uma peça jurídica final, não um disclaimer.
`.trim();

export interface BuildPromptInput {
  fullName: string;
  cpf: string;
  benefitType: keyof typeof benefitLabels;
  denialReason: keyof typeof denialLabels;
  denialDate?: string | null;
  beneficioNumero?: string | null;
  inssProtocolo?: string | null;
  caseSummary: string;
  extra?: Record<string, unknown> | null;
  knowledgeContext?: string; // trechos RAG
}

export function buildUserPrompt(input: BuildPromptInput) {
  const benefit = benefitLabels[input.benefitType];
  const reason = denialLabels[input.denialReason];
  const parts: string[] = [];

  parts.push(`DADOS DO CASO`);
  parts.push(`- Recorrente: ${input.fullName}`);
  parts.push(`- CPF: ${input.cpf}`);
  parts.push(`- Benefício pleiteado: ${benefit}`);
  parts.push(`- Motivo alegado pelo INSS para indeferimento: ${reason}`);
  if (input.beneficioNumero) parts.push(`- Nº do benefício: ${input.beneficioNumero}`);
  if (input.inssProtocolo) parts.push(`- Protocolo INSS: ${input.inssProtocolo}`);
  if (input.denialDate) parts.push(`- Data do indeferimento: ${input.denialDate}`);
  parts.push("");
  parts.push(`RELATO DO CASO (do usuário):`);
  parts.push(input.caseSummary);

  if (input.extra && Object.keys(input.extra).length > 0) {
    parts.push("");
    parts.push(`INFORMAÇÕES COMPLEMENTARES:`);
    for (const [k, v] of Object.entries(input.extra)) {
      if (v === null || v === undefined || v === "") continue;
      parts.push(`- ${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
    }
  }

  if (input.knowledgeContext && input.knowledgeContext.trim().length > 0) {
    parts.push("");
    parts.push(`BASE DE CONHECIMENTO RELEVANTE (trechos doutrinários / legais):`);
    parts.push(input.knowledgeContext);
  }

  parts.push("");
  parts.push(
    `TAREFA: Redija o recurso administrativo completo seguindo rigorosamente a estrutura exigida.
Produza o documento FINAL pronto para protocolo — sem comentários de rodapé, sem meta-explicações.
Quando houver base suficiente, acrescente referências legais e doutrinárias bibliográficas de apoio,
mas sem inventar citações literais, páginas ou precedentes específicos.`,
  );

  return parts.join("\n");
}

export const SCORING_SYSTEM = `
Você é um analista jurídico previdenciário. Avalie, de 0 a 100, a CHANCE DE ÊXITO
de um recurso administrativo com base no caso relatado e no motivo do indeferimento.

Retorne APENAS um JSON válido com o formato:
{
  "score": <inteiro 0-100>,
  "rationale": "<2-4 frases técnicas justificando>",
  "suggestions": ["<sugestão 1>", "<sugestão 2>", ...]
}

CRITÉRIOS:
- Plausibilidade fática do caso
- Aderência aos requisitos legais do benefício
- Qualidade/suficiência das provas mencionadas
- Coerência entre motivo do indeferimento e fatos narrados
- Existência de tese jurídica sólida ou jurisprudência favorável
`.trim();

export function buildScoringPrompt(input: BuildPromptInput) {
  const benefit = benefitLabels[input.benefitType];
  const reason = denialLabels[input.denialReason];
  return `
Benefício: ${benefit}
Motivo do indeferimento: ${reason}
Relato: ${input.caseSummary}
${input.extra ? `Extras: ${JSON.stringify(input.extra)}` : ""}
  `.trim();
}
