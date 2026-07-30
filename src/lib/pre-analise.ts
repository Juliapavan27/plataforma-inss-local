/**
 * Pré-análise gratuita: "posso recorrer?".
 *
 * IMPORTANTE — o que esta função NÃO faz: não estima chance de êxito, não dá
 * probabilidade, não diz se a pessoa "vai ganhar". Isso seria prognóstico de
 * resultado jurídico, que nem advogado pode prometer (Código de Ética da OAB,
 * art. 2º, parágrafo único, IV) e que criaria expectativa que o produto não
 * sustenta.
 *
 * O que ela faz é o que se pode afirmar com honestidade a partir de três
 * respostas: se o prazo administrativo ainda está aberto, o que costuma pesar
 * naquele motivo de negativa, e quais documentos costumam ser relevantes.
 * Isso já é mais do que a pessoa tinha antes de entrar no site.
 */
import { beneficiosNegados, type BeneficioNegado } from "@/content/beneficios";

/** Prazo do recurso administrativo: 30 dias corridos da ciência da decisão. */
export const PRAZO_RECURSO_DIAS = 30;

export type MotivoKey =
  | "pericia"
  | "qualidade_segurado"
  | "carencia"
  | "renda"
  | "documentacao"
  | "tempo_contribuicao"
  | "dependencia"
  | "outro";

export const MOTIVOS: { key: MotivoKey; label: string }[] = [
  { key: "pericia", label: "A perícia disse que não há incapacidade" },
  { key: "qualidade_segurado", label: "Falta de qualidade de segurado" },
  { key: "carencia", label: "Carência (número de contribuições) não cumprida" },
  { key: "renda", label: "Renda da família acima do limite" },
  { key: "tempo_contribuicao", label: "Tempo de contribuição não reconhecido" },
  { key: "dependencia", label: "Dependência ou vínculo não reconhecido" },
  { key: "documentacao", label: "Documentação insuficiente" },
  { key: "outro", label: "Outro motivo / não sei dizer" },
];

interface OrientacaoMotivo {
  oQuePesa: string;
  documentos: string[];
  guia: string;
}

const POR_MOTIVO: Record<MotivoKey, OrientacaoMotivo> = {
  pericia: {
    oQuePesa:
      "A negativa se apoia no laudo do perito. O recurso costuma girar em torno de documentação médica que descreva a limitação para o seu trabalho concreto — não a doença em si, mas o que ela impede você de fazer.",
    documentos: [
      "Laudos e relatórios médicos com CID e descrição das limitações",
      "Exames de imagem e resultados laboratoriais recentes",
      "Receituários e comprovantes de tratamento continuado",
      "Documento que descreva as funções que você exercia no trabalho",
    ],
    guia: "pericia-do-inss-negou-incapacidade",
  },
  qualidade_segurado: {
    oQuePesa:
      "O INSS entendeu que, na data do pedido, você não estava mais coberto pela Previdência. O período de graça e contribuições não registradas costumam mudar essa conta.",
    documentos: [
      "Extrato do CNIS completo",
      "Carteira de trabalho (páginas de contrato)",
      "Guias de recolhimento (GPS) pagas e não registradas",
      "Comprovantes de recebimento de seguro-desemprego",
    ],
    guia: "qualidade-de-segurado-e-periodo-de-graca",
  },
  carencia: {
    oQuePesa:
      "A conta do número mínimo de contribuições não fechou. Vínculos ausentes ou com data errada no CNIS são a causa mais comum, e são corrigíveis.",
    documentos: [
      "Extrato do CNIS",
      "Carteira de trabalho",
      "Guias de recolhimento pagas",
      "Contratos, recibos ou declarações do empregador",
    ],
    guia: "carencia-do-inss-o-que-e",
  },
  renda: {
    oQuePesa:
      "O cálculo da renda por pessoa passou do limite. Quem entra no grupo familiar e quais despesas podem ser abatidas costumam ser o ponto de discussão.",
    documentos: [
      "Comprovantes de renda de todos que moram na casa",
      "Comprovantes de despesas com saúde e medicamentos",
      "Documentos que mostrem quem realmente compõe o grupo familiar",
      "Cadastro Único atualizado",
    ],
    guia: "bpc-loas-negado-por-renda",
  },
  tempo_contribuicao: {
    oQuePesa:
      "Períodos trabalhados não entraram na conta. Trabalho rural, vínculos antigos e contribuições como autônomo são os que mais somem do registro.",
    documentos: [
      "Extrato do CNIS",
      "Carteira de trabalho completa",
      "Documentos de atividade rural (notas, contratos, declarações de sindicato)",
      "Guias de recolhimento como contribuinte individual",
    ],
    guia: "cnis-como-ler-e-corrigir",
  },
  dependencia: {
    oQuePesa:
      "A relação com o segurado não foi reconhecida. A prova aqui é sobre convivência e dependência econômica, e costuma ser construída com vários documentos, não com um só.",
    documentos: [
      "Certidões (casamento, nascimento dos filhos)",
      "Comprovantes de endereço em comum ao longo do tempo",
      "Contas, seguros ou planos com o outro como dependente",
      "Declarações de testemunhas",
    ],
    guia: "pensao-por-morte-negada",
  },
  documentacao: {
    oQuePesa:
      "O INSS entendeu que faltou prova. Aqui o recurso vive de documento novo: repetir o que já estava no processo tende a levar ao mesmo resultado.",
    documentos: [
      "Todos os documentos já enviados, para conferir o que faltou",
      "Documentos novos que respondam exatamente ao motivo da negativa",
      "Extrato do CNIS",
    ],
    guia: "documentos-que-fortalecem-seu-recurso",
  },
  outro: {
    oQuePesa:
      "Sem identificar o motivo exato da carta, não dá para dizer o que pesa. A carta de indeferimento traz esse fundamento, e é por ele que o recurso precisa começar.",
    documentos: [
      "A carta de indeferimento (é onde está o motivo)",
      "Extrato do CNIS",
      "Documentos relacionados ao benefício pedido",
    ],
    guia: "inss-negou-meu-beneficio-o-que-fazer",
  },
};

