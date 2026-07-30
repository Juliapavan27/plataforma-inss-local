/**
 * Conteúdo dos guias — estático, em código (sem banco).
 *
 * Motivo: são poucas páginas, mudam pouco e ficam totalmente estáticas no build
 * (melhor para SEO e sem dependência de banco na hora de gerar o site — o blog
 * antigo, que vinha do banco, chegava a quebrar o build quando o banco não
 * estava acessível).
 *
 * ATENÇÃO: este conteúdo trata de direito previdenciário. Revise juridicamente
 * antes de publicar ou alterar.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; variant: "info" | "warn" | "tip"; title: string; text: string };

export interface Guia {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  blocks: Block[];
  /**
   * Fontes oficiais citadas. Conteúdo previdenciário é YMYL: o Google pesa
   * muito de onde veio a informação, e o leitor também. Só entram links de
   * legislação e de órgãos públicos — nunca sites de terceiros.
   */
  fontes?: FonteKey[];
  /** Guias relacionados, por slug. Sem isso o rodapé mostra os 3 primeiros. */
  relacionados?: string[];
}

/** Catálogo de fontes oficiais, para não repetir URL solta pelo arquivo. */
export const FONTES = {
  lei8213: {
    titulo: "Lei 8.213/91 — Planos de Benefícios da Previdência Social",
    url: "https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm",
  },
  decreto3048: {
    titulo: "Decreto 3.048/99 — Regulamento da Previdência Social",
    url: "https://www.planalto.gov.br/ccivil_03/decreto/d3048.htm",
  },
  lei8742: {
    titulo: "Lei 8.742/93 — Lei Orgânica da Assistência Social (LOAS)",
    url: "https://www.planalto.gov.br/ccivil_03/leis/l8742.htm",
  },
  inss: {
    titulo: "INSS — portal oficial no gov.br",
    url: "https://www.gov.br/inss/pt-br",
  },
  crps: {
    titulo: "Conselho de Recursos da Previdência Social (CRPS)",
    url: "https://www.gov.br/previdencia/pt-br/assuntos/crps",
  },
  meuInss: {
    titulo: "Meu INSS — canal oficial de atendimento",
    url: "https://meu.inss.gov.br",
  },
} as const;

export type FonteKey = keyof typeof FONTES;

export function fontesDoGuia(guia: Guia) {
  return (guia.fontes ?? []).map((k) => FONTES[k]);
}

