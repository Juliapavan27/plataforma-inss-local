/**
 * Os benefícios que o INSS nega, organizados como a pessoa pensa.
 *
 * Quem chega ao site não busca "recurso administrativo" — busca "auxílio-doença
 * negado", "BPC negado por renda", "INSS indeferiu meu pedido". Esta lista é o
 * elo entre a busca real e os guias que já respondem cada caso: a página-pilar
 * /beneficio-negado se monta a partir dela.
 *
 * `guia` aponta para um guia que já existe em src/content/guias.ts. Não
 * inventar slug aqui — página-pilar que leva a 404 desperdiça a visita.
 */
export interface BeneficioNegado {
  slug: string;
  nome: string;
  /**
   * Título já flexionado ("Aposentadoria negada", "Auxílio-doença negado").
   * Montar como `${nome} negado` errava o gênero em metade dos benefícios.
   */
  titulo: string;
  /** Como a pessoa descreve o problema, não como a lei chama. */
  chamada: string;
  motivosComuns: string[];
  guia: string;
}

export const beneficiosNegados: BeneficioNegado[] = [
  {
    slug: "auxilio-doenca",
    titulo: "Auxílio-doença negado",
    nome: "Auxílio-doença",
    chamada: "A perícia disse que você está apto, mesmo você não conseguindo trabalhar.",
    motivosComuns: [
      "Perícia concluiu que não há incapacidade",
      "Falta de qualidade de segurado na data do pedido",
      "Carência não cumprida",
    ],
    guia: "auxilio-doenca-negado",
  },
  {
    slug: "bpc-loas",
    titulo: "BPC/LOAS negado",
    nome: "BPC/LOAS",
    chamada: "O INSS calculou a renda da sua família e disse que passa do limite.",
    motivosComuns: [
      "Renda por pessoa acima do limite legal",
      "Composição do grupo familiar considerada de forma diferente da real",
      "Deficiência não reconhecida na avaliação",
    ],
    guia: "bpc-loas-negado-por-renda",
  },
  {
    slug: "aposentadoria-por-incapacidade",
    titulo: "Aposentadoria por incapacidade negada",
    nome: "Aposentadoria por incapacidade",
    chamada: "Você não tem mais condição de voltar ao trabalho, mas o pedido foi indeferido.",
    motivosComuns: [
      "Perícia entendeu que a incapacidade é temporária",
      "Perda da qualidade de segurado",
      "Documentação médica considerada insuficiente",
    ],
    guia: "aposentadoria-por-invalidez-negada",
  },
  {
    slug: "aposentadoria-por-idade",
    titulo: "Aposentadoria por idade negada",
    nome: "Aposentadoria por idade",
    chamada: "Você bateu a idade, mas o INSS não reconheceu todo o seu tempo de contribuição.",
    motivosComuns: [
      "Períodos faltando ou errados no CNIS",
      "Carência não atingida segundo o cálculo do INSS",
      "Tempo rural não reconhecido",
    ],
    guia: "aposentadoria-por-idade-negada",
  },
  {
    slug: "pensao-por-morte",
    titulo: "Pensão por morte negada",
    nome: "Pensão por morte",
    chamada: "O INSS não reconheceu sua condição de dependente, ou a qualidade de segurado de quem faleceu.",
    motivosComuns: [
      "Dependência econômica não comprovada",
      "União estável não reconhecida",
      "Falecido sem qualidade de segurado na data do óbito",
    ],
    guia: "pensao-por-morte-negada",
  },
  {
    slug: "salario-maternidade",
    titulo: "Salário-maternidade negado",
    nome: "Salário-maternidade",
    chamada: "O benefício foi negado por carência ou por vínculo não reconhecido.",
    motivosComuns: [
      "Carência não cumprida para seguradas contribuintes individuais",
      "Perda da qualidade de segurada",
      "Vínculo de trabalho não reconhecido",
    ],
    guia: "salario-maternidade-negado",
  },
  {
    slug: "auxilio-acidente",
    titulo: "Auxílio-acidente negado",
    nome: "Auxílio-acidente",
    chamada: "Ficou sequela depois do acidente, mas o INSS não reconheceu a redução da capacidade.",
    motivosComuns: [
      "Sequela considerada inexistente pela perícia",
      "Nexo entre o acidente e a sequela não reconhecido",
      "Benefício anterior encerrado sem avaliação de sequela",
    ],
    guia: "auxilio-acidente-negado",
  },
];

export function getBeneficio(slug: string) {
  return beneficiosNegados.find((b) => b.slug === slug);
}
