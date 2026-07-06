import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  type BuildPromptInput,
  SCORING_SYSTEM,
  buildScoringPrompt,
} from "./prompts";
import { retrieveKnowledge } from "./rag";
import { benefitLabels, denialLabels } from "../validations";

const MODEL = "claude-opus-4-6";
const SCORING_MODEL = "claude-haiku-4-5-20251001";

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY não configurada");
  return new Anthropic({ apiKey: key });
}

export interface AIGenerationResult {
  text: string;
  promptTokens: number;
  outputTokens: number;
  model: string;
  durationMs: number;
}

/**
 * Gera o recurso administrativo completo usando Claude.
 * Faz retrieval da base de conhecimento (RAG) e depois drafting.
 */
export async function generateAppeal(
  input: Omit<BuildPromptInput, "knowledgeContext">,
): Promise<AIGenerationResult> {
  const start = Date.now();
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      text: buildFallbackAppeal(input),
      promptTokens: 0,
      outputTokens: 0,
      model: "fallback-template",
      durationMs: Date.now() - start,
    };
  }

  const client = getClient();

  // 1) RAG — buscar trechos relevantes
  const knowledgeContext = await retrieveKnowledge({
    benefitType: input.benefitType,
    denialReason: input.denialReason,
    query: input.caseSummary,
    topK: 6,
  });

  // 2) Drafting
  const userPrompt = buildUserPrompt({ ...input, knowledgeContext });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("\n");

  return {
    text,
    promptTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
    model: MODEL,
    durationMs: Date.now() - start,
  };
}

export interface AIScoreResult {
  score: number;
  rationale: string;
  suggestions: string[];
  durationMs: number;
  model: string;
}

export async function scoreAppeal(
  input: BuildPromptInput,
): Promise<AIScoreResult> {
  const start = Date.now();
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      score: 50,
      rationale:
        "Pontuação neutra em modo local, pois a análise automatizada detalhada depende da configuração da chave de IA.",
      suggestions: buildFallbackSuggestions(input),
      durationMs: Date.now() - start,
      model: "fallback-template",
    };
  }

  const client = getClient();
  const response = await client.messages.create({
    model: SCORING_MODEL,
    max_tokens: 800,
    temperature: 0.2,
    system: SCORING_SYSTEM,
    messages: [{ role: "user", content: buildScoringPrompt(input) }],
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();

  // Extrai o JSON — às vezes o modelo envolve em blocos de código.
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  let parsed: { score: number; rationale: string; suggestions: string[] };
  try {
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    parsed = {
      score: 50,
      rationale: "Não foi possível calcular o score automaticamente.",
      suggestions: [],
    };
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 50))),
    rationale: parsed.rationale ?? "",
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    durationMs: Date.now() - start,
    model: SCORING_MODEL,
  };
}

export function isAIConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function buildFallbackAppeal(input: Omit<BuildPromptInput, "knowledgeContext">) {
  const benefit = benefitLabels[input.benefitType];
  const denial = denialLabels[input.denialReason];
  const today = new Date().toLocaleDateString("pt-BR");
  const denialDate = input.denialDate ?? "data não informada";
  const benefitNumber = input.beneficioNumero ?? "não informado";
  const protocol = input.inssProtocolo ?? "não informado";
  const extras = formatExtraFacts(input.extra);
  const applicantLabel = endsWithFemaleName(input.fullName) ? "A recorrente" : "O recorrente";

  const legalBasis = getLegalBasis(input);
  const rebuttal = getRebuttal(input);
  const legalReferences = getLegalReferences(input);
  const doctrinalReferences = getDoctrinalReferences(input);
  const finalRequests = getFinalRequests(input, benefit);

  return `
PLATAFORMA INSS
RECURSO ADMINISTRATIVO PREVIDENCIÁRIO

ILUSTRÍSSIMOS(AS) SENHORES(AS) CONSELHEIROS(AS) DA JUNTA DE RECURSOS DO CONSELHO DE RECURSOS DA PREVIDÊNCIA SOCIAL

I - ENDEREÇAMENTO

Recurso administrativo interposto em face de decisão do INSS que indeferiu o pedido de ${benefit}.

II - QUALIFICAÇÃO DO RECORRENTE

${input.fullName}, inscrito(a) no CPF sob o nº ${input.cpf}, vem, com o devido respeito, apresentar RECURSO ADMINISTRATIVO em razão do indeferimento do benefício nº ${benefitNumber}, protocolo ${protocol}.

III - TEMPESTIVIDADE

O presente recurso é apresentado dentro do prazo legal de 30 dias contado da ciência da decisão administrativa, considerando a data de indeferimento informada (${denialDate}).

IV - SÍNTESE FÁTICA

${applicantLabel} requereu o benefício de ${benefit}, porém o INSS indeferiu o pedido sob o fundamento de ${denial.toLowerCase()}.

No relato apresentado, ${applicantLabel.toLowerCase()} informa que:

${input.caseSummary}

${extras ? `Informações complementares relevantes:\n${extras}\n\n` : ""}V - DO DIREITO

${legalBasis}

VI - DOS ARGUMENTOS TÉCNICOS

${rebuttal}

${getClosingTechnicalParagraph(input)}

VII - DOS PEDIDOS

Diante do exposto, requer:

${finalRequests}

VIII - REFERENCIAIS LEGAIS E DOUTRINÁRIOS DE APOIO

Referenciais normativos:
${legalReferences}

Referenciais doutrinários:
${doctrinalReferences}

IX - LOCAL, DATA E ASSINATURA

Termos em que,
Pede deferimento.

${today}

${input.fullName}
`.trim();
}