export const guias: Guia[] = [
  {
    slug: "inss-negou-meu-beneficio-o-que-fazer",
    title: "O INSS negou meu benefício. O que fazer agora?",
    excerpt:
      "Receber a carta de indeferimento não é o fim do processo. Entenda seus direitos, o prazo que você tem e quais caminhos existem.",
    category: "Primeiros passos",
    readingMinutes: 6,
    fontes: ["lei8213", "inss", "crps"],
    relacionados: [
      "prazo-de-30-dias-para-recorrer",
      "como-protocolar-recurso-no-meu-inss",
      "documentos-que-fortalecem-seu-recurso",
    ],
    blocks: [
      {
        type: "p",
        text: "Receber a notícia de que o INSS negou seu pedido é frustrante — principalmente depois de meses de espera, perícias e documentos. Mas o indeferimento não significa que você não tem direito ao benefício. Significa que, com as informações que estavam no processo, o INSS entendeu que faltava algum requisito.",
      },
      {
        type: "p",
        text: "Uma parte enorme das negativas acontece por questões que podem ser esclarecidas: documento que não foi anexado, período de contribuição que não apareceu no sistema, laudo médico que não foi considerado, ou um cálculo de renda feito de forma diferente da sua realidade.",
      },
      {
        type: "callout",
        variant: "warn",
        title: "O prazo é curto: 30 dias",
        text: "Você tem 30 dias corridos, contados a partir da ciência da decisão, para apresentar recurso administrativo (art. 126 da Lei 8.213/91). Passado esse prazo, a decisão se torna definitiva na esfera administrativa e o caminho fica mais difícil.",
      },
      { type: "h2", text: "Primeiro passo: entenda por que foi negado" },
      {
        type: "p",
        text: "A carta de indeferimento (ou a comunicação no Meu INSS) traz o motivo da negativa. Esse motivo é a peça mais importante do seu recurso — é ele que define qual argumento e qual prova você precisa apresentar.",
      },
      {
        type: "list",
        items: [
          "Não reconhecimento de incapacidade: a perícia médica concluiu que você está apto ao trabalho.",
          "Falta de qualidade de segurado: o INSS entendeu que você não estava mais coberto pela Previdência na data do pedido.",
          "Não cumprimento da carência: faltou o número mínimo de contribuições exigido para aquele benefício.",
          "Tempo de contribuição insuficiente: períodos trabalhados não foram computados ou reconhecidos.",
          "Renda familiar superior ao limite: motivo típico de negativa do BPC/LOAS.",
          "Documentação insuficiente: faltou comprovar algo que o INSS considerou essencial.",
        ],
      },
      { type: "h2", text: "Segundo passo: reúna o que comprova sua situação" },
      {
        type: "p",
        text: "O recurso não é apenas discordar da decisão — é apresentar elementos que mostrem que a análise inicial não considerou toda a realidade do seu caso. Laudos médicos mais recentes, exames, registros de trabalho, comprovantes de contribuição e declarações podem mudar completamente o resultado.",
      },
      { type: "h2", text: "Terceiro passo: o recurso administrativo" },
      {
        type: "p",
        text: "O recurso administrativo é gratuito e vai para análise do Conselho de Recursos da Previdência Social (CRPS), um órgão diferente de quem negou o pedido inicialmente. Isso é importante: seu caso será reanalisado por outra instância, com uma composição que inclui representantes do governo, dos trabalhadores e das empresas.",
      },
      {
        type: "p",
        text: "Se a primeira instância (Junta de Recursos) mantiver a negativa, ainda existe a possibilidade de recorrer novamente dentro do próprio CRPS, e depois disso a via judicial permanece aberta.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Você não precisa de advogado para recorrer",
        text: "O recurso administrativo pode ser apresentado pelo próprio segurado. Ter uma peça bem fundamentada aumenta as chances, mas a lei não exige representação por advogado nessa fase.",
      },
      { type: "h2", text: "E se eu perder o prazo de 30 dias?" },
      {
        type: "p",
        text: "Perder o prazo dificulta, mas nem sempre encerra as possibilidades. Dependendo do caso, é possível apresentar um novo requerimento ou buscar a via judicial. Ainda assim, o caminho é bem mais simples quando o recurso é apresentado dentro do prazo — por isso a pressa faz diferença real.",
      },
    ],
  },
  {
    slug: "pericia-do-inss-negou-incapacidade",
    title: "A perícia do INSS disse que você está apto. E se não estiver?",
    excerpt:
      "O motivo mais comum de negativa em auxílio-doença e aposentadoria por invalidez. Entenda como a perícia funciona e o que fortalece sua contestação.",
    category: "Benefícios por incapacidade",
    readingMinutes: 5,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "como-se-preparar-para-a-pericia",
      "auxilio-doenca-negado",
      "documentos-que-fortalecem-seu-recurso",
    ],
    blocks: [
      {
        type: "p",
        text: "É uma das situações mais angustiantes: você está doente, seu médico afirma que você não tem condições de trabalhar, mas a perícia do INSS conclui que não há incapacidade. E o benefício é negado.",
      },
      {
        type: "p",
        text: "Entender por que isso acontece ajuda a montar uma contestação mais forte.",
      },
      { type: "h2", text: "A perícia avalia capacidade, não apenas diagnóstico" },
      {
        type: "p",
        text: "Um erro comum é achar que basta comprovar a doença. Não basta. O que o perito avalia é se a doença impede você de exercer a sua atividade profissional — e por quanto tempo. Duas pessoas com o mesmo diagnóstico podem receber conclusões diferentes, porque exercem funções diferentes.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Diagnóstico ≠ incapacidade",
        text: "Um laudo que diz apenas 'paciente tem hérnia de disco' é fraco. Um laudo que descreve as limitações concretas — não pode permanecer em pé por longos períodos, não pode carregar peso, tem limitação de movimento — e relaciona isso com a função exercida é muito mais convincente.",
      },
      { type: "h2", text: "O que costuma enfraquecer a análise inicial" },
      {
        type: "list",
        items: [
          "Perícia rápida, sem exame físico detalhado ou sem leitura dos exames apresentados.",
          "Documentos médicos antigos, que não refletem o estado atual.",
          "Laudos genéricos, sem descrição das limitações funcionais.",
          "Ausência de exames de imagem ou laboratoriais que confirmem o quadro.",
          "Falta de relação clara entre a limitação e as exigências do seu trabalho.",
        ],
      },
      { type: "h2", text: "Como fortalecer sua contestação" },
      {
        type: "p",
        text: "O recurso deve mostrar, de forma organizada, a distância entre o que a perícia concluiu e o que a documentação médica demonstra. Reúna relatórios atualizados que descrevam suas limitações no dia a dia, exames que sustentem o diagnóstico, histórico de tratamentos, medicações em uso e eventuais afastamentos anteriores.",
      },
      {
        type: "p",
        text: "Também vale descrever com clareza o que sua função exige na prática. Se você trabalha carregando peso, dirigindo por horas, em pé o dia inteiro ou em movimentos repetitivos, isso precisa estar explícito — o perito nem sempre conhece a realidade da sua atividade.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Peça cópia do laudo pericial",
        text: "Você tem direito de acessar a conclusão da perícia. Saber exatamente o que foi registrado permite responder ponto a ponto, em vez de argumentar no escuro.",
      },
    ],
  },
  {
    slug: "documentos-que-fortalecem-seu-recurso",
    title: "Quais documentos realmente fortalecem seu recurso",
    excerpt:
      "Nem todo papel ajuda, e faltar o documento certo é uma das causas mais frequentes de negativa. Veja o que reunir para cada situação.",
    category: "Prática",
    readingMinutes: 5,
    fontes: ["lei8213", "inss"],
    relacionados: [
      "inss-negou-meu-beneficio-o-que-fazer",
      "cnis-como-ler-e-corrigir",
      "como-protocolar-recurso-no-meu-inss",
    ],
    blocks: [
      {
        type: "p",
        text: "Um recurso bem escrito com documentação fraca costuma ter menos efeito do que um recurso simples com provas sólidas. A documentação é o que permite ao julgador enxergar a sua realidade — e ela muda conforme o motivo da negativa.",
      },
      { type: "h2", text: "Documentos que servem para qualquer caso" },
      {
        type: "list",
        items: [
          "Carta de indeferimento ou print da decisão no Meu INSS (mostra o motivo exato da negativa).",
          "Documento de identidade e CPF.",
          "Extrato do CNIS — o histórico das suas contribuições e vínculos registrados.",
          "Comprovante de residência atualizado.",
          "Número do protocolo do pedido original.",
        ],
      },
      { type: "h2", text: "Se a negativa foi por incapacidade (perícia)" },
      {
        type: "list",
        items: [
          "Relatórios médicos recentes, descrevendo limitações funcionais — não apenas o diagnóstico.",
          "Exames de imagem e laboratoriais (com laudo, não só a imagem).",
          "Receituários e histórico de medicações em uso.",
          "Comprovantes de cirurgias, internações ou tratamentos continuados.",
          "Atestados de afastamento anteriores, se houver.",
        ],
      },
      { type: "h2", text: "Se a negativa foi por tempo de contribuição ou vínculo" },
      {
        type: "list",
        items: [
          "Carteira de trabalho (todas as páginas com registro, mesmo as antigas).",
          "Contratos, holerites, rescisões e fichas de registro de empregado.",
          "Guias de recolhimento (GPS/DARF) para contribuintes individuais.",
          "Para trabalho rural: declaração de sindicato, notas de produtor, contratos de parceria, documentos escolares da época.",
          "Certidão de tempo de serviço militar, se aplicável.",
        ],
      },
      { type: "h2", text: "Se a negativa foi por renda (BPC/LOAS)" },
      {
        type: "list",
        items: [
          "Comprovantes de renda de todos que moram na casa.",
          "Cadastro Único (CadÚnico) atualizado.",
          "Comprovantes de despesas essenciais: medicamentos de uso contínuo, tratamentos, fraldas, aluguel.",
          "Laudos que demonstrem gastos permanentes com saúde.",
        ],
      },
      {
        type: "callout",
        variant: "warn",
        title: "Guarde tudo em PDF",
        text: "Guarde cópia digital da carta de negativa, do recurso enviado e do número de protocolo. Se o caso um dia precisar ir para a Justiça, esses documentos são essenciais — e recuperar depois é bem mais difícil.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Documento ilegível não conta",
        text: "Fotografe em local bem iluminado, com o documento inteiro no enquadramento. Um holerite cortado ou uma carteira de trabalho desfocada podem simplesmente ser desconsiderados.",
      },
    ],
  },
  {
    slug: "bpc-loas-negado-por-renda",
    title: "BPC/LOAS negado por renda: entenda o cálculo",
    excerpt:
      "O critério de renda é o motivo mais frequente de negativa do BPC. Saiba como a conta é feita e o que pode ser questionado.",
    category: "BPC/LOAS",
    readingMinutes: 5,
    fontes: ["lei8742", "decreto3048"],
    relacionados: [
      "inss-negou-meu-beneficio-o-que-fazer",
      "documentos-que-fortalecem-seu-recurso",
      "prazo-de-30-dias-para-recorrer",
    ],
    blocks: [
      {
        type: "p",
        text: "O BPC (Benefício de Prestação Continuada), previsto na LOAS, garante um salário mínimo mensal a pessoas idosas ou com deficiência que comprovem não ter meios de prover a própria subsistência nem de tê-la provida pela família. Diferente da aposentadoria, ele é assistencial: não exige contribuições ao INSS.",
      },
      {
        type: "p",
        text: "Justamente por ser assistencial, o critério de renda é rigoroso — e é onde a maioria dos pedidos é negada.",
      },
      { type: "h2", text: "Como a renda é calculada" },
      {
        type: "p",
        text: "O INSS considera a renda mensal do grupo familiar dividida pelo número de pessoas que moram na mesma casa. O resultado é a chamada renda per capita. A regra geral exige que essa renda por pessoa seja inferior a 1/4 do salário mínimo.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Quem entra na conta",
        text: "O grupo familiar não é qualquer pessoa que more junto. A legislação define quem deve ser considerado — cônjuge, companheiro, pais, filhos e irmãos em determinadas condições. Erros na composição do grupo familiar são uma causa comum de negativa injusta.",
      },
      { type: "h2", text: "Onde a conta costuma ficar errada" },
      {
        type: "list",
        items: [
          "Inclusão de pessoas que não integram o grupo familiar segundo a lei.",
          "Consideração de renda que já não existe mais (emprego encerrado, benefício cessado).",
          "Desconsideração de despesas permanentes e elevadas com saúde e medicação.",
          "Contagem de benefícios que, em determinadas situações, não devem entrar no cálculo.",
          "Cadastro Único (CadÚnico) desatualizado, refletindo uma realidade financeira anterior.",
        ],
      },
      { type: "h2", text: "O critério de renda é absoluto?" },
      {
        type: "p",
        text: "Esse é um ponto importante: os tribunais brasileiros vêm reconhecendo, há anos, que o critério puramente matemático de 1/4 do salário mínimo não pode ser aplicado de forma isolada. A situação concreta de vulnerabilidade — gastos altos e permanentes com saúde, condições de moradia, despesas com tratamento — pode e deve ser considerada.",
      },
      {
        type: "p",
        text: "Na prática, isso significa que um pedido negado por ultrapassar o limite por poucos reais, em uma família com gastos elevados de medicação, tem argumentos concretos para ser reanalisado.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Atualize o CadÚnico antes de recorrer",
        text: "Muitas negativas se baseiam em dados antigos do Cadastro Único. Se sua situação mudou, atualizar o cadastro no CRAS antes de apresentar o recurso fortalece bastante o pedido.",
      },
    ],
  },
  {
    slug: "prazo-de-30-dias-para-recorrer",
    title: "Os 30 dias para recorrer: como contar e o que fazer se perdeu",
    excerpt:
      "O prazo é curto e conta em dias corridos. Entenda quando ele começa, como não perder, e quais saídas existem se já passou.",
    category: "Primeiros passos",
    readingMinutes: 4,
    fontes: ["lei8213", "decreto3048", "crps"],
    relacionados: [
      "como-protocolar-recurso-no-meu-inss",
      "crps-junta-de-recursos-como-funciona",
      "inss-negou-meu-beneficio-o-que-fazer",
    ],
    blocks: [
      {
        type: "p",
        text: "Depois da negativa, o relógio começa a correr. A lei dá 30 dias para apresentar recurso administrativo — e esse é provavelmente o detalhe mais importante de todo o processo, porque perdê-lo fecha portas que estavam abertas.",
      },
      { type: "h2", text: "Quando o prazo começa a contar" },
      {
        type: "p",
        text: "O prazo começa na data em que você toma ciência da decisão — não na data em que o INSS decidiu. Na prática, isso costuma ser o dia em que a decisão aparece no Meu INSS ou em que você recebe a comunicação.",
      },
      {
        type: "callout",
        variant: "warn",
        title: "São dias corridos, não úteis",
        text: "Fins de semana e feriados contam. Trinta dias corridos passam mais rápido do que parece — quem espera 'a semana que vem para resolver' frequentemente perde o prazo.",
      },
      { type: "h2", text: "Como não perder o prazo" },
      {
        type: "list",
        items: [
          "Anote a data em que viu a decisão pela primeira vez e guarde um print.",
          "Comece a reunir os documentos imediatamente, mesmo antes de escrever o recurso.",
          "Não espere conseguir 'o documento perfeito' — é possível protocolar e complementar depois.",
          "Se faltam poucos dias, priorize protocolar dentro do prazo em vez de atrasar buscando mais provas.",
        ],
      },
      { type: "h2", text: "E se o prazo já passou?" },
      {
        type: "p",
        text: "Perder o prazo dificulta, mas não necessariamente encerra o assunto. Dependendo da situação, ainda existem caminhos: apresentar um novo requerimento com a documentação que faltava, ou buscar a via judicial, que tem regras próprias de prazo.",
      },
      {
        type: "p",
        text: "Há também situações em que a demora tem justificativa relevante — internação, impossibilidade de acesso, erro na comunicação. Nesses casos vale expor os motivos, porque a análise leva em conta o caso concreto.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Prazo perdido não significa direito perdido",
        text: "O prazo de 30 dias é do recurso administrativo. O direito ao benefício em si segue existindo — o que muda é o caminho para persegui-lo, que passa a ser mais longo.",
      },
    ],
  },
  {
    slug: "auxilio-doenca-negado",
    title: "Auxílio-doença negado: os 3 motivos mais comuns",
    excerpt:
      "Perícia, carência e qualidade de segurado. Entenda qual dos três derrubou seu pedido e o que cada um exige para ser revertido.",
    category: "Benefícios por incapacidade",
    readingMinutes: 6,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "pericia-do-inss-negou-incapacidade",
      "qualidade-de-segurado-e-periodo-de-graca",
      "como-se-preparar-para-a-pericia",
    ],
    blocks: [
      {
        type: "p",
        text: "O auxílio por incapacidade temporária — o antigo auxílio-doença — é um dos benefícios mais pedidos e também um dos mais negados. Quase toda negativa cai em um de três motivos, e cada um se combate de forma diferente.",
      },
      { type: "h2", text: "Motivo 1: a perícia não reconheceu incapacidade" },
      {
        type: "p",
        text: "É o mais frequente. O perito conclui que, apesar da doença, você tem condições de exercer sua atividade. Aqui o recurso precisa demonstrar a distância entre o que a perícia concluiu e o que sua documentação médica mostra — com laudos que descrevam limitações concretas, não apenas o diagnóstico.",
      },
      { type: "h2", text: "Motivo 2: falta de carência" },
      {
        type: "p",
        text: "Para a maioria dos casos, é exigido um número mínimo de contribuições antes do início da incapacidade. Se o INSS entendeu que faltaram contribuições, verifique no seu CNIS se todos os períodos trabalhados aparecem — é comum haver vínculos não registrados.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Existem casos sem exigência de carência",
        text: "Acidentes de qualquer natureza e algumas doenças graves previstas em lei dispensam a carência. Se seu caso se enquadra, esse é um argumento direto e forte no recurso.",
      },
      { type: "h2", text: "Motivo 3: perda da qualidade de segurado" },
      {
        type: "p",
        text: "O INSS entendeu que, na data em que a incapacidade começou, você já não estava mais coberto pela Previdência. Isso acontece quando há um intervalo grande sem contribuir. Mas atenção: existe o chamado período de graça, em que a proteção continua mesmo sem contribuições — e ele é maior do que muita gente imagina.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Descubra qual dos três é o seu caso",
        text: "A carta de indeferimento diz o motivo. Recorrer atacando o argumento errado enfraquece o pedido — leia com atenção antes de montar sua defesa.",
      },
    ],
  },
  {
    slug: "qualidade-de-segurado-e-periodo-de-graca",
    title: "Perdi a qualidade de segurado? Entenda o período de graça",
    excerpt:
      "Parar de contribuir não significa perder a proteção imediatamente. Saiba por quanto tempo você continua coberto — e como isso pode reverter sua negativa.",
    category: "Conceitos essenciais",
    readingMinutes: 5,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "carencia-do-inss-o-que-e",
      "cnis-como-ler-e-corrigir",
      "auxilio-doenca-negado",
    ],
    blocks: [
      {
        type: "p",
        text: "'Perda da qualidade de segurado' é um dos motivos de negativa que mais gera revolta — a pessoa contribuiu por anos, ficou um tempo sem trabalhar, adoeceu, e ouve que não tem direito a nada. Mas em muitos desses casos a proteção ainda existia.",
      },
      { type: "h2", text: "O que é qualidade de segurado" },
      {
        type: "p",
        text: "É a condição de estar coberto pela Previdência. Enquanto você contribui, ela é automática. Ao parar, ela não acaba na hora: existe um intervalo em que você continua protegido mesmo sem pagar nada. Esse intervalo é o período de graça.",
      },
      { type: "h2", text: "Quanto tempo dura a proteção" },
      {
        type: "p",
        text: "A regra geral prevê 12 meses após a última contribuição. Mas esse prazo pode ser ampliado em duas situações que são justamente as mais comuns entre quem tem o benefício negado:",
      },
      {
        type: "list",
        items: [
          "Quem já tem um longo histórico de contribuições pode ter o período de graça estendido além dos 12 meses.",
          "Quem está desempregado e comprova essa situação pode ganhar uma prorrogação adicional.",
          "As duas hipóteses podem se somar, ampliando bastante a janela de proteção.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        title: "Como comprovar o desemprego",
        text: "Registro no seguro-desemprego, anotação de saída na carteira de trabalho, rescisão contratual ou inscrição em órgão de intermediação de mão de obra ajudam a demonstrar a situação e a estender o período de graça.",
      },
      { type: "h2", text: "Por que isso derruba muitas negativas" },
      {
        type: "p",
        text: "O INSS às vezes aplica apenas o prazo básico de 12 meses, sem considerar as prorrogações a que a pessoa tinha direito. Se você contribuiu por muitos anos ou estava comprovadamente desempregado, o cálculo da data em que você teria perdido a qualidade de segurado pode estar errado — e esse é um argumento objetivo, de conferência simples.",
      },
    ],
  },
  {
    slug: "carencia-do-inss-o-que-e",
    title: "Carência do INSS: o que é e quando ela é dispensada",
    excerpt:
      "O número mínimo de contribuições exigido varia conforme o benefício — e há situações em que a lei dispensa completamente.",
    category: "Conceitos essenciais",
    readingMinutes: 4,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "qualidade-de-segurado-e-periodo-de-graca",
      "cnis-como-ler-e-corrigir",
      "auxilio-doenca-negado",
    ],
    blocks: [
      {
        type: "p",
        text: "Carência é o número mínimo de contribuições mensais que você precisa ter feito para ter direito a um benefício. Não é o mesmo que tempo de contribuição — são conceitos diferentes, e confundi-los leva a interpretações erradas da negativa.",
      },
      { type: "h2", text: "Cada benefício tem sua regra" },
      {
        type: "list",
        items: [
          "Benefícios por incapacidade exigem, em regra, um número de contribuições anteriores ao início da doença.",
          "Aposentadoria por idade exige um número bem maior de contribuições.",
          "Salário-maternidade tem regra que varia conforme a categoria: empregadas costumam ter tratamento diferente de contribuintes individuais e facultativas.",
          "Pensão por morte e auxílio-acidente seguem lógicas próprias.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Carência ≠ tempo de contribuição",
        text: "Tempo de contribuição mede quanto tempo você trabalhou e contribuiu. Carência conta quantas contribuições mensais foram efetivamente feitas. É possível ter muito tempo de vínculo e ainda assim faltar carência, se houve meses sem recolhimento.",
      },
      { type: "h2", text: "Quando a carência é dispensada" },
      {
        type: "p",
        text: "A lei prevê situações em que o benefício por incapacidade é devido independentemente do número de contribuições — entre elas acidentes de qualquer natureza e um rol de doenças graves definido em norma. Se o seu caso se enquadra em alguma dessas hipóteses e o INSS negou por carência, o recurso tem um argumento direto.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Confira seu CNIS antes de aceitar o cálculo",
        text: "Boa parte das negativas por carência vem de contribuições que existem mas não constam no sistema. Vale conferir o extrato antes de assumir que a conta do INSS está certa.",
      },
    ],
  },
  {
    slug: "cnis-como-ler-e-corrigir",
    title: "CNIS: como ler seu extrato e corrigir períodos que faltam",
    excerpt:
      "O CNIS é a base de quase toda decisão do INSS. Se ele estiver incompleto, sua negativa pode ser só um erro de registro.",
    category: "Prática",
    readingMinutes: 5,
    fontes: ["inss", "meuInss"],
    relacionados: [
      "qualidade-de-segurado-e-periodo-de-graca",
      "carencia-do-inss-o-que-e",
      "documentos-que-fortalecem-seu-recurso",
    ],
    blocks: [
      {
        type: "p",
        text: "O CNIS (Cadastro Nacional de Informações Sociais) é o histórico oficial dos seus vínculos e contribuições. É a partir dele que o INSS calcula carência, tempo de contribuição e qualidade de segurado. Se ele está incompleto, a decisão sai errada — e isso é mais comum do que se imagina.",
      },
      { type: "h2", text: "Como acessar" },
      {
        type: "p",
        text: "Pelo aplicativo ou site do Meu INSS, com login gov.br, procurando por 'Extrato de Contribuições (CNIS)'. Vale baixar em PDF e guardar.",
      },
      { type: "h2", text: "O que conferir linha por linha" },
      {
        type: "list",
        items: [
          "Se todos os empregos que você teve aparecem, inclusive os mais antigos.",
          "Se as datas de início e fim de cada vínculo estão corretas.",
          "Se há meses em branco dentro de períodos em que você estava trabalhando.",
          "Se aparecem indicadores de pendência ao lado de algum período (o CNIS sinaliza registros com problema).",
          "Se contribuições que você pagou como autônomo constam no extrato.",
        ],
      },
      {
        type: "callout",
        variant: "warn",
        title: "Vínculo antigo é o que mais some",
        text: "Empregos das décadas de 1980 e 1990, especialmente de empresas que fecharam, frequentemente não estão no CNIS. Nesses casos a carteira de trabalho vira a prova principal.",
      },
      { type: "h2", text: "Como corrigir" },
      {
        type: "p",
        text: "Períodos ausentes podem ser incluídos apresentando documentos que comprovem o vínculo: carteira de trabalho, contrato, holerites, ficha de registro de empregado, rescisão. Quanto mais documentos apontando para o mesmo período, mais sólida a comprovação.",
      },
      {
        type: "p",
        text: "Se o INSS negou seu pedido por falta de carência ou tempo insuficiente, anexar esses documentos ao recurso pode reverter a decisão sem precisar discutir mérito nenhum — é apenas um acerto de registro.",
      },
    ],
  },
  {
    slug: "como-protocolar-recurso-no-meu-inss",
    title: "Como protocolar seu recurso no Meu INSS, passo a passo",
    excerpt:
      "Com o recurso pronto em mãos, o envio leva poucos minutos. Veja o caminho exato dentro do aplicativo.",
    category: "Prática",
    readingMinutes: 4,
    fontes: ["meuInss", "inss", "crps"],
    relacionados: [
      "prazo-de-30-dias-para-recorrer",
      "crps-junta-de-recursos-como-funciona",
      "documentos-que-fortalecem-seu-recurso",
    ],
    blocks: [
      {
        type: "p",
        text: "Depois de montar o recurso e reunir os documentos, falta protocolar. Todo o processo é gratuito e pode ser feito pelo próprio segurado, sem intermediário.",
      },
      { type: "h2", text: "O caminho no aplicativo" },
      {
        type: "list",
        items: [
          "Entre no Meu INSS (app ou site) com sua conta gov.br.",
          "Localize o pedido que foi negado, na área de acompanhamento dos seus requerimentos.",
          "Procure a opção de recorrer da decisão.",
          "Anexe o recurso em PDF e todos os documentos comprobatórios.",
          "Confirme o envio e guarde o número de protocolo que aparece na tela.",
        ],
      },
      {
        type: "callout",
        variant: "warn",
        title: "Guarde o protocolo",
        text: "Tire print da tela de confirmação. O número de protocolo é sua prova de que o recurso foi apresentado dentro do prazo — e você vai precisar dele para acompanhar o andamento.",
      },
      { type: "h2", text: "Cuidados ao anexar" },
      {
        type: "list",
        items: [
          "Envie tudo em PDF sempre que possível, com boa legibilidade.",
          "Se fotografar documentos, use local bem iluminado e enquadre a página inteira.",
          "Confira se cada arquivo abriu corretamente após o envio.",
        ],
      },
      { type: "h2", text: "E depois?" },
      {
        type: "p",
        text: "O processo passa a ser analisado por uma instância diferente daquela que negou. O acompanhamento é feito no próprio Meu INSS. Fique atento a eventuais exigências: se o órgão pedir documentos complementares, há prazo para responder, e a falta de resposta pode encerrar a análise.",
      },
    ],
  },
  {
    slug: "crps-junta-de-recursos-como-funciona",
    title: "Quem julga seu recurso: como funciona o CRPS",
    excerpt:
      "Seu recurso não é analisado por quem negou. Entenda as duas instâncias do Conselho de Recursos e o que acontece em cada uma.",
    category: "Conceitos essenciais",
    readingMinutes: 4,
    fontes: ["crps", "decreto3048"],
    relacionados: [
      "recurso-negado-e-agora",
      "prazo-de-30-dias-para-recorrer",
      "como-protocolar-recurso-no-meu-inss",
    ],
    blocks: [
      {
        type: "p",
        text: "Uma dúvida frequente: 'não adianta recorrer, vai cair na mão do mesmo pessoal que negou'. Não é assim. O recurso administrativo é julgado pelo Conselho de Recursos da Previdência Social (CRPS), órgão distinto de quem analisou o pedido inicial.",
      },
      { type: "h2", text: "Primeira instância: Junta de Recursos" },
      {
        type: "p",
        text: "É para onde vai seu recurso inicialmente. As juntas têm composição tripartite — reúnem representantes do governo, dos trabalhadores e das empresas. Essa pluralidade é o que torna a reanálise efetivamente independente da decisão anterior.",
      },
      { type: "h2", text: "Segunda instância: Câmaras de Julgamento" },
      {
        type: "p",
        text: "Se a Junta mantiver a negativa, ainda há a possibilidade de novo recurso, agora para as Câmaras de Julgamento. Também existe prazo para essa etapa, contado da ciência da decisão anterior.",
      },
      {
        type: "callout",
        variant: "info",
        title: "E se todas as instâncias negarem?",
        text: "Esgotada a via administrativa, permanece aberto o caminho judicial. Nessa etapa a representação por advogado passa a ser necessária, e a análise inclui possibilidade de perícia judicial — feita por profissional nomeado pelo juiz, independente do INSS.",
      },
      { type: "h2", text: "Por que a peça bem feita importa" },
      {
        type: "p",
        text: "Quem julga não conhece sua história: lê o que está no processo. Um recurso que identifica com clareza o ponto atacado, apresenta a prova correspondente e fundamenta o pedido dá ao julgador os elementos para decidir a seu favor. Um recurso genérico deixa a decisão anterior de pé por falta do que analisar.",
      },
    ],
  },
  {
    slug: "aposentadoria-por-invalidez-negada",
    title: "Aposentadoria por invalidez negada: o que pesa na análise",
    excerpt:
      "A incapacidade permanente exige mais do que doença grave. Entenda o que o INSS avalia e como estruturar sua contestação.",
    category: "Benefícios por incapacidade",
    readingMinutes: 5,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "pericia-do-inss-negou-incapacidade",
      "auxilio-doenca-negado",
      "como-se-preparar-para-a-pericia",
    ],
    blocks: [
      {
        type: "p",
        text: "A aposentadoria por incapacidade permanente — antiga aposentadoria por invalidez — é devida a quem é considerado incapaz de forma total e definitiva para qualquer atividade que garanta sustento. É justamente essa amplitude que torna a análise mais rigorosa.",
      },
      { type: "h2", text: "Total e permanente: os dois filtros" },
      {
        type: "p",
        text: "Não basta estar impedido de exercer a profissão de sempre. A avaliação considera se existe alguma atividade compatível com sua condição. E não basta a incapacidade ser grave: ela precisa ser insuscetível de recuperação ou reabilitação.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Negativa comum: 'pode ser reabilitado'",
        text: "É frequente o INSS conceder auxílio por incapacidade temporária em vez da aposentadoria, entendendo que há chance de reabilitação para outra função. Contestar isso exige demonstrar por que a reabilitação não é viável no caso concreto.",
      },
      { type: "h2", text: "O que fortalece o pedido" },
      {
        type: "list",
        items: [
          "Relatórios que descrevam o caráter progressivo ou irreversível da condição.",
          "Histórico de tratamentos já tentados sem sucesso, mostrando que as alternativas se esgotaram.",
          "Descrição das limitações no dia a dia, não só no trabalho.",
          "Elementos do contexto pessoal: idade, escolaridade e histórico profissional influenciam a análise sobre reabilitação viável.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        title: "Idade e escolaridade contam",
        text: "A possibilidade real de reinserção no mercado é avaliada considerando a pessoa concreta. Uma limitação que permitiria reabilitação em alguém jovem e escolarizado pode não permitir em quem tem idade avançada e baixa escolaridade — e isso deve ser dito no recurso.",
      },
    ],
  },
  {
    slug: "pensao-por-morte-negada",
    title: "Pensão por morte negada: qualidade de segurado e dependência",
    excerpt:
      "Os dois pontos que derrubam a maioria dos pedidos, e como comprovar cada um deles.",
    category: "Pensão por morte",
    readingMinutes: 5,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "documentos-que-fortalecem-seu-recurso",
      "qualidade-de-segurado-e-periodo-de-graca",
      "prazo-de-30-dias-para-recorrer",
    ],
    blocks: [
      {
        type: "p",
        text: "A pensão por morte é devida aos dependentes de quem faleceu. As negativas quase sempre giram em torno de duas questões: se a pessoa falecida ainda era segurada, e se quem pede é realmente dependente.",
      },
      { type: "h2", text: "Ponto 1: a pessoa falecida era segurada?" },
      {
        type: "p",
        text: "Se o falecimento ocorreu muito tempo depois da última contribuição, o INSS pode entender que a qualidade de segurado já havia se perdido. Aqui vale a mesma análise do período de graça: as prorrogações por longo histórico contributivo ou por desemprego comprovado podem mudar a conta.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Se já havia direito adquirido",
        text: "Há situações em que a pessoa falecida já preenchia os requisitos de alguma aposentadoria antes de morrer, mesmo sem ter pedido. Esse é um argumento relevante quando se discute a qualidade de segurado.",
      },
      { type: "h2", text: "Ponto 2: comprovar a dependência" },
      {
        type: "p",
        text: "Cônjuge, companheiro e filhos em determinadas condições têm dependência presumida — não precisam prová-la. O problema aparece nas uniões estáveis sem documentação formal, que são o caso mais frequente de negativa.",
      },
      {
        type: "list",
        items: [
          "Comprovante de residência em comum, em nome dos dois.",
          "Conta bancária conjunta ou movimentações que demonstrem vida financeira compartilhada.",
          "Filhos em comum.",
          "Inclusão como dependente em plano de saúde, seguro ou declaração de imposto de renda.",
          "Fotos, mensagens e declarações de testemunhas — que sozinhas são frágeis, mas somam quando há documentos.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        title: "Quantidade e variedade importam",
        text: "Um único documento raramente convence. Vários documentos de naturezas diferentes, cobrindo um período longo, formam um conjunto muito mais difícil de rejeitar.",
      },
    ],
  },
  {
    slug: "salario-maternidade-negado",
    title: "Salário-maternidade negado: entenda seu caso",
    excerpt:
      "As regras mudam bastante conforme sua categoria de segurada. Veja o que se aplica a você e o que costuma ser contestável.",
    category: "Salário-maternidade",
    readingMinutes: 4,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "carencia-do-inss-o-que-e",
      "qualidade-de-segurado-e-periodo-de-graca",
      "documentos-que-fortalecem-seu-recurso",
    ],
    blocks: [
      {
        type: "p",
        text: "O salário-maternidade é devido em caso de nascimento, adoção ou guarda para fins de adoção, e também em situações de aborto não criminoso. As regras variam conforme a categoria da segurada — e é aí que mora boa parte das negativas.",
      },
      { type: "h2", text: "Sua categoria muda a regra" },
      {
        type: "p",
        text: "Empregadas, empregadas domésticas, trabalhadoras avulsas, contribuintes individuais, facultativas e seguradas especiais (rurais) têm tratamentos distintos, especialmente quanto à exigência de carência. Identificar corretamente sua categoria é o primeiro passo para saber se a negativa procede.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Desempregada também pode ter direito",
        text: "Quem estava dentro do período de graça na data do parto pode ter direito ao benefício mesmo sem estar trabalhando. Negativas que ignoram esse ponto são contestáveis.",
      },
      { type: "h2", text: "Motivos frequentes de negativa" },
      {
        type: "list",
        items: [
          "Falta de carência, quando ela é exigida para a categoria.",
          "Entendimento de que a qualidade de segurada havia se perdido.",
          "Divergências de datas entre o registro do nascimento e os dados do sistema.",
          "Vínculo de trabalho não constante no CNIS.",
        ],
      },
      { type: "h2", text: "Trabalhadora rural" },
      {
        type: "p",
        text: "A segurada especial tem regra própria, ligada à comprovação do exercício de atividade rural no período que antecede o parto. Documentos que demonstrem a atividade — mesmo que não estejam em seu nome, mas do grupo familiar — costumam ser o ponto central da discussão.",
      },
    ],
  },
  {
    slug: "aposentadoria-por-idade-negada",
    title: "Aposentadoria por idade negada: onde a conta costuma falhar",
    excerpt:
      "Idade mínima e contribuições são requisitos objetivos. Quando um pedido é negado, quase sempre há período faltando no sistema.",
    category: "Aposentadoria",
    readingMinutes: 5,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "carencia-do-inss-o-que-e",
      "cnis-como-ler-e-corrigir",
      "trabalhador-rural-como-comprovar",
    ],
    blocks: [
      {
        type: "p",
        text: "A aposentadoria por idade tem requisitos objetivos: atingir a idade mínima e comprovar o número exigido de contribuições. Por serem critérios matemáticos, as negativas raramente envolvem interpretação — costumam envolver períodos que o sistema não reconheceu.",
      },
      { type: "h2", text: "Os requisitos" },
      {
        type: "p",
        text: "Depois da reforma da Previdência (EC 103/2019), a idade mínima é de 65 anos para homens e 62 para mulheres, além de um número mínimo de anos de contribuição. Quem já contribuía antes de novembro de 2019 pode se enquadrar em regras de transição, que preveem condições diferentes.",
      },
      {
        type: "callout",
        variant: "warn",
        title: "Regras de transição existem — e são ignoradas com frequência",
        text: "Se você começou a contribuir antes da reforma, pode ter direito a condições mais favoráveis do que a regra geral. Vale verificar se a análise considerou a regra correta para o seu caso.",
      },
      { type: "h2", text: "Onde a conta falha" },
      {
        type: "list",
        items: [
          "Vínculos antigos ausentes do CNIS, principalmente de empresas encerradas.",
          "Períodos de trabalho rural não computados por falta de documentação.",
          "Contribuições como autônomo pagas mas não registradas.",
          "Tempo de serviço militar não incluído.",
          "Períodos em que houve recebimento de benefício por incapacidade, que em certas situações contam.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        title: "Reúna prova de cada período faltante",
        text: "Como o critério é numérico, o recurso é objetivo: identifique exatamente quais períodos não foram computados, anexe a documentação de cada um e peça expressamente o recálculo.",
      },
    ],
  },
  {
    slug: "trabalhador-rural-como-comprovar",
    title: "Trabalhador rural: como comprovar a atividade sem carteira assinada",
    excerpt:
      "A maioria de quem trabalhou na roça nunca teve registro formal. Veja quais documentos a lei aceita como prova.",
    category: "Trabalho rural",
    readingMinutes: 5,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "aposentadoria-por-idade-negada",
      "documentos-que-fortalecem-seu-recurso",
      "carencia-do-inss-o-que-e",
    ],
    blocks: [
      {
        type: "p",
        text: "Quem trabalhou na agricultura familiar, em regime de economia familiar, raramente tem carteira assinada. A lei reconhece essa realidade e admite outras formas de comprovação — mas exige que exista algum documento, não apenas testemunhas.",
      },
      { type: "h2", text: "A regra do início de prova material" },
      {
        type: "p",
        text: "Prova exclusivamente testemunhal não é suficiente. É preciso apresentar ao menos um documento que aponte para a atividade rural no período — o chamado início de prova material. A partir dele, testemunhos podem complementar e ampliar o reconhecimento.",
      },
      { type: "h2", text: "Documentos que costumam ser aceitos" },
      {
        type: "list",
        items: [
          "Declaração de sindicato de trabalhadores rurais, quando homologada.",
          "Notas fiscais de produtor rural.",
          "Contratos de parceria, arrendamento ou comodato de terra.",
          "Documentos escolares da época que indiquem residência ou profissão rural dos pais.",
          "Certidão de casamento ou de nascimento de filhos em que conste a profissão de lavrador.",
          "Registros de imóvel rural, ITR ou CCIR.",
          "Comprovantes de participação em programas voltados à agricultura familiar.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Documento em nome de outro familiar também vale",
        text: "No regime de economia familiar, documentos em nome do cônjuge, dos pais ou de outro membro do grupo costumam ser aceitos para comprovar a atividade de quem trabalhava junto — a atividade é familiar, não individual.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Cubra o período inteiro",
        text: "Um documento de um único ano comprova aquele ano. Se você precisa demonstrar quinze anos de atividade, reúna documentos espalhados ao longo de todo esse intervalo — a distribuição temporal é o que sustenta o reconhecimento do período completo.",
      },
    ],
  },
  {
    slug: "auxilio-acidente-negado",
    title: "Auxílio-acidente negado: a sequela que reduz a capacidade",
    excerpt:
      "Um benefício pouco conhecido e frequentemente negado. Entenda quando ele é devido e por que não impede você de trabalhar.",
    category: "Benefícios por incapacidade",
    readingMinutes: 4,
    fontes: ["lei8213", "decreto3048"],
    relacionados: [
      "pericia-do-inss-negou-incapacidade",
      "auxilio-doenca-negado",
      "documentos-que-fortalecem-seu-recurso",
    ],
    blocks: [
      {
        type: "p",
        text: "O auxílio-acidente é diferente dos demais benefícios por incapacidade: ele não é para quem está impedido de trabalhar. É uma indenização mensal para quem ficou com sequela permanente que reduz a capacidade de exercer a atividade habitual.",
      },
      { type: "h2", text: "O que caracteriza o direito" },
      {
        type: "list",
        items: [
          "Ter ocorrido acidente de qualquer natureza — não precisa ser de trabalho.",
          "Restar sequela definitiva, consolidada (ou seja, o tratamento já se estabilizou).",
          "Essa sequela reduzir a capacidade para o trabalho que a pessoa exercia.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Você continua podendo trabalhar",
        text: "Diferente do auxílio por incapacidade, aqui a pessoa segue trabalhando e recebendo salário. O benefício é uma compensação pela redução da capacidade, não uma substituição da renda.",
      },
      { type: "h2", text: "Por que é tão negado" },
      {
        type: "p",
        text: "O ponto mais contestado é a comprovação de que a sequela efetivamente reduz a capacidade para aquela atividade específica. Uma limitação de movimento no ombro pesa de forma muito diferente para quem trabalha em escritório e para quem trabalha na construção civil.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Descreva sua função em detalhe",
        text: "O recurso deve explicar concretamente o que sua atividade exige — esforço, repetição, posição, peso — e relacionar isso com a sequela. Sem essa ligação explícita, a análise tende a concluir que não há redução relevante.",
      },
    ],
  },
  {
    slug: "como-se-preparar-para-a-pericia",
    title: "Como se preparar para a perícia médica do INSS",
    excerpt:
      "A perícia dura poucos minutos e define seu benefício. Veja o que levar e como apresentar seu caso com clareza.",
    category: "Benefícios por incapacidade",
    readingMinutes: 4,
    fontes: ["lei8213", "inss"],
    relacionados: [
      "pericia-do-inss-negou-incapacidade",
      "auxilio-doenca-negado",
      "documentos-que-fortalecem-seu-recurso",
    ],
    blocks: [
      {
        type: "p",
        text: "A perícia costuma ser rápida e decide o rumo do pedido. Chegar preparada não é tentar manipular o resultado — é garantir que a avaliação tenha em mãos tudo que a sua condição realmente envolve.",
      },
      { type: "h2", text: "O que levar" },
      {
        type: "list",
        items: [
          "Documento de identidade com foto.",
          "Todos os laudos e relatórios médicos, do mais antigo ao mais recente, organizados por data.",
          "Exames de imagem com os respectivos laudos escritos.",
          "Receituários e caixas ou listas dos medicamentos em uso.",
          "Comprovantes de cirurgias, internações e sessões de fisioterapia.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        title: "Ordem cronológica ajuda",
        text: "Documentos organizados por data contam uma história: quando começou, como evoluiu, o que já foi tentado. Uma pilha desorganizada dificulta que o perito enxergue esse percurso no tempo que ele tem.",
      },
      { type: "h2", text: "Como relatar sua situação" },
      {
        type: "list",
        items: [
          "Descreva o que você não consegue fazer, com exemplos concretos do dia a dia.",
          "Relacione as limitações com as exigências do seu trabalho.",
          "Não minimize nem exagere — relate como realmente é, inclusive nos dias piores.",
          "Mencione tratamentos que já tentou e não resolveram.",
        ],
      },
      {
        type: "callout",
        variant: "warn",
        title: "Não falte",
        text: "A ausência na perícia normalmente leva ao arquivamento do pedido. Se houver impossibilidade real de comparecer, procure remarcar pelos canais oficiais antes da data.",
      },
    ],
  },
  {
    slug: "recurso-negado-e-agora",
    title: "Meu recurso também foi negado. E agora?",
    excerpt:
      "A negativa em primeira instância não encerra o processo. Conheça os caminhos que continuam disponíveis.",
    category: "Primeiros passos",
    readingMinutes: 4,
    fontes: ["crps", "lei8213"],
    relacionados: [
      "crps-junta-de-recursos-como-funciona",
      "prazo-de-30-dias-para-recorrer",
      "inss-negou-meu-beneficio-o-que-fazer",
    ],
    blocks: [
      {
        type: "p",
        text: "Receber nova negativa depois de ter recorrido é desanimador. Mas o sistema previdenciário prevê mais de uma instância justamente porque decisões podem ser revistas — e ainda há caminhos.",
      },
      { type: "h2", text: "Caminho 1: recorrer novamente na esfera administrativa" },
      {
        type: "p",
        text: "Se a negativa veio da Junta de Recursos, cabe novo recurso às Câmaras de Julgamento. Há prazo para isso, contado da ciência da decisão — o mesmo cuidado com datas se aplica aqui.",
      },
      { type: "h2", text: "Caminho 2: novo requerimento" },
      {
        type: "p",
        text: "Se, desde o pedido original, sua situação mudou — a doença progrediu, você reuniu documentos que não tinha, completou requisitos que faltavam — pode fazer valer a pena entrar com um novo requerimento em vez de insistir no processo antigo.",
      },
      { type: "h2", text: "Caminho 3: via judicial" },
      {
        type: "p",
        text: "Esgotada a esfera administrativa, resta a Justiça. Nessa etapa é necessário advogado, e o processo inclui a possibilidade de perícia judicial — feita por profissional nomeado pelo juiz, independente do INSS. Para muitos casos de incapacidade, essa perícia independente muda o resultado.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Se você não pode pagar advogado",
        text: "A Defensoria Pública da União atua em causas previdenciárias, e diversas seccionais da OAB mantêm serviços de assistência para quem se enquadra em critérios de renda. Vale procurar antes de desistir.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Entenda o motivo da nova negativa",
        text: "Se o segundo motivo é diferente do primeiro, isso é informação valiosa: significa que o argumento inicial foi superado e agora a discussão é outra. Ler a decisão com atenção orienta o próximo passo.",
      },
    ],
  },
];

export function getGuia(slug: string) {
  return guias.find((g) => g.slug === slug);
}
