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
}

export const guias: Guia[] = [
  {
    slug: "inss-negou-meu-beneficio-o-que-fazer",
    title: "O INSS negou meu benefício. O que fazer agora?",
    excerpt:
      "Receber a carta de indeferimento não é o fim do processo. Entenda seus direitos, o prazo que você tem e quais caminhos existem.",
    category: "Primeiros passos",
    readingMinutes: 6,
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
];

export function getGuia(slug: string) {
  return guias.find((g) => g.slug === slug);
}