export type SituacaoPrazo = "dentro" | "apertado" | "vencido" | "sem_data";

export interface PreAnalise {
  beneficio: BeneficioNegado | null;
  situacao: SituacaoPrazo;
  diasDecorridos: number | null;
  diasRestantes: number | null;
  /** Frase principal sobre o prazo — é a informação mais acionável da tela. */
  tituloPrazo: string;
  textoPrazo: string;
  oQuePesa: string;
  documentos: string[];
  guiaMotivo: string;
  guiaBeneficio: string | null;
}

function diasEntre(de: Date, ate: Date) {
  const MS_DIA = 24 * 60 * 60_000;
  const a = new Date(de.getFullYear(), de.getMonth(), de.getDate());
  const b = new Date(ate.getFullYear(), ate.getMonth(), ate.getDate());
  return Math.round((b.getTime() - a.getTime()) / MS_DIA);
}

export function preAnalisar(input: {
  beneficioSlug: string;
  motivo: MotivoKey;
  /** Data da ciência da decisão, formato YYYY-MM-DD. Vazio = não sabe. */
  dataNegativa: string;
  hoje?: Date;
}): PreAnalise {
  const beneficio = beneficiosNegados.find((b) => b.slug === input.beneficioSlug) ?? null;
  const orientacao = POR_MOTIVO[input.motivo];
  const hoje = input.hoje ?? new Date();

  let situacao: SituacaoPrazo = "sem_data";
  let diasDecorridos: number | null = null;
  let diasRestantes: number | null = null;

  if (input.dataNegativa) {
    const [ano, mes, dia] = input.dataNegativa.split("-").map(Number);
    if (ano && mes && dia) {
      diasDecorridos = diasEntre(new Date(ano, mes - 1, dia), hoje);
      diasRestantes = PRAZO_RECURSO_DIAS - diasDecorridos;
      // "Apertado" a partir de 7 dias restantes: é quando reunir documento e
      // protocolar ainda cabe, mas não dá para deixar para depois.
      situacao =
        diasRestantes < 0 ? "vencido" : diasRestantes <= 7 ? "apertado" : "dentro";
    }
  }

  const { tituloPrazo, textoPrazo } = textoDoPrazo(situacao, diasRestantes);

  return {
    beneficio,
    situacao,
    diasDecorridos,
    diasRestantes,
    tituloPrazo,
    textoPrazo,
    oQuePesa: orientacao.oQuePesa,
    documentos: orientacao.documentos,
    guiaMotivo: orientacao.guia,
    guiaBeneficio: beneficio?.guia ?? null,
  };
}

function textoDoPrazo(situacao: SituacaoPrazo, diasRestantes: number | null) {
  switch (situacao) {
    case "dentro":
      return {
        tituloPrazo: `Você ainda tem ${diasRestantes} dias para recorrer`,
        textoPrazo:
          "O prazo do recurso administrativo é de 30 dias corridos contados da ciência da decisão. Dá tempo de reunir os documentos com calma.",
      };
    case "apertado":
      return {
        tituloPrazo:
          diasRestantes === 0
            ? "Hoje é o último dia do prazo"
            : `Faltam ${diasRestantes} dias — o prazo está apertado`,
        textoPrazo:
          "O recurso administrativo tem 30 dias corridos da ciência da decisão. Vale priorizar isso hoje: o protocolo no Meu INSS é gratuito e pode ser feito por você.",
      };
    case "vencido":
      return {
        tituloPrazo: "O prazo de 30 dias provavelmente já passou",
        textoPrazo:
          "Isso não encerra o seu caso: normalmente ainda cabe apresentar um novo requerimento ao INSS, e a via judicial continua aberta. Confira a data de ciência na sua carta — ela pode ser diferente da data da decisão.",
      };
    default:
      return {
        tituloPrazo: "Confira a data na sua carta de indeferimento",
        textoPrazo:
          "O prazo do recurso é de 30 dias corridos contados da ciência da decisão — que é a data em que você tomou conhecimento, não necessariamente a data em que o INSS decidiu.",
      };
  }
}
