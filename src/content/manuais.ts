/**
 * Manuais em PDF — a esteira de entrada da Recurso Fácil.
 *
 * Quem busca "como recorrer do INSS" tem intenção de DÚVIDA, não de compra: não
 * está pronto para pagar R$ 299 num serviço, está tentando entender o que
 * aconteceu. O manual de R$ 9,90 atende essa pessoa — e, feito do jeito certo,
 * vira a melhor ferramenta de venda do serviço: ao mostrar honestamente o
 * trabalho e o risco de fazer sozinho, a maioria conclui que prefere receber
 * pronto. Por isso cada manual ensina de verdade, mas o modelo vem como
 * ESQUELETO (estrutura a preencher), nunca como peça pronta que substitua o
 * serviço.
 *
 * Esta é a FONTE ÚNICA do conteúdo: a página de leitura no site e o PDF são
 * gerados a partir daqui. Blocos do tipo `jurisprudencia` com `revisar: true`
 * aparecem destacados como "a validar" — nada de acórdão inventado vai ao ar
 * sem conferência da autora.
 */

export type BlocoManual =
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "lista"; itens: string[] }
  | {
      tipo: "destaque";
      variante: "info" | "atencao" | "cuidado" | "dica";
      titulo?: string;
      texto: string;
    }
  /** Dispositivo de lei citado — renderizado com destaque de "base legal". */
  | { tipo: "lei"; referencia: string; texto: string }
  /**
   * Reforço de jurisprudência. Nasce com `revisar: true` (a IA não publica
   * citação sem conferência); vira `false` quando a autora valida a redação.
   */
  | { tipo: "jurisprudencia"; tema: string; referencia?: string; texto: string; revisar: boolean }
  /** Trecho de modelo — esqueleto a preencher, com [colchetes] onde entra o caso. */
  | { tipo: "modelo"; titulo: string; texto: string }
  /** Faixa "fale com um especialista" — vira o botão de WhatsApp no site/PDF. */
  | { tipo: "whatsapp"; texto?: string }
  /** Página final de conversão (receba pronto / WhatsApp). Uma por manual. */
  | { tipo: "cta_final" };

export interface SecaoManual {
  titulo: string;
  blocos: BlocoManual[];
}

export interface Manual {
  slug: string;
  /** Liga ao benefício em src/content/beneficios.ts (para colocar a oferta lá). */
  beneficioSlug: string;
  titulo: string;
  subtitulo: string;
  precoCents: number;
  /** Frase de venda curta, usada no card de oferta. */
  resumo: string;
  /** O que a pessoa recebe — bullets do card de oferta. */
  promessa: string[];
  secoes: SecaoManual[];
}