function buildFallbackSuggestions(input: BuildPromptInput) {
  const suggestions = [
    "Revise se a carta de indeferimento do INSS está anexada ao pedido.",
    "Confira se os dados do benefício e do protocolo foram informados corretamente.",
  ];

  if (input.benefitType === "AUXILIO_DOENCA" || input.benefitType === "APOSENTADORIA_INVALIDEZ") {
    suggestions.push("Junte laudos, exames recentes e atestados que detalhem a incapacidade e a limitação para o trabalho.");
  }

  if (input.denialReason === "DOC_INSUFICIENTE") {
    suggestions.push("Reforce o conjunto documental com comprovantes que ataquem diretamente o motivo da negativa.");
  }

  return suggestions;
}

function formatExtraFacts(extra?: Record<string, unknown> | null) {
  if (!extra) return "";
  const lines = Object.entries(extra)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      const label = key
        .replaceAll("_", " ")
        .replaceAll("condicao medica", "condição médica")
        .replaceAll("historico contribuicoes", "histórico de contribuições")
        .replaceAll("limitacoes funcionais", "limitações funcionais")
        .replaceAll("categoria segurado", "categoria previdenciária")
        .replaceAll("periodo graca contexto", "contexto do período de graça")
        .replaceAll("renda familiar", "renda familiar")
        .replaceAll("despesas essenciais", "despesas essenciais")
        .replaceAll("relacao falecido", "relação com o falecido")
        .replaceAll("provas dependencia", "provas de dependência ou vínculo")
        .replaceAll("documentos que inss apontou como ausentes", "documentos apontados como ausentes pelo INSS")
        .replaceAll("pontos ignorados pelo inss", "pontos que o INSS deixou de analisar")
        .replaceAll("possui laudo medico", "possui laudo médico");
      const formattedValue =
        typeof value === "boolean" ? (value ? "Sim" : "Não") : String(value);
      return `- ${label}: ${formattedValue}`;
    });

  return lines.join("\n");
}

