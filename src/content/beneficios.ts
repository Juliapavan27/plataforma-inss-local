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

  /* --- conteúdo da página dedicada /beneficio-negado/[slug] --- */

  /** Termos de busca reais que esta página deve atender. */
  buscas: string[];
  /** Abertura da página: fala da situação, não do produto. */
  intro: string;
  /** Cada causa com a explicação do que costuma sustentar o recurso. */
  causas: { titulo: string; explicacao: string; oQueAjuda: string }[];
  documentos: string[];
  /** Particularidade de prazo ou de trâmite deste benefício, se houver. */
  observacaoPrazo?: string;
  perguntas: { pergunta: string; resposta: string }[];
  /** Guias que aprofundam este benefício. */
  guiasRelacionados: string[];
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
    buscas: [
      "auxílio-doença negado",
      "INSS negou auxílio-doença",
      "perícia negou auxílio-doença",
      "recurso auxílio-doença negado",
      "benefício por incapacidade indeferido",
    ],
    intro: "O auxílio-doença — hoje chamado de benefício por incapacidade temporária — é negado com mais frequência do que qualquer outro benefício do INSS. Na maioria dos casos a negativa vem do resultado da perícia médica, que concluiu que você não está incapaz para o trabalho. Isso pode ser contestado, e o recurso administrativo é o caminho para isso.",
    causas: [
      {
        titulo: "A perícia concluiu que não há incapacidade",
        explicacao: "É o motivo mais comum. O perito examina você por poucos minutos e conclui, a partir do que viu e dos documentos apresentados naquele momento, que você tem condições de trabalhar.",
        oQueAjuda: "Documentação médica que descreva a limitação em relação ao seu trabalho concreto — não a doença em si, mas o que ela impede você de fazer no dia a dia da sua função.",
      },
      {
        titulo: "Falta de qualidade de segurado",
        explicacao: "O INSS entendeu que, na data em que a incapacidade começou, você já não estava mais coberto pela Previdência — normalmente por ter parado de contribuir há muito tempo.",
        oQueAjuda: "O período de graça pode estender essa cobertura por 12, 24 ou até 36 meses depois da última contribuição. Contribuições não registradas no CNIS também mudam essa conta.",
      },
      {
        titulo: "Carência não cumprida",
        explicacao: "Em regra são necessárias 12 contribuições mensais antes do pedido. O INSS contou menos do que isso.",
        oQueAjuda: "Vínculos ausentes ou com datas erradas no CNIS são a causa mais comum, e são corrigíveis. Algumas doenças graves dispensam a carência por completo.",
      },
    ],
    documentos: [
      "Laudos e relatórios médicos com CID e descrição das limitações",
      "Exames de imagem e resultados laboratoriais recentes",
      "Receituários e comprovantes de tratamento continuado",
      "Atestados de afastamento anteriores",
      "Documento que descreva as funções que você exercia no trabalho",
      "Extrato do CNIS",
    ],
    perguntas: [
      {
        pergunta: "A perícia me achou apto, mas meu médico diz o contrário. Vale recorrer?",
        resposta: "Sim, e é exatamente a situação que o recurso administrativo existe para tratar. O recurso é julgado pela Junta de Recursos do CRPS, um colegiado diferente de quem negou, que reavalia a documentação médica apresentada.",
      },
      {
        pergunta: "Preciso fazer nova perícia para recorrer?",
        resposta: "Não. O recurso é analisado a partir dos documentos do processo e dos que você juntar. Em alguns casos a Junta pode determinar nova avaliação, mas isso não é pré-requisito para recorrer.",
      },
      {
        pergunta: "Posso pedir o benefício de novo em vez de recorrer?",
        resposta: "Pode, mas são caminhos diferentes. Um novo requerimento recomeça a análise do zero e a data de início do benefício passa a ser a do novo pedido. O recurso discute a decisão original e preserva a data do pedido inicial.",
      },
    ],
    guiasRelacionados: [
      "auxilio-doenca-negado",
      "pericia-do-inss-negou-incapacidade",
      "como-se-preparar-para-a-pericia",
      "qualidade-de-segurado-e-periodo-de-graca",
    ],
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
    buscas: [
      "BPC negado",
      "LOAS negado",
      "BPC negado por renda",
      "recurso BPC LOAS",
      "benefício assistencial indeferido",
    ],
    intro: "O BPC/LOAS é um benefício assistencial: não exige contribuição, mas exige comprovar deficiência ou idade a partir de 65 anos, somada à situação de baixa renda familiar. A negativa quase sempre vem do cálculo da renda por pessoa da família — e esse cálculo tem regras que costumam ser aplicadas de forma diferente da realidade da casa.",
    causas: [
      {
        titulo: "Renda por pessoa acima do limite",
        explicacao: "O INSS soma a renda de todos que ele considera parte do grupo familiar e divide pelo número de pessoas. Se o resultado passar do limite legal, o pedido é negado.",
        oQueAjuda: "Discutir quem realmente compõe o grupo familiar e quais valores podem ser excluídos da soma. Despesas médicas continuadas e certos benefícios recebidos por outros membros costumam ser pontos de discussão.",
      },
      {
        titulo: "Composição do grupo familiar considerada de forma diferente da real",
        explicacao: "A lei define quem entra no grupo familiar, e nem todo mundo que mora na casa entra. Parentes fora dessa lista não deveriam somar renda.",
        oQueAjuda: "Documentos que mostrem quem de fato mora com você e qual é o vínculo — o Cadastro Único atualizado é peça central aqui.",
      },
      {
        titulo: "Deficiência não reconhecida na avaliação",
        explicacao: "Para o BPC por deficiência a avaliação é médica e social, e considera as barreiras que a pessoa enfrenta para participar da vida em sociedade — não apenas o diagnóstico.",
        oQueAjuda: "Documentação que descreva impedimentos de longo prazo e como eles limitam a vida diária, escolar ou de trabalho.",
      },
    ],
    documentos: [
      "Cadastro Único (CadÚnico) atualizado",
      "Comprovantes de renda de todos que moram na casa",
      "Comprovantes de despesas com saúde e medicamentos de uso contínuo",
      "Laudos que descrevam impedimentos de longo prazo",
      "Comprovante de residência",
      "Documentos de todos os membros da família",
    ],
    perguntas: [
      {
        pergunta: "Quem entra na conta do grupo familiar do BPC?",
        resposta: "A lei lista quem compõe o grupo familiar, e é uma lista fechada: cônjuge ou companheiro, pais, madrasta ou padrasto, irmãos solteiros, filhos e enteados solteiros e menores tutelados, desde que vivam sob o mesmo teto. Parentes fora dessa lista não deveriam ter a renda somada, mesmo morando na casa.",
      },
      {
        pergunta: "Meu CadÚnico estava desatualizado. Isso derruba o pedido?",
        resposta: "O CadÚnico atualizado é exigência para o BPC, e a desatualização é causa frequente de indeferimento. Atualizar o cadastro e demonstrar a situação real da família é parte central do recurso nesses casos.",
      },
      {
        pergunta: "Recebo Bolsa Família. Isso me impede de receber o BPC?",
        resposta: "Não impede automaticamente, mas o BPC e o Bolsa Família não são acumuláveis pela mesma pessoa. A relação entre os dois é um ponto que costuma aparecer na análise e vale ser tratado no recurso.",
      },
    ],
    guiasRelacionados: [
      "bpc-loas-negado-por-renda",
      "documentos-que-fortalecem-seu-recurso",
      "inss-negou-meu-beneficio-o-que-fazer",
    ],
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
    buscas: [
      "aposentadoria por invalidez negada",
      "aposentadoria por incapacidade permanente negada",
      "INSS negou aposentadoria por invalidez",
      "recurso aposentadoria por incapacidade",
    ],
    intro: "A aposentadoria por incapacidade permanente — o antigo nome era aposentadoria por invalidez — exige que a incapacidade seja total e insuscetível de reabilitação. É um requisito mais exigente que o do auxílio-doença, e a negativa mais comum não diz que você está bem: diz que a incapacidade seria temporária ou que haveria possibilidade de reabilitação para outra função.",
    causas: [
      {
        titulo: "Perícia entendeu que a incapacidade é temporária",
        explicacao: "O perito reconheceu a limitação, mas concluiu que ela pode melhorar com tratamento — o que levaria ao auxílio por incapacidade temporária, não à aposentadoria.",
        oQueAjuda: "Histórico médico que mostre a evolução ao longo do tempo, tratamentos já tentados sem resultado e prognóstico de irreversibilidade.",
      },
      {
        titulo: "Possibilidade de reabilitação para outra atividade",
        explicacao: "O INSS entendeu que, embora você não possa exercer sua função, poderia ser reabilitado para outra.",
        oQueAjuda: "Elementos concretos sobre idade, escolaridade, histórico profissional e as condições reais de reinserção no mercado — não apenas o quadro clínico.",
      },
      {
        titulo: "Perda da qualidade de segurado",
        explicacao: "O INSS entendeu que na data do início da incapacidade você já não estava coberto.",
        oQueAjuda: "O período de graça e contribuições ausentes do CNIS costumam mudar essa data de corte.",
      },
    ],
    documentos: [
      "Histórico médico completo, mostrando a evolução do quadro",
      "Laudos que indiquem irreversibilidade ou prognóstico reservado",
      "Comprovantes de tratamentos já realizados sem melhora",
      "Documentos sobre a atividade profissional exercida",
      "Extrato do CNIS",
    ],
    perguntas: [
      {
        pergunta: "Qual a diferença entre auxílio-doença e aposentadoria por incapacidade?",
        resposta: "O auxílio por incapacidade temporária pressupõe que você vai melhorar e voltar a trabalhar. A aposentadoria por incapacidade permanente pressupõe que isso não vai acontecer e que não há reabilitação possível. O requisito é mais exigente, e por isso a negativa é mais frequente.",
      },
      {
        pergunta: "Recebi auxílio-doença e depois foi cortado. Posso pedir aposentadoria?",
        resposta: "Sim. A cessação do auxílio não impede o pedido de aposentadoria por incapacidade permanente, e a negativa desse pedido também comporta recurso administrativo no mesmo prazo de 30 dias.",
      },
    ],
    guiasRelacionados: [
      "aposentadoria-por-invalidez-negada",
      "pericia-do-inss-negou-incapacidade",
      "como-se-preparar-para-a-pericia",
    ],
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
    buscas: [
      "aposentadoria por idade negada",
      "INSS negou aposentadoria",
      "aposentadoria negada por falta de carência",
      "tempo de contribuição não reconhecido",
    ],
    intro: "Na aposentadoria por idade a negativa raramente é sobre a idade — é sobre o tempo. O INSS conta as contribuições que aparecem no seu CNIS, e o que não está lá simplesmente não entra na conta. Vínculos antigos, trabalho rural e períodos como autônomo são os que mais somem do registro.",
    causas: [
      {
        titulo: "Períodos faltando ou errados no CNIS",
        explicacao: "O CNIS é alimentado pelas informações que empregadores e o próprio segurado enviaram ao longo de décadas. Falhas nesse registro são comuns, sobretudo em vínculos anteriores aos anos 2000.",
        oQueAjuda: "Carteira de trabalho, contratos e recibos que comprovem os períodos ausentes. Documento da época vale mais do que declaração feita hoje.",
      },
      {
        titulo: "Carência não atingida segundo o cálculo do INSS",
        explicacao: "Faltaram contribuições para alcançar o mínimo exigido — normalmente por consequência direta do problema acima.",
        oQueAjuda: "Recuperar os períodos ausentes costuma resolver a carência junto.",
      },
      {
        titulo: "Tempo rural não reconhecido",
        explicacao: "O trabalho rural em regime de economia familiar pode contar, mas exige prova material, e declarações isoladas costumam não bastar.",
        oQueAjuda: "Documentos da época que mencionem a atividade rural: notas de produtor, contratos de parceria, registros escolares, certidões com profissão declarada.",
      },
    ],
    documentos: [
      "Extrato do CNIS completo",
      "Carteira de trabalho, todas as páginas de contrato",
      "Guias de recolhimento (GPS) pagas",
      "Documentos que comprovem atividade rural, se houver",
      "Contratos, recibos e declarações de empregadores",
    ],
    perguntas: [
      {
        pergunta: "Meu tempo de trabalho não aparece no CNIS. Como comprovo?",
        resposta: "Com prova material da época: carteira de trabalho, contratos, recibos, fichas de registro. A correção do CNIS pode ser pedida ao INSS e também sustentada dentro do recurso.",
      },
      {
        pergunta: "Trabalhei na roça quando jovem. Isso conta?",
        resposta: "Pode contar, inclusive para carência em algumas situações, desde que haja início de prova material da atividade rural no período. Depoimento isolado, sem documento, normalmente não é aceito.",
      },
    ],
    guiasRelacionados: [
      "aposentadoria-por-idade-negada",
      "cnis-como-ler-e-corrigir",
      "trabalhador-rural-como-comprovar",
      "carencia-do-inss-o-que-e",
    ],
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
    buscas: [
      "pensão por morte negada",
      "INSS negou pensão por morte",
      "recurso pensão por morte",
      "dependência econômica não comprovada",
    ],
    intro: "A pensão por morte depende de duas coisas: a pessoa falecida ter qualidade de segurado na data do óbito, e você ser reconhecido como dependente. A negativa costuma atacar um desses dois pontos — e o segundo, quando envolve união estável, é onde a prova exige mais cuidado.",
    causas: [
      {
        titulo: "União estável não reconhecida",
        explicacao: "Sem casamento formal, o INSS exige prova da convivência como família. Um ou dois documentos raramente bastam.",
        oQueAjuda: "Um conjunto de documentos ao longo do tempo é mais convincente que um documento forte isolado: contas no mesmo endereço, plano de saúde, conta bancária conjunta, fotos datadas, declarações.",
      },
      {
        titulo: "Dependência econômica não comprovada",
        explicacao: "Para alguns dependentes a lei presume a dependência; para outros, ela precisa ser demonstrada.",
        oQueAjuda: "Comprovantes de que o falecido custeava despesas suas: transferências, contas em nome dele no seu endereço, declaração de imposto de renda com você como dependente.",
      },
      {
        titulo: "Falecido sem qualidade de segurado na data do óbito",
        explicacao: "Se a pessoa havia parado de contribuir há bastante tempo, o INSS pode entender que a cobertura já havia cessado.",
        oQueAjuda: "O período de graça pode ter mantido a cobertura. Contribuições não registradas e o recebimento de seguro-desemprego também mudam essa conta.",
      },
    ],
    documentos: [
      "Certidão de óbito",
      "Certidão de casamento ou documentos que comprovem união estável",
      "Comprovantes de endereço em comum ao longo dos anos",
      "Certidões de nascimento dos filhos em comum",
      "Documentos que mostrem dependência econômica",
      "Extrato do CNIS do falecido",
    ],
    perguntas: [
      {
        pergunta: "Vivíamos juntos mas não éramos casados. Tenho direito?",
        resposta: "A união estável dá direito à pensão, mas exige comprovação. A prova se constrói com um conjunto de documentos que mostrem convivência duradoura e pública, não com um documento isolado.",
      },
      {
        pergunta: "A pensão é vitalícia?",
        resposta: "Depende da idade do dependente na data do óbito e do tempo de contribuição e de união. A lei prevê durações diferentes, e a vitaliciedade se aplica apenas a partir de determinada idade. A negativa e a duração são questões distintas — ambas podem ser discutidas.",
      },
    ],
    guiasRelacionados: [
      "pensao-por-morte-negada",
      "documentos-que-fortalecem-seu-recurso",
      "qualidade-de-segurado-e-periodo-de-graca",
    ],
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
    buscas: [
      "salário-maternidade negado",
      "INSS negou salário-maternidade",
      "recurso salário-maternidade",
      "salário-maternidade desempregada",
    ],
    intro: "O salário-maternidade é negado, na maior parte das vezes, por questões de vínculo e de carência — não pelo nascimento em si. Quem contribui como autônoma, quem estava desempregada no parto e quem trabalha no campo são os grupos que mais recebem indeferimento.",
    causas: [
      {
        titulo: "Carência não cumprida",
        explicacao: "Contribuintes individuais e facultativas precisam de um número mínimo de contribuições antes do parto. Empregadas com carteira assinada não têm essa exigência.",
        oQueAjuda: "Conferir se todas as contribuições pagas estão registradas — recolhimentos feitos e não computados são comuns.",
      },
      {
        titulo: "Perda da qualidade de segurada",
        explicacao: "Se você estava desempregada no parto, o INSS avalia se o período de graça ainda cobria aquela data.",
        oQueAjuda: "A data exata do fim do último vínculo e o direito à prorrogação do período de graça são determinantes aqui.",
      },
      {
        titulo: "Vínculo de trabalho não reconhecido",
        explicacao: "O trabalho não constava do registro, ou a condição de segurada especial (rural) não foi aceita.",
        oQueAjuda: "Documentos da época que comprovem a atividade — inclusive rural, que tem regra própria.",
      },
    ],
    documentos: [
      "Certidão de nascimento da criança, ou documentação de adoção",
      "Extrato do CNIS",
      "Carteira de trabalho",
      "Guias de recolhimento pagas",
      "Documentos de atividade rural, no caso de segurada especial",
    ],
    perguntas: [
      {
        pergunta: "Eu estava desempregada quando tive o bebê. Tenho direito?",
        resposta: "Pode ter. Se o parto ocorreu dentro do período de graça — o intervalo em que você continua coberta pela Previdência mesmo sem contribuir — o direito se mantém. A duração desse período varia conforme o histórico de contribuições.",
      },
      {
        pergunta: "Sou MEI. Tenho direito ao salário-maternidade?",
        resposta: "Sim, desde que cumprida a carência exigida para contribuintes individuais e mantidos os recolhimentos em dia. Recolhimentos feitos mas não registrados corretamente são causa frequente de negativa.",
      },
    ],
    guiasRelacionados: [
      "salario-maternidade-negado",
      "carencia-do-inss-o-que-e",
      "qualidade-de-segurado-e-periodo-de-graca",
    ],
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
    buscas: [
      "auxílio-acidente negado",
      "INSS negou auxílio-acidente",
      "recurso auxílio-acidente",
      "sequela de acidente INSS",
    ],
    intro: "O auxílio-acidente é uma indenização mensal para quem ficou com sequela permanente que reduz a capacidade de trabalho. Não exige incapacidade total — exige redução. É justamente essa distinção que gera a maior parte das negativas: o INSS reconhece a sequela, mas entende que ela não reduz a capacidade.",
    causas: [
      {
        titulo: "Sequela considerada inexistente ou irrelevante",
        explicacao: "A perícia entendeu que não restou sequela, ou que ela não afeta o trabalho.",
        oQueAjuda: "Documentação que mostre a limitação funcional concreta e como ela afeta as tarefas específicas da sua atividade.",
      },
      {
        titulo: "Nexo entre acidente e sequela não reconhecido",
        explicacao: "O INSS não ligou a sequela ao acidente que você relatou.",
        oQueAjuda: "Documentos da época do acidente: CAT, boletim de ocorrência, atendimento de urgência, primeiros exames.",
      },
      {
        titulo: "Benefício anterior encerrado sem avaliação de sequela",
        explicacao: "O auxílio por incapacidade foi cessado sem que se avaliasse se restou sequela permanente.",
        oQueAjuda: "Pedir expressamente essa avaliação, apoiada nos exames posteriores à alta.",
      },
    ],
    documentos: [
      "CAT (Comunicação de Acidente de Trabalho), se houver",
      "Boletim de ocorrência e atendimento de urgência",
      "Exames feitos logo após o acidente e os atuais",
      "Laudos que descrevam a sequela e a limitação funcional",
      "Descrição das tarefas da sua atividade profissional",
    ],
    perguntas: [
      {
        pergunta: "Posso receber auxílio-acidente e continuar trabalhando?",
        resposta: "Sim. O auxílio-acidente tem natureza indenizatória e é compatível com o trabalho — ele não pressupõe incapacidade, e sim redução da capacidade.",
      },
      {
        pergunta: "O acidente foi fora do trabalho. Ainda tenho direito?",
        resposta: "Sim. O auxílio-acidente não exige que o acidente tenha sido de trabalho; exige a sequela permanente que reduza a capacidade laborativa e o nexo com o acidente.",
      },
    ],
    guiasRelacionados: [
      "auxilio-acidente-negado",
      "pericia-do-inss-negou-incapacidade",
      "documentos-que-fortalecem-seu-recurso",
    ],
  },
];

export function getBeneficio(slug: string) {
  return beneficiosNegados.find((b) => b.slug === slug);
}
