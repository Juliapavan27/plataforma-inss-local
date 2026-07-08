// Valores de referência 2025 (reajustados anualmente em janeiro) — atualizar quando o INSS publicar os novos valores.
export const SALARIO_MINIMO_CENTS = 151800; // R$ 1.518,00
export const TETO_INSS_CENTS = 815741; // R$ 8.157,41

function aplicarPisoTeto(cents: number) {
  return Math.min(Math.max(cents, SALARIO_MINIMO_CENTS), TETO_INSS_CENTS);
}

export type Sexo = "M" | "F";

export interface AposentadoriaInput {
  sexo: Sexo;
  idadeAtual: number;
  tempoContribuicaoAnos: number;
  mediaSalarialCents: number;
}

export interface AposentadoriaResult {
  idadeMinima: number;
  tempoMinimoAnos: number;
  anosFaltantes: number;
  idadeEstimadaAposentadoria: number;
  tempoContribuicaoNaAposentadoria: number;
  coeficiente: number;
  valorEstimadoCents: number;
}

/**
 * Estimativa simplificada da regra geral pós-EC 103/2019 (idade mínima + tempo
 * mínimo de contribuição, coeficiente de 60% + 2% por ano excedente). Não
 * contempla as regras de transição (pontos, pedágio), que podem antecipar a
 * aposentadoria de quem já contribuía antes de 13/11/2019.
 */
export function calcularAposentadoria(input: AposentadoriaInput): AposentadoriaResult {
  const idadeMinima = input.sexo === "M" ? 65 : 62;
  const tempoMinimoAnos = input.sexo === "M" ? 20 : 15;

  const anosFaltantesIdade = Math.max(idadeMinima - input.idadeAtual, 0);
  const anosFaltantesTempo = Math.max(tempoMinimoAnos - input.tempoContribuicaoAnos, 0);
  const anosFaltantes = Math.max(anosFaltantesIdade, anosFaltantesTempo);

  const tempoContribuicaoNaAposentadoria = input.tempoContribuicaoAnos + anosFaltantes;
  const coeficiente = Math.min(
    0.6 + 0.02 * Math.max(tempoContribuicaoNaAposentadoria - tempoMinimoAnos, 0),
    1,
  );
  const valorEstimadoCents = aplicarPisoTeto(Math.round(input.mediaSalarialCents * coeficiente));

  return {
    idadeMinima,
    tempoMinimoAnos,
    anosFaltantes,
    idadeEstimadaAposentadoria: input.idadeAtual + anosFaltantes,
    tempoContribuicaoNaAposentadoria,
    coeficiente,
    valorEstimadoCents,
  };
}

export const beneficioSimuladoTipos = [
  "AUXILIO_DOENCA",
  "APOSENTADORIA_INVALIDEZ",
  "SALARIO_MATERNIDADE",
  "PENSAO_MORTE",
  "BPC_LOAS",
] as const;

export type BeneficioSimuladoTipo = (typeof beneficioSimuladoTipos)[number];

export const beneficioSimuladoLabels: Record<BeneficioSimuladoTipo, string> = {
  AUXILIO_DOENCA: "Auxílio-Doença (Incapacidade Temporária)",
  APOSENTADORIA_INVALIDEZ: "Aposentadoria por Invalidez (Incapacidade Permanente)",
  SALARIO_MATERNIDADE: "Salário-Maternidade",
  PENSAO_MORTE: "Pensão por Morte",
  BPC_LOAS: "BPC/LOAS",
};

export interface BeneficioInput {
  tipo: BeneficioSimuladoTipo;
  mediaSalarialCents: number;
  dependentes?: number;
}

export interface BeneficioResult {
  coeficiente: number;
  valorEstimadoCents: number;
}

/**
 * Estimativa simplificada do valor mensal por tipo de benefício. BPC/LOAS é
 * assistencial (não contributivo): valor fixo de 1 salário mínimo, sem relação
 * com a média salarial. Aposentadoria por invalidez usa 100% aqui pensando no
 * caso de acidente de trabalho/doença ocupacional — fora dessa hipótese o
 * coeficiente pode ser proporcional ao tempo de contribuição (ver simulador
 * de aposentadoria).
 */
export function calcularBeneficio(input: BeneficioInput): BeneficioResult {
  if (input.tipo === "BPC_LOAS") {
    return { coeficiente: 1, valorEstimadoCents: SALARIO_MINIMO_CENTS };
  }

  let coeficiente = 1;
  if (input.tipo === "AUXILIO_DOENCA") coeficiente = 0.91;
  if (input.tipo === "PENSAO_MORTE") {
    const dependentes = Math.min(Math.max(input.dependentes ?? 1, 1), 5);
    coeficiente = Math.min(0.5 + 0.1 * dependentes, 1);
  }

  const valorEstimadoCents = aplicarPisoTeto(Math.round(input.mediaSalarialCents * coeficiente));
  return { coeficiente, valorEstimadoCents };
}