function getLegalBasis(input: Omit<BuildPromptInput, "knowledgeContext">) {
  if (
    input.benefitType === "SALARIO_MATERNIDADE" &&
    input.denialReason === "NAO_CUMPRIMENTO_CARENCIA"
  ) {
    return "No caso do salário-maternidade, a análise da carência deve observar a disciplina específica da Lei nº 8.213/91 para a categoria de segurada envolvida, sem transposição automática de regras incompatíveis com o benefício requerido. A conclusão administrativa sobre insuficiência de carência precisa enfrentar o histórico contributivo, a condição previdenciária da requerente e a regra legal efetivamente aplicável ao caso concreto, sempre com motivação clara e verificável.";
  }

  if (
    input.benefitType === "SALARIO_MATERNIDADE" &&
    input.denialReason === "FALTA_QUALIDADE_SEGURADO"
  ) {
    return "A manutenção da qualidade de segurada, para fins de salário-maternidade, deve ser apreciada à luz do art. 15 da Lei nº 8.213/91 e das regras específicas do benefício, com atenção aos períodos de graça, ao histórico contributivo e à categoria previdenciária da requerente. A negativa administrativa não pode presumir perda da qualidade de segurada sem exame individualizado dos vínculos e recolhimentos pertinentes.";
  }

  if (
    input.benefitType === "PENSAO_MORTE" &&
    input.denialReason === "DOC_INSUFICIENTE"
  ) {
    return "Em pedidos de pensão por morte, a análise documental deve considerar a finalidade probatória de certidões, documentos civis, comprovantes de vínculo familiar, dependência econômica e elementos aptos a demonstrar a condição jurídica alegada pelo requerente. À luz da Lei nº 9.784/99, a Administração deve motivar com precisão eventual insuficiência da prova e, quando cabível, oportunizar complementação instrutória antes de manter o indeferimento.";
  }

  if (
    input.benefitType === "PENSAO_MORTE" &&
    input.denialReason === "VINCULO_NAO_COMPROVADO"
  ) {
    return "Nos pedidos de pensão por morte, a comprovação do vínculo ou da união estável deve ser apreciada a partir do conjunto probatório disponível, sem exigência de prova impossível ou leitura fragmentada dos elementos apresentados. A análise administrativa deve enfrentar de modo concreto os documentos, indícios e circunstâncias que sustentem a qualidade de dependente, observando a finalidade protetiva do benefício.";
  }

  if (input.denialReason === "NAO_CUMPRIMENTO_CARENCIA") {
    return "A análise de carência deve observar os arts. 24, 25 e, quando pertinente, 27-A da Lei nº 8.213/91, além das regras regulamentares aplicáveis. Em matéria previdenciária, a conclusão sobre insuficiência de carência exige exame preciso do histórico contributivo, da espécie de segurado, dos períodos efetivamente computáveis e da eventual necessidade de novo cômputo após perda da qualidade de segurado, sempre com motivação administrativa concreta e verificável.";
  }

  if (input.denialReason === "FALTA_QUALIDADE_SEGURADO") {
    return "A manutenção e a perda da qualidade de segurado devem ser apreciadas à luz do art. 15 da Lei nº 8.213/91 e da regulamentação correlata, com atenção aos períodos de graça, às hipóteses legais de prorrogação e à sequência contributiva efetivamente demonstrada no histórico do requerente. A decisão administrativa não pode presumir a perda da qualidade de segurado sem enfrentamento específico do contexto contributivo e dos elementos constantes do processo.";
  }

  if (input.denialReason === "DOC_INSUFICIENTE") {
    return "Nos casos em que a negativa se apoia em alegada insuficiência documental, a Administração deve observar os deveres de adequada instrução, motivação e busca da verdade material, em consonância com a Lei nº 9.784/99. Em matéria previdenciária, a análise não se esgota em conclusão genérica sobre ausência de prova, sendo necessário apontar de forma objetiva quais elementos faltaram, qual a relevância deles para o caso e se caberia complementação instrutória antes da manutenção do indeferimento.";
  }

  if (input.benefitType === "BPC_LOAS") {
    return "O benefício assistencial deve ser analisado à luz do art. 203, V, da Constituição Federal, do art. 20 da Lei nº 8.742/93 e do Decreto nº 6.214/2007, com apreciação concreta da vulnerabilidade social e das provas efetivamente produzidas no processo administrativo. A decisão administrativa deve refletir exame individualizado do contexto socioeconômico e das informações apresentadas pelo requerente, observando também os deveres de motivação e adequada instrução do processo administrativo.";
  }

  if (input.benefitType === "AUXILIO_DOENCA" || input.benefitType === "APOSENTADORIA_INVALIDEZ") {
    return "O benefício por incapacidade temporária é devido ao segurado que, cumpridos os requisitos legais, ficar incapacitado para o seu trabalho ou para sua atividade habitual por mais de 15 dias consecutivos, nos termos dos arts. 59 e 60 da Lei nº 8.213/91 e do Regulamento da Previdência Social. Em hipóteses dessa natureza, a análise administrativa deve considerar o conjunto probatório apresentado, inclusive laudos, exames, atestados e o histórico funcional do requerente, não sendo suficiente afastar o direito apenas com conclusão genérica desacompanhada de enfrentamento concreto dos elementos trazidos ao processo. Também se aplica, no plano procedimental, a exigência de motivação, instrução adequada e busca da verdade material, em consonância com a Lei nº 9.784/99.";
  }

  return "O pedido administrativo deve ser apreciado à luz da Lei nº 8.213/91, do Decreto nº 3.048/99 e das regras aplicáveis ao benefício requerido, observando-se análise integral dos fatos, das provas apresentadas e da motivação concreta da negativa. A instância recursal existe precisamente para corrigir decisões insuficientemente fundamentadas ou que não enfrentam adequadamente o conjunto do caso.";
}