const auxilioDoenca: Manual = {
  slug: "auxilio-doenca",
  beneficioSlug: "auxilio-doenca",
  titulo: "Como recorrer do auxílio-doença negado pelo INSS",
  subtitulo:
    "O passo a passo completo do recurso administrativo — da leitura da carta ao protocolo no Meu INSS",
  precoCents: 990,
  resumo:
    "Manual prático e completo para montar você mesmo o recurso do auxílio-doença (benefício por incapacidade temporária) negado — com a base legal, a estrutura da peça, o modelo e os documentos que sustentam o pedido.",
  promessa: [
    "Entenda exatamente por que o INSS negou e o que rebater",
    "A estrutura da peça, seção por seção, com modelo para preencher",
    "A base legal de cada argumento (Lei 8.213/91 e Decreto 3.048/99)",
    "O checklist de documentos que fortalecem o recurso",
    "Como protocolar no Meu INSS, passo a passo",
    "PDF para baixar, ler no celular e consultar quando precisar",
  ],
  secoes: [
    {
      titulo: "1. Antes de começar: o que este manual é (e o que não é)",
      blocos: [
        {
          tipo: "paragrafo",
          texto:
            "Se o INSS negou o seu auxílio-doença — hoje chamado oficialmente de benefício por incapacidade temporária — você tem o direito de recorrer administrativamente, e este manual mostra como fazer isso do início ao fim. Ele foi escrito para uma pessoa comum, sem formação jurídica, que quer entender o processo e tentar por conta própria.",
        },
        {
          tipo: "paragrafo",
          texto:
            "Seja honesto consigo mesmo sobre uma coisa desde já: recorrer sozinho é possível, mas exige atenção. O recurso é analisado por um colegiado de julgadores (a Junta de Recursos), e um recurso mal fundamentado, sem os documentos certos ou fora do prazo, costuma ser negado de novo — e aí você terá gasto o seu prazo. Este manual reduz muito esse risco, mas não elimina o trabalho. Ao longo do texto, sempre que uma etapa for delicada, isso estará sinalizado.",
        },
        {
          tipo: "destaque",
          variante: "info",
          titulo: "Prefere não fazer sozinho?",
          texto:
            "Se em algum momento você concluir que prefere receber o recurso pronto, fundamentado e revisado, esse é exatamente o serviço da Recurso Fácil. No final deste manual há o link direto. E em qualquer página, o botão do WhatsApp leva você a falar com um especialista.",
        },
        { tipo: "whatsapp" },
      ],
    },
    {
      titulo: "2. Primeiro de tudo: você ainda está no prazo?",
      blocos: [
        {
          tipo: "paragrafo",
          texto:
            "Antes de qualquer coisa, verifique o prazo — porque nenhum argumento salva um recurso protocolado fora dele. O prazo para o recurso administrativo (recurso ordinário) é de 30 dias, contados da data em que você tomou ciência da decisão que negou o benefício.",
        },
        {
          tipo: "lei",
          referencia: "Regimento Interno do CRPS / Lei nº 9.784/99 (aplicação subsidiária)",
          texto:
            "O recurso das decisões do INSS é dirigido ao Conselho de Recursos da Previdência Social (CRPS), sendo de 30 dias o prazo para sua interposição. O processo administrativo federal, subsidiariamente, rege a contagem e a forma dos atos.",
        },
        {
          tipo: "destaque",
          variante: "atencao",
          titulo: "O que é 'ciência'",
          texto:
            "Ciência é a data em que você ficou sabendo da negativa — em geral, a data da carta de indeferimento ou do aviso no Meu INSS. Ela pode ser diferente da data em que o INSS decidiu. Conte os 30 dias a partir de quando você soube.",
        },
        {
          tipo: "paragrafo",
          texto:
            "Perdeu o prazo? Nem tudo está perdido, mas o caminho muda: normalmente passa a ser apresentar um novo requerimento (que recomeça a análise) ou buscar a via judicial. Se ainda está dentro dos 30 dias, siga em frente — dá tempo.",
        },
      ],
    },
    {
      titulo: "3. Entenda por que o INSS negou (o passo que a maioria pula)",
      blocos: [
        {
          tipo: "paragrafo",
          texto:
            "Um bom recurso não fala de tudo: ele ataca exatamente o motivo pelo qual o INSS negou. Por isso, o primeiro trabalho é ler a carta de indeferimento e identificar o fundamento da negativa. No auxílio-doença, quase sempre é um destes três.",
        },
        {
          tipo: "subtitulo",
          texto: "Motivo A — 'Não constatada incapacidade laborativa' (parecer contrário da perícia)",
        },
        {
          tipo: "paragrafo",
          texto:
            "É o motivo mais comum. O perito do INSS examinou você e concluiu que você tem condições de trabalhar. Recorrer aqui é demonstrar, com documentação médica, que existe incapacidade — e, principalmente, incapacidade para o SEU trabalho.",
        },
        {
          tipo: "destaque",
          variante: "dica",
          titulo: "A virada de chave",
          texto:
            "Não basta provar que você tem uma doença. É preciso mostrar que ela IMPEDE você de exercer a sua função. Uma tendinite grave incapacita um pedreiro, não necessariamente um recepcionista. O laudo tem que falar de limitação funcional em relação ao seu trabalho concreto.",
        },
        {
          tipo: "subtitulo",
          texto: "Motivo B — 'Perda da qualidade de segurado'",
        },
        {
          tipo: "paragrafo",
          texto:
            "O INSS entendeu que, quando a incapacidade começou, você já não estava mais coberto pela Previdência — em geral porque parou de contribuir há tempo demais. Aqui o recurso discute o chamado 'período de graça'.",
        },
        {
          tipo: "subtitulo",
          texto: "Motivo C — 'Carência não cumprida'",
        },
        {
          tipo: "paragrafo",
          texto:
            "O INSS contou menos contribuições do que o mínimo exigido. Como regra, o auxílio-doença exige 12 contribuições mensais antes do pedido — mas há exceções importantes, e erros no CNIS são comuns e corrigíveis.",
        },
        {
          tipo: "destaque",
          variante: "cuidado",
          texto:
            "Identifique o SEU motivo antes de escrever qualquer linha. Recurso que argumenta o motivo errado — por exemplo, discute incapacidade quando a negativa foi por carência — é negado sem nem entrar no mérito do que interessa.",
        },
        { tipo: "whatsapp", texto: "Não conseguiu identificar o motivo na carta? Fale com um especialista." },
      ],
    },
    {
      titulo: "4. A base legal — o que sustenta cada argumento",
      blocos: [
        {
          tipo: "paragrafo",
          texto:
            "Um recurso convence quando mostra que a lei está do seu lado. Abaixo estão os dispositivos que sustentam cada um dos três motivos. Você não precisa decorá-los — precisa citá-los no lugar certo, e este manual mostra onde.",
        },
        {
          tipo: "lei",
          referencia: "Art. 59 da Lei nº 8.213/91",
          texto:
            "Assegura o benefício por incapacidade temporária ao segurado que, cumprida a carência quando exigida, ficar incapacitado para o seu trabalho ou atividade habitual por mais de 15 dias consecutivos.",
        },
        {
          tipo: "lei",
          referencia: "Art. 25, I, da Lei nº 8.213/91",
          texto:
            "Fixa a carência do auxílio-doença em 12 contribuições mensais. É a regra geral do Motivo C.",
        },
        {
          tipo: "lei",
          referencia: "Art. 26, II, da Lei nº 8.213/91",
          texto:
            "Dispensa a carência em caso de acidente de qualquer natureza e nas doenças graves previstas em lista oficial. Se o seu caso se enquadra, a negativa por carência não se sustenta.",
        },
        {
          tipo: "lei",
          referencia: "Art. 15 da Lei nº 8.213/91 (período de graça)",
          texto:
            "Mantém a qualidade de segurado, sem contribuir, por até 12 meses após cessar as contribuições (inciso II); prazo que sobe para 24 meses a quem já pagou mais de 120 contribuições (§1º) e pode ganhar mais 12 meses em caso de desemprego comprovado (§2º). É o coração do recurso do Motivo B.",
        },
        {
          tipo: "jurisprudencia",
          tema: "Incapacidade parcial + condições pessoais e sociais do segurado",
          referencia: "Súmula 47 da TNU",
          texto:
            "“Uma vez reconhecida a incapacidade parcial para o trabalho, o juiz deve analisar as condições pessoais e sociais do segurado para a concessão de aposentadoria por invalidez.” É jurisprudência judicial (persuasiva no recurso administrativo, não vinculante) e trata da aposentadoria por invalidez: serve quando a perícia admite alguma limitação e as suas condições — idade, escolaridade, histórico de trabalho — tornam inviável voltar a trabalhar.",
          revisar: false,
        },
        {
          tipo: "jurisprudencia",
          tema: "Desemprego para prorrogar o período de graça não exige registro formal",
          referencia: "Súmula 27 da TNU",
          texto:
            "“A ausência de registro em órgão do Ministério do Trabalho não impede a comprovação do desemprego por outros meios admitidos em Direito.” Reforça o Motivo B: o desemprego que estende o período de graça (art. 15, §2º) pode ser provado por outros meios, não só pela baixa na carteira. Atenção: a anotação de saída na CTPS, isoladamente, tende a não bastar — reúna outros indícios junto.",
          revisar: false,
        },
        {
          tipo: "destaque",
          variante: "info",
          titulo: "Sobre as súmulas citadas",
          texto:
            "As Súmulas 47 e 27 são da TNU (Turma Nacional de Uniformização) — jurisprudência dos juizados federais. No recurso administrativo, valem como reforço de argumento (persuasivo), não como regra que obriga a Junta. Ainda assim, mostram que o entendimento existe e ajudam a sustentar o pedido.",
        },
      ],
    },
    {
      titulo: "5. A estrutura do recurso — seção por seção",
      blocos: [
        {
          tipo: "paragrafo",
          texto:
            "O recurso administrativo não tem uma forma rígida como uma petição judicial, mas um recurso organizado é lido com mais atenção e convence mais. Use a estrutura abaixo. Os trechos em [colchetes] são onde você encaixa os dados do seu caso — este é o esqueleto, não uma peça pronta: a força do recurso está na argumentação que você constrói dentro dele.",
        },
        {
          tipo: "modelo",
          titulo: "Endereçamento e identificação",
          texto:
            "À JUNTA DE RECURSOS DO CONSELHO DE RECURSOS DA PREVIDÊNCIA SOCIAL (CRPS)\n\nProcesso/Requerimento nº [número do benefício / protocolo]\nNB (Número do Benefício): [se houver]\n\n[NOME COMPLETO], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF sob o nº [CPF], residente em [endereço completo], vem, tempestivamente, apresentar RECURSO em face da decisão que indeferiu o benefício por incapacidade temporária, pelas razões a seguir.",
        },
        {
          tipo: "modelo",
          titulo: "I – Dos fatos",
          texto:
            "Narre, em ordem: quando adoeceu/se acidentou; qual é a doença ou lesão (com o CID, se souber); como ela afeta o seu trabalho; quando pediu o benefício; e o que o INSS respondeu.\n\nEx.: 'O(A) recorrente exerce a função de [função], que exige [esforço/movimento]. Em [data], passou a sofrer de [doença/CID], que o(a) impede de [o que não consegue mais fazer]. Requereu o benefício em [data], indeferido sob o fundamento de [motivo da carta].'",
        },
        {
          tipo: "modelo",
          titulo: "II – Do direito",
          texto:
            "Aqui você rebate o motivo da negativa usando a lei da Seção 4. Escreva um parágrafo por argumento.\n\nSe foi Motivo A (incapacidade): sustente, com base no art. 59 da Lei 8.213/91 e nos laudos, que existe incapacidade para a atividade habitual, detalhando a limitação funcional.\n\nSe foi Motivo B (qualidade de segurado): invoque o art. 15 e demonstre que, na data do início da incapacidade, você ainda estava no período de graça.\n\nSe foi Motivo C (carência): aponte as contribuições existentes (ou a hipótese de dispensa do art. 26, II) e junte o CNIS.",
        },
        {
          tipo: "modelo",
          titulo: "III – Dos documentos",
          texto:
            "Liste os documentos que acompanham o recurso (ver a Seção 6). Ex.: 'Instruem este recurso: laudo do Dr.(a) [nome], de [data], com CID [ ]; exames de [data]; extrato do CNIS; cópia da carta de indeferimento.'",
        },
        {
          tipo: "modelo",
          titulo: "IV – Do pedido",
          texto:
            "'Ante o exposto, requer o conhecimento e provimento do recurso, para reformar a decisão recorrida e conceder o benefício por incapacidade temporária desde a data do requerimento, com o pagamento das parcelas em atraso.'\n\nLocal, data e assinatura.",
        },
        {
          tipo: "destaque",
          variante: "cuidado",
          titulo: "Onde os recursos caseiros costumam falhar",
          texto:
            "É na seção 'Do direito' que a maioria dos recursos feitos sem apoio perde força: repetem que 'estão doentes' sem ligar a doença à incapacidade para o trabalho e sem citar a base legal. É um trabalho de argumentação — e é exatamente o que o serviço pronto faz por você, com fundamentação sob medida para o seu caso.",
        },
        { tipo: "whatsapp", texto: "Quer que essa parte seja escrita para o seu caso? Fale no WhatsApp." },
      ],
    },
    {
      titulo: "6. Os documentos que fortalecem o recurso",
      blocos: [
        {
          tipo: "paragrafo",
          texto:
            "O recurso é decidido pelos documentos. Reúna o máximo que conseguir dos itens abaixo — quanto mais a documentação médica descrever a sua limitação para o trabalho, mais forte fica.",
        },
        {
          tipo: "lista",
          itens: [
            "Laudos e relatórios médicos recentes, com CID e, sobretudo, a descrição das limitações funcionais (o que você não consegue mais fazer)",
            "Exames de imagem e resultados laboratoriais que comprovem a doença",
            "Receituários e comprovantes de tratamento contínuo",
            "Atestados de afastamento anteriores",
            "Um documento que descreva as funções do seu trabalho (carteira, contrato, declaração do empregador)",
            "Extrato do CNIS atualizado (para os motivos de carência e qualidade de segurado)",
            "Cópia da carta de indeferimento",
          ],
        },
        {
          tipo: "destaque",
          variante: "dica",
          titulo: "Como pegar o CNIS e a carta",
          texto:
            "Os dois saem do Meu INSS (aplicativo ou site meu.inss.gov.br), na área 'Extrato Previdenciário (CNIS)' e no histórico do seu pedido. O CNIS mostra todas as suas contribuições — confira se não falta nenhuma, porque vínculo faltando é a causa mais comum de negativa por carência.",
        },
      ],
    },
    {
      titulo: "7. Como protocolar o recurso no Meu INSS",
      blocos: [
        {
          tipo: "paragrafo",
          texto:
            "Com o recurso escrito e os documentos digitalizados (de preferência em PDF, legíveis), o protocolo é feito pelo Meu INSS, sem sair de casa.",
        },
        {
          tipo: "lista",
          itens: [
            "Entre no aplicativo ou site Meu INSS e faça login com a conta gov.br",
            "Toque em 'Novo pedido' e busque por 'Recurso' (Recurso de decisão / à Junta de Recursos)",
            "Selecione o benefício indeferido correspondente",
            "Anexe o arquivo do recurso e todos os documentos",
            "Confira os dados, conclua e GUARDE o número de protocolo",
          ],
        },
        {
          tipo: "destaque",
          variante: "atencao",
          texto:
            "Acompanhe o andamento pelo próprio Meu INSS. Se a Junta pedir alguma complementação, responda dentro do prazo indicado — pedido não respondido pode ser julgado no estado em que está.",
        },
      ],
    },
    {
      titulo: "8. Cinco erros que fazem o recurso ser negado de novo",
      blocos: [
        {
          tipo: "lista",
          itens: [
            "Perder o prazo de 30 dias — nenhum argumento recupera isso",
            "Argumentar o motivo errado (falar de incapacidade quando a negativa foi por carência, por exemplo)",
            "Provar a doença, mas não a incapacidade para o SEU trabalho",
            "Anexar laudo antigo, ilegível ou sem CID e sem descrição da limitação",
            "Não juntar o CNIS quando o motivo envolve carência ou qualidade de segurado",
          ],
        },
        {
          tipo: "destaque",
          variante: "info",
          titulo: "Lembre-se",
          texto:
            "Você tem, em regra, uma chance de recurso ordinário. Vale a pena caprichar — ou entregar essa parte a quem faz isso todos os dias.",
        },
      ],
    },
    {
      titulo: "Receba o seu recurso pronto",
      blocos: [{ tipo: "cta_final" }],
    },
  ],
};

export const manuais: Manual[] = [auxilioDoenca];

export function getManual(slug: string): Manual | undefined {
  return manuais.find((m) => m.slug === slug);
}

/** Manual que atende um benefício (para a oferta na página do benefício). */
export function getManualPorBeneficio(beneficioSlug: string): Manual | undefined {
  return manuais.find((m) => m.beneficioSlug === beneficioSlug);
}

/** Total de pontos de jurisprudência ainda pendentes de validação da autora. */
export function pendenciasDeRevisao(manual: Manual): number {
  return manual.secoes
    .flatMap((s) => s.blocos)
    .filter((b) => b.tipo === "jurisprudencia" && b.revisar).length;
}