function getRebuttal(input: Omit<BuildPromptInput, "knowledgeContext">) {
  if (
    input.benefitType === "SALARIO_MATERNIDADE" &&
    input.denialReason === "NAO_CUMPRIMENTO_CARENCIA"
  ) {
    return "No caso concreto, a negativa por carência insuficiente precisa ser reavaliada à luz das regras específicas do salário-maternidade e da situação previdenciária efetivamente narrada pela requerente. A instância recursal deve verificar se o INSS aplicou corretamente a disciplina legal pertinente à categoria segurada envolvida e se os vínculos ou recolhimentos informados foram devidamente considerados na análise administrativa.";
  }

  if (
    input.benefitType === "SALARIO_MATERNIDADE" &&
    input.denialReason === "FALTA_QUALIDADE_SEGURADO"
  ) {
    return "A negativa por falta de qualidade de segurada demanda exame individualizado do histórico contributivo e dos períodos legalmente aptos à manutenção da proteção previdenciária. Se a decisão administrativa não enfrentou de forma específica os vínculos, recolhimentos e o enquadramento da requerente no período de graça, a conclusão restritiva merece revisão.";
  }

  if (
    input.benefitType === "PENSAO_MORTE" &&
    input.denialReason === "DOC_INSUFICIENTE"
  ) {
    return "Em matéria de pensão por morte, a alegação de documentação insuficiente exige que a decisão administrativa indique, com precisão, quais fatos relevantes permaneceram sem prova e por que os documentos já apresentados não seriam aptos a demonstrar a condição alegada. Quando há certidões, comprovantes e elementos de vínculo ou dependência, a instância recursal deve reexaminar se houve apreciação adequada do conjunto probatório e se seria cabível complementação antes da manutenção do indeferimento.";
  }

  if (
    input.benefitType === "PENSAO_MORTE" &&
    input.denialReason === "VINCULO_NAO_COMPROVADO"
  ) {
    return "A negativa por vínculo não comprovado deve ser reavaliada com base no conjunto dos elementos apresentados, especialmente quando o requerente afirma convivência pública, estabilidade da relação ou existência de documentos convergentes sobre a qualidade de dependente. A análise administrativa não pode fragmentar a prova nem exigir demonstração incompatível com a natureza do vínculo alegado.";
  }

  if (
    input.benefitType === "BPC_LOAS" &&
    input.denialReason === "RENDA_FAMILIAR_SUPERIOR"
  ) {
    return "No caso concreto do BPC/LOAS, a conclusão de renda familiar superior precisa ser confrontada com a composição real do núcleo familiar, a estabilidade ou instabilidade dos ganhos e os gastos indispensáveis à sobrevivência digna. A instância recursal deve reexaminar se a renda considerada é efetivamente disponível e se a decisão administrativa refletiu a vulnerabilidade social narrada no processo.";
  }

  if (input.denialReason === "AUSENCIA_INCAPACIDADE") {
    return "No presente caso, a negativa por ausência de incapacidade merece revisão, pois o relato apresentado descreve limitações concretas para o exercício da atividade habitual, além da existência de documentação médica recente e compatível com o quadro narrado. Quando a atividade profissional exige esforço físico, permanência em pé, movimentos repetitivos ou sobrecarga funcional, a análise da incapacidade não pode ser abstrata: precisa ser confrontada com a realidade do trabalho efetivamente desempenhado. Assim, cabe à instância recursal reexaminar se a perícia administrativa avaliou de forma suficiente os sintomas, os exames e a repercussão funcional do quadro clínico sobre a atividade habitual do requerente.";
  }

  if (input.denialReason === "DOC_INSUFICIENTE") {
    return "Quando o indeferimento decorre de alegada insuficiência documental, a reavaliação do caso deve considerar se os documentos já juntados eram aptos a demonstrar os fatos essenciais e, se ainda houvesse dúvida razoável, se era cabível oportunizar complementação antes da manutenção da negativa. A motivação administrativa precisa indicar objetivamente quais elementos faltaram e por que os documentos existentes não foram suficientes.";
  }

  if (input.denialReason === "NAO_CUMPRIMENTO_CARENCIA") {
    return "A conclusão sobre carência exige análise precisa do histórico contributivo e do contexto do segurado, evitando-se decisões automáticas ou dissociadas dos períodos efetivamente comprovados. O reexame recursal deve verificar se todos os vínculos, recolhimentos e períodos pertinentes foram corretamente considerados pelo INSS, bem como se houve observância das regras legais de contagem e eventual reaproveitamento de contribuições após nova filiação, quando cabível.";
  }

  if (input.denialReason === "FALTA_QUALIDADE_SEGURADO") {
    return "A negativa por falta de qualidade de segurado exige demonstração clara de que o requerente efetivamente perdeu essa condição, o que pressupõe análise do histórico contributivo, dos períodos de graça e de eventuais causas legais de manutenção da filiação previdenciária. Se o processo administrativo não enfrentou de modo individualizado esses elementos, a conclusão restritiva merece revisão pela Junta de Recursos.";
  }

  if (input.benefitType === "BPC_LOAS" || input.denialReason === "RENDA_FAMILIAR_SUPERIOR") {
    return "No âmbito do BPC/LOAS, a conclusão de renda familiar superior ao limite legal não pode ser tratada de forma puramente aritmética e desconectada da realidade social do núcleo familiar. A instância recursal deve verificar a composição familiar efetiva, a origem da renda considerada, a existência de gastos extraordinários e a coerência entre os dados cadastrais e a situação concreta de vulnerabilidade apresentada no processo.";
  }

  return "Os fundamentos do indeferimento precisam ser confrontados com o relato do caso e com os documentos disponíveis, de modo a verificar se houve análise completa dos requisitos legais e da prova apresentada no processo administrativo. Havendo lacunas na fundamentação ou ausência de enfrentamento específico dos elementos do processo, a reforma da decisão se impõe.";
}

function endsWithFemaleName(fullName: string) {
  const firstName = fullName.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return firstName.endsWith("a");
}

function getLegalReferences(input: Omit<BuildPromptInput, "knowledgeContext">) {
  const refs = [
    "- Lei nº 9.784/99, art. 2º: princípios da legalidade, finalidade, motivação e razoabilidade no processo administrativo federal.",
    "- Lei nº 9.784/99, art. 29: possibilidade de diligências e reforço instrutório na fase administrativa.",
    "- Lei nº 9.784/99, art. 37: dever administrativo de obtenção, de ofício, de documentos já existentes na própria Administração, quando pertinentes à instrução.",
  ];

  if (input.benefitType === "AUXILIO_DOENCA") {
    refs.unshift(
      "- Lei nº 8.213/91, arts. 59 e 60: disciplina do benefício por incapacidade temporária, seus requisitos e marco de início.",
      "- Decreto nº 3.048/99, art. 71: regulamentação do auxílio por incapacidade temporária no âmbito do RGPS.",
    );
  } else if (input.benefitType === "BPC_LOAS") {
    refs.unshift(
      "- Constituição Federal, art. 203, V: fundamento constitucional do benefício assistencial.",
      "- Lei nº 8.742/93, art. 20: disciplina dos requisitos do BPC/LOAS.",
      "- Decreto nº 6.214/2007: regulamentação do benefício assistencial e de aspectos da avaliação administrativa.",
    );
  } else {
    refs.unshift(
      "- Lei nº 8.213/91: disciplina dos benefícios previdenciários do RGPS aplicáveis ao caso concreto.",
      "- Decreto nº 3.048/99: regulamentação do benefício requerido e do procedimento previdenciário correlato.",
    );
  }

  if (input.denialReason === "NAO_CUMPRIMENTO_CARENCIA") {
    refs.push(
      "- Lei nº 8.213/91, arts. 24, 25 e 27-A: disciplina da carência, dos períodos mínimos exigidos e da nova filiação após perda da qualidade de segurado."
    );
  }

  if (input.benefitType === "SALARIO_MATERNIDADE") {
    refs.push(
      "- Lei nº 8.213/91, arts. 71 a 73: disciplina legal do salário-maternidade."
    );
  }

  if (input.denialReason === "FALTA_QUALIDADE_SEGURADO") {
    refs.push(
      "- Lei nº 8.213/91, art. 15, e Decreto nº 3.048/99, art. 13: manutenção da qualidade de segurado e períodos de graça."
    );
  }

  if (input.benefitType === "PENSAO_MORTE") {
    refs.push(
      "- Lei nº 8.213/91, arts. 74 a 79: disciplina legal da pensão por morte e da condição de dependente."
    );
  }

  refs.push(
    "- Orientação institucional do CRPS: atuação recursal norteada pelos princípios da legalidade e da verdade material."
  );

  return refs.join("\n");
}

function getDoctrinalReferences(input: Omit<BuildPromptInput, "knowledgeContext">) {
  const refs = [
    "- IBRAHIM, Fábio Zambitte. Curso de Direito Previdenciário. Referência clássica de sistematização do regime geral e da lógica protetiva dos benefícios previdenciários.",
    "- ROCHA, Daniel Machado da; BALTAZAR JÚNIOR, José Paulo. Comentários à Lei de Benefícios da Previdência Social. Referência bibliográfica relevante para interpretação dos requisitos legais e da Lei nº 8.213/91.",
    "- LEAL, Ruy Ávila Caetano. Princípio da oficialidade e verdade material no processo administrativo previdenciário. Revista da AGU. Apoio doutrinário para reforçar a necessidade de instrução efetiva e busca da verdade material no processo administrativo.",
  ];

  if (input.benefitType === "AUXILIO_DOENCA") {
    refs.unshift(
      "- Em linha com a doutrina previdenciária contemporânea, a incapacidade deve ser examinada em sua repercussão funcional concreta sobre a atividade habitual do segurado, e não apenas sob perspectiva abstrata da doença."
    );
  }

  if (input.denialReason === "NAO_CUMPRIMENTO_CARENCIA") {
    refs.unshift(
      "- A doutrina previdenciária é firme no sentido de que carência e qualidade de segurado exigem exame técnico do histórico contributivo, sem espaço para presunções administrativas dissociadas do CNIS e dos vínculos comprovados."
    );
  }

  if (input.denialReason === "FALTA_QUALIDADE_SEGURADO") {
    refs.unshift(
      "- A interpretação dos períodos de graça deve observar a finalidade protetiva do sistema previdenciário, com atenção às hipóteses legais de manutenção da qualidade de segurado e ao contexto contributivo do requerente."
    );
  }

  if (input.benefitType === "PENSAO_MORTE") {
    refs.unshift(
      "- Na pensão por morte, a doutrina previdenciária destaca a importância da análise global da prova da dependência e do vínculo, evitando leituras excessivamente restritivas de documentos civis e convivenciais."
    );
  }

  if (input.benefitType === "SALARIO_MATERNIDADE") {
    refs.unshift(
      "- Em salário-maternidade, a doutrina enfatiza a necessidade de distinguir corretamente a categoria segurada e o regime jurídico do benefício antes de concluir por carência insuficiente ou perda da qualidade de segurada."
    );
  }

  if (input.benefitType === "BPC_LOAS" || input.denialReason === "RENDA_FAMILIAR_SUPERIOR") {
    refs.unshift(
      "- Na doutrina assistencial e previdenciária, a aferição da miserabilidade para o BPC exige análise contextual da vulnerabilidade, e não leitura mecânica e isolada de renda per capita."
    );
  }

  return refs.join("\n");
}

function getClosingTechnicalParagraph(input: Omit<BuildPromptInput, "knowledgeContext">) {
  if (
    input.benefitType === "PENSAO_MORTE" &&
    input.denialReason === "DOC_INSUFICIENTE"
  ) {
    return "Ressalta-se, ainda, que a prova em matéria de pensão por morte deve ser apreciada em conjunto, com atenção à coerência entre documentos pessoais, registros civis, comprovantes materiais e circunstâncias da relação alegada.\n\nQuando a decisão administrativa limita-se a afirmar genericamente a insuficiência documental sem indicar os pontos efetivamente não demonstrados, impõe-se o reexame recursal para restabelecer a racionalidade e a completude da instrução.";
  }

  if (
    input.benefitType === "PENSAO_MORTE" &&
    input.denialReason === "VINCULO_NAO_COMPROVADO"
  ) {
    return "Ressalta-se, ainda, que a verificação do vínculo ou da união estável em contexto previdenciário exige análise contextualizada e não fragmentária da prova produzida.\n\nA Junta de Recursos deve examinar o conjunto dos elementos apresentados à luz da finalidade protetiva da pensão por morte, evitando conclusões excessivamente restritivas quando houver plausibilidade consistente da condição de dependente.";
  }

  if (
    input.benefitType === "SALARIO_MATERNIDADE" &&
    input.denialReason === "NAO_CUMPRIMENTO_CARENCIA"
  ) {
    return "Ressalta-se, ainda, que a análise da carência em salário-maternidade depende da correta identificação do enquadramento previdenciário da requerente e da regra legal efetivamente incidente sobre o benefício.\n\nA decisão administrativa deve explicitar com clareza quais contribuições foram consideradas, quais foram desconsideradas e por qual fundamento jurídico, sob pena de restringir indevidamente o acesso à proteção previdenciária.";
  }

  if (
    input.benefitType === "SALARIO_MATERNIDADE" &&
    input.denialReason === "FALTA_QUALIDADE_SEGURADO"
  ) {
    return "Ressalta-se, ainda, que a perda da qualidade de segurada não pode ser afirmada de modo automático, especialmente quando há notícia de vínculos, recolhimentos e períodos potencialmente protegidos pela legislação previdenciária.\n\nA motivação administrativa precisa demonstrar, com base concreta no histórico da requerente, por que não subsistiria a cobertura previdenciária apta à concessão do salário-maternidade.";
  }

  if (input.denialReason === "AUSENCIA_INCAPACIDADE") {
    return "Ressalta-se, ainda, que o processo administrativo previdenciário deve observar os princípios da proteção social, da busca da verdade material, da razoabilidade e da primazia da realidade, especialmente quando a documentação apresentada revela situação que recomenda reexame mais aprofundado pela instância recursal.\n\nTambém merece destaque que a decisão administrativa não pode se limitar a conclusão padronizada quando o caso concreto indica elementos que justificam nova apreciação. Em matéria previdenciária, a análise deve ser feita com atenção ao contexto funcional do segurado, às limitações efetivamente narradas e à coerência entre a atividade habitual exercida e a incapacidade alegada.";
  }

  if (input.denialReason === "NAO_CUMPRIMENTO_CARENCIA") {
    return "Ressalta-se, ainda, que a correta apuração da carência exige leitura técnica do histórico contributivo e fundamentação administrativa individualizada, sob pena de manutenção de indeferimento sem aderência plena aos registros efetivamente computáveis.\n\nEm matéria previdenciária, a Junta de Recursos deve privilegiar o exame material da trajetória contributiva do segurado, com atenção à finalidade protetiva do sistema e à necessidade de motivação específica sobre os períodos considerados ou desconsiderados.";
  }

  if (input.denialReason === "FALTA_QUALIDADE_SEGURADO") {
    return "Ressalta-se, ainda, que a perda da qualidade de segurado não pode ser presumida sem exame técnico dos períodos de graça e das circunstâncias contributivas efetivamente demonstradas no processo.\n\nA motivação administrativa precisa indicar de forma clara por que o requerente não mais ostentaria essa condição, especialmente quando há notícia de vínculos, recolhimentos ou fatos juridicamente relevantes para manutenção da proteção previdenciária.";
  }

  if (input.denialReason === "DOC_INSUFICIENTE") {
    return "Ressalta-se, ainda, que a simples invocação de insuficiência documental não satisfaz o dever de motivação do ato administrativo quando não houver indicação objetiva do que faltou provar e da relevância concreta da prova ausente.\n\nNo processo previdenciário, a busca da verdade material recomenda atuação instrutória efetiva, inclusive com possibilidade de complementação documental, sempre que o conjunto já apresentado revelar plausibilidade relevante do direito afirmado.";
  }

  if (input.benefitType === "BPC_LOAS" || input.denialReason === "RENDA_FAMILIAR_SUPERIOR") {
    return "Ressalta-se, ainda, que o exame do BPC/LOAS demanda leitura concreta da vulnerabilidade social, da composição familiar e da suficiência econômica do núcleo, não bastando conclusão padronizada desacompanhada de análise contextualizada.\n\nA instância recursal deve verificar se a renda considerada, a composição do grupo familiar e as circunstâncias socioassistenciais efetivamente retratam a realidade do requerente, em observância à finalidade protetiva do benefício assistencial.";
  }

  return "Ressalta-se, ainda, que o processo administrativo previdenciário deve observar os princípios da proteção social, da busca da verdade material e da motivação adequada, exigindo-se análise concreta dos fatos e das provas do caso.\n\nQuando a decisão de indeferimento não enfrenta de forma específica os elementos apresentados pelo requerente, impõe-se o reexame recursal para restabelecer a coerência jurídica e administrativa do julgamento.";
}

function getFinalRequests(
  input: Omit<BuildPromptInput, "knowledgeContext">,
  benefit: string,
) {
  const requests = [
    "1. O conhecimento e o provimento do presente recurso administrativo;",
    "2. A reforma da decisão de indeferimento proferida pelo INSS;",
  ];

  if (input.benefitType === "BPC_LOAS" || input.denialReason === "RENDA_FAMILIAR_SUPERIOR") {
    requests.push(
      `3. A concessão do benefício assistencial de ${benefit}, diante da reavaliação concreta da vulnerabilidade social e da renda efetivamente disponível ao núcleo familiar;`,
      "4. Subsidiariamente, a realização de nova análise socioeconômica, com apreciação contextualizada da composição familiar, da renda efetiva e das despesas essenciais informadas no processo;",
      "5. A reanálise motivada de todos os elementos socioassistenciais apresentados, com indicação específica dos critérios utilizados pela Administração."
    );
    return requests.join("\n");
  }

  if (
    input.benefitType === "PENSAO_MORTE" &&
    (input.denialReason === "DOC_INSUFICIENTE" || input.denialReason === "VINCULO_NAO_COMPROVADO")
  ) {
    requests.push(
      `3. A concessão do benefício de ${benefit}, com reconhecimento da condição de dependente do requerente, quando cabível à luz do conjunto probatório;`,
      "4. Subsidiariamente, a reabertura da instrução administrativa para complementação documental e apreciação conjunta das provas de vínculo, convivência e dependência econômica;",
      "5. A análise individualizada e motivada dos documentos civis, comprovantes e demais elementos apresentados para comprovação da relação jurídica alegada."
    );
    return requests.join("\n");
  }

  if (
    input.benefitType === "SALARIO_MATERNIDADE" &&
    input.denialReason === "NAO_CUMPRIMENTO_CARENCIA"
  ) {
    requests.push(
      `3. A concessão do benefício de ${benefit}, com observância da disciplina legal específica aplicável à categoria previdenciária da requerente;`,
      "4. O reprocessamento administrativo da carência com indicação clara das contribuições consideradas e desconsideradas, bem como do fundamento legal adotado;",
      "5. Subsidiariamente, a reabertura da instrução para correção do enquadramento previdenciário e reapreciação do histórico contributivo."
    );
    return requests.join("\n");
  }

  if (
    input.benefitType === "SALARIO_MATERNIDADE" &&
    input.denialReason === "FALTA_QUALIDADE_SEGURADO"
  ) {
    requests.push(
      `3. A concessão do benefício de ${benefit}, com reconhecimento da manutenção da qualidade de segurada no momento juridicamente relevante;`,
      "4. Subsidiariamente, a reapreciação do histórico contributivo e dos períodos de graça incidentes ao caso, com motivação específica sobre a conclusão adotada;",
      "5. A análise individualizada dos vínculos e recolhimentos informados pela requerente, evitando-se presunção automática de perda da proteção previdenciária."
    );
    return requests.join("\n");
  }

  if (input.denialReason === "NAO_CUMPRIMENTO_CARENCIA") {
    requests.push(
      `3. A concessão do benefício de ${benefit}, após o correto cômputo da carência legalmente exigida;`,
      "4. Subsidiariamente, a revisão do histórico contributivo considerado pela Administração, com análise expressa dos períodos informados pelo requerente;",
      "5. A motivação clara e específica sobre os vínculos, recolhimentos e períodos computados ou desconsiderados no exame da carência."
    );
    return requests.join("\n");
  }

  if (input.denialReason === "FALTA_QUALIDADE_SEGURADO") {
    requests.push(
      `3. A concessão do benefício de ${benefit}, com reconhecimento da manutenção da qualidade de segurado no momento relevante para o pedido;`,
      "4. Subsidiariamente, a revisão administrativa da contagem do período de graça e dos elementos contributivos indicados pelo requerente;",
      "5. A fundamentação individualizada sobre o motivo pelo qual a Administração entendeu configurada a perda da qualidade de segurado."
    );
    return requests.join("\n");
  }

  if (input.denialReason === "DOC_INSUFICIENTE") {
    requests.push(
      `3. A concessão do benefício de ${benefit}, caso o conjunto documental já seja suficiente para demonstrar os requisitos do pedido;`,
      "4. Subsidiariamente, a reabertura da instrução administrativa para complementação documental e apreciação conjunta das provas já apresentadas;",
      "5. A indicação precisa dos documentos ou fatos que a Administração entendeu não comprovados, com motivação objetiva e específica."
    );
    return requests.join("\n");
  }

  if (input.denialReason === "AUSENCIA_INCAPACIDADE") {
    requests.push(
      `3. A concessão do benefício de ${benefit}, diante da reavaliação das limitações funcionais e da documentação médica apresentada;`,
      "4. Subsidiariamente, a realização de nova análise administrativa da incapacidade, com apreciação adequada do contexto funcional e das provas médicas do caso;",
      "5. A reanálise conjunta dos documentos clínicos e da atividade habitual do requerente, com motivação específica sobre a repercussão funcional do quadro narrado."
    );
    return requests.join("\n");
  }

  requests.push(
    `3. A concessão do benefício de ${benefit}, desde a data de entrada do requerimento, quando cabível;`,
    "4. Subsidiariamente, caso se entenda necessário, a reabertura da instrução administrativa para análise completa e individualizada da documentação apresentada;",
    "5. A reanálise conjunta dos documentos e elementos constantes do processo, com motivação clara e específica sobre cada fundamento relevante do caso."
  );

  return requests.join("\n");
}
