/**
 * Seed inicial:
 *  - cria admin padrão
 *  - popula base de conhecimento com legislação essencial
 *  - cria alguns posts de blog
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@plataformainss.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "troque-esta-senha-123";

  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await db.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "ADMIN",
      },
    });
    console.log(`✓ admin criado: ${adminEmail} / ${adminPassword}`);
  }

  // === Base de conhecimento inicial ===
  const kbItems = [
    {
      title: "Lei 8.213/91 — Art. 15 (Qualidade de segurado)",
      kind: "LEGISLACAO",
      tags: ["FALTA_QUALIDADE_SEGURADO", "AUXILIO_DOENCA", "APOSENTADORIA_INVALIDEZ"],
      content: `Art. 15. Mantém a qualidade de segurado, independentemente de contribuições:
I - sem limite de prazo, quem está em gozo de benefício, exceto do auxílio-acidente;
II - até 12 (doze) meses após a cessação das contribuições, o segurado que deixar de exercer atividade remunerada abrangida pela Previdência Social ou estiver suspenso ou licenciado sem remuneração;
§1º O prazo do inciso II será prorrogado para até 24 (vinte e quatro) meses se o segurado já tiver pago mais de 120 (cento e vinte) contribuições mensais sem interrupção que acarrete a perda da qualidade de segurado.
§2º Os prazos do inciso II ou do §1º serão acrescidos de 12 (doze) meses para o segurado desempregado, desde que comprovada essa situação.`,
    },
    {
      title: "Lei 8.213/91 — Art. 126 (Prazo para recurso administrativo)",
      kind: "LEGISLACAO",
      tags: ["TODOS"],
      content: `Art. 126. Das decisões do Instituto Nacional do Seguro Social - INSS nos processos de interesse dos beneficiários e dos contribuintes da Seguridade Social caberá recurso para o Conselho de Recursos da Previdência Social, conforme dispuser o Regulamento. O prazo para interposição é de 30 (trinta) dias.`,
    },
    {
      title: "Lei 8.213/91 — Art. 25 (Carência dos benefícios)",
      kind: "LEGISLACAO",
      tags: ["NAO_CUMPRIMENTO_CARENCIA", "AUXILIO_DOENCA", "APOSENTADORIA_IDADE"],
      content: `Art. 25. A concessão das prestações pecuniárias do Regime Geral de Previdência Social depende dos seguintes períodos de carência:
I - auxílio por incapacidade temporária e aposentadoria por incapacidade permanente: 12 contribuições mensais;
II - aposentadoria por idade, aposentadoria por tempo de contribuição e aposentadoria especial: 180 contribuições mensais;
III - salário-maternidade para as seguradas de que tratam os incisos V e VII do art. 11 e o art. 13: 10 contribuições mensais.`,
    },
    {
      title: "Lei 8.742/93 (LOAS) — Art. 20 (BPC)",
      kind: "LEGISLACAO",
      tags: ["BPC_LOAS", "RENDA_FAMILIAR_SUPERIOR"],
      content: `Art. 20. O benefício de prestação continuada é a garantia de 1 (um) salário-mínimo mensal à pessoa com deficiência e ao idoso com 65 (sessenta e cinco) anos ou mais que comprovem não possuir meios de prover a própria manutenção nem de tê-la provida por sua família.
§3º Considera-se incapaz de prover a manutenção da pessoa com deficiência ou do idoso a família cuja renda mensal per capita seja inferior a 1/4 (um quarto) do salário-mínimo.`,
    },
    {
      title: "Súmula TNU 77 — Auxílio-doença e incapacidade",
      kind: "JURISPRUDENCIA",
      tags: ["AUSENCIA_INCAPACIDADE", "AUXILIO_DOENCA"],
      content: `"O julgador não é obrigado a analisar as condições pessoais e sociais quando não reconhecer a incapacidade do requerente para a sua atividade habitual." Porém, a jurisprudência da TNU e do STJ tem admitido a análise das condições sociais e pessoais do segurado (idade, grau de instrução, atividade habitual) para fins de conversão em invalidez permanente quando constatada incapacidade parcial permanente.`,
    },
    {
      title: "Modelo de recurso — Auxílio-doença negado por ausência de incapacidade",
      kind: "MODELO_RECURSO",
      tags: ["AUXILIO_DOENCA", "AUSENCIA_INCAPACIDADE"],
      content: `Estrutura recomendada:
I - ENDEREÇAMENTO: "EXMO. SR. PRESIDENTE DA JUNTA DE RECURSOS DO CRPS..."
II - QUALIFICAÇÃO
III - TEMPESTIVIDADE (art. 126, Lei 8.213/91)
IV - SÍNTESE FÁTICA (histórico clínico, afastamento, laudos)
V - DO DIREITO:
  - Conceito de incapacidade (art. 59 da Lei 8.213/91)
  - Impossibilidade de prevalência isolada da perícia do INSS sobre laudos privados
  - Aplicação de súmulas da TNU sobre análise de condições pessoais
VI - DOS PEDIDOS: provimento do recurso, concessão do benefício desde a DER, pagamento retroativo.`,
    },
  ];

  for (const item of kbItems) {
    const existing = await db.knowledgeEntry.findFirst({
      where: { title: item.title },
    });
    if (!existing) {
      const { tags, ...rest } = item;
      await db.knowledgeEntry.create({
        data: { ...rest, tagsJson: JSON.stringify(tags) },
      });
    }
  }
  console.log(`✓ base de conhecimento populada: ${kbItems.length} entradas`);

  // === Blog posts ===
  const posts = [
    {
      slug: "o-que-fazer-quando-o-inss-nega-meu-beneficio",
      title: "O INSS negou meu benefício. E agora?",
      excerpt:
        "Entenda o passo a passo após um indeferimento do INSS: prazo para recurso, documentos essenciais e o que pode virar a chave do seu caso.",
      content: `Receber uma carta do INSS informando que seu benefício foi negado é angustiante — mas não é o fim do processo. A lei garante a você o direito de recorrer.

**1. Verifique o prazo**
Você tem 30 dias corridos, contados da ciência da decisão, para interpor recurso (art. 126 da Lei 8.213/91).

**2. Leia atentamente o motivo da negativa**
O INSS é obrigado a fundamentar sua decisão. Os motivos mais comuns são: ausência de incapacidade, falta de qualidade de segurado, tempo de contribuição insuficiente e renda familiar superior ao limite.

**3. Organize seus documentos**
Para cada motivo há um conjunto diferente de provas úteis — laudos médicos, CNIS atualizado, comprovantes de vínculo, etc.

**4. Monte um recurso tecnicamente sólido**
É aqui que a maior parte dos recursos falha. Uma peça sem fundamentação legal tende a ser indeferida, mesmo quando o caso tem mérito.`,
    },
    {
      slug: "qualidade-de-segurado-como-manter-e-recuperar",
      title: "Qualidade de segurado: como manter e como recuperar",
      excerpt:
        "O 'período de graça' é um dos conceitos mais mal compreendidos do INSS — e uma das principais causas de negativa.",
      content: `A qualidade de segurado é a condição de filiação ao Regime Geral de Previdência Social. Sem ela, o INSS nega quase todos os benefícios.

**Período de graça**
Mesmo sem contribuir, você pode manter a qualidade por até 12 meses (art. 15, II), com prorrogações possíveis:
- +12 meses: se tiver mais de 120 contribuições sem interrupção
- +12 meses: se estiver desempregado (comprovado)

Somando tudo, o período de graça pode chegar a 36 meses.`,
    },
    {
      slug: "bpc-loas-erros-comuns",
      title: "BPC/LOAS: os erros mais comuns no pedido",
      excerpt:
        "Cerca de metade dos pedidos de BPC são indeferidos — boa parte por falhas evitáveis na hora de apresentar o caso.",
      content: `O BPC/LOAS é um benefício assistencial, não previdenciário. Isso significa que não exige contribuições, mas tem requisitos rigorosos:
- Idade igual ou superior a 65 anos, OU pessoa com deficiência de longo prazo
- Renda familiar per capita inferior a 1/4 do salário-mínimo (em regra)

A jurisprudência vem flexibilizando o critério de renda — há decisões reiteradas concedendo BPC mesmo com renda per capita de até 1/2 salário-mínimo, quando há outras vulnerabilidades comprovadas.`,
    },
    {
      slug: "auxilio-doenca-negado-por-pericia",
      title: "Auxílio-doença negado pela perícia: por que e o que fazer",
      excerpt:
        "A perícia do INSS é uma avaliação médica breve que, sozinha, nem sempre reflete a real incapacidade do segurado. Entenda como contestar.",
      content: `É comum o segurado sair da perícia com laudo privado dizendo que está incapaz — mas receber do INSS uma decisão dizendo o contrário.

**Por que isso acontece?**
A perícia do INSS costuma durar entre 10 e 20 minutos. Nesse intervalo, o perito avalia apenas a capacidade laborativa naquele momento, com base em exame físico pontual e documentos apresentados. É natural que casos complexos (hérnia de disco, fibromialgia, transtornos psiquiátricos, câncer em tratamento) não fiquem adequadamente retratados.

**O que pode fortalecer seu recurso?**
1. Laudos médicos particulares recentes (últimos 6 meses)
2. Exames de imagem (RM, TC, Raio-X, ultrassom)
3. Relatório detalhado do médico assistente com CID, prognóstico e restrições
4. Receituários e histórico de medicações contínuas
5. Carteira de trabalho e descrição da atividade habitual
6. Atestados de internações e cirurgias

**Jurisprudência a seu favor**
A TNU e o STJ entendem que o laudo pericial do INSS **não tem valor absoluto**. Deve ser analisado em conjunto com laudos privados e, especialmente em casos de incapacidade parcial, devem ser consideradas condições pessoais (idade, escolaridade, tipo de trabalho).

Um recurso bem fundamentado, com documentação robusta, tem chance real de reverter.`,
    },
    {
      slug: "aposentadoria-por-idade-documentos-essenciais",
      title: "Aposentadoria por idade: a documentação que o INSS quase sempre pede",
      excerpt:
        "Grande parte das negativas de aposentadoria por idade acontece por problemas de documentação. Veja o que separar antes do pedido.",
      content: `A aposentadoria por idade exige dois requisitos: idade mínima (62 anos para mulher, 65 para homem, regra urbana) e carência de 180 contribuições.

Parece simples. Mas é nos detalhes da documentação que o pedido costuma travar.

**Documentos básicos**
- RG e CPF
- Comprovante de residência atualizado
- CNIS (Cadastro Nacional de Informações Sociais) completo
- Carteiras de trabalho (todas, inclusive as antigas)

**Períodos sem registro no CNIS**
Se você trabalhou e o período não aparece no CNIS, será necessário comprovar com:
- Contrato de trabalho
- Holerites do período
- Ficha de registro de empregado
- Declaração do empregador com data e reconhecimento de firma

**Trabalho rural (segurado especial)**
Para comprovar atividade rural, é comum o INSS exigir início de prova material + confirmação por testemunhas. Documentos úteis:
- Certidão de casamento constando "lavrador" ou "agricultor"
- Certidão de nascimento dos filhos
- Contrato de parceria ou arrendamento rural
- Notas fiscais de produtor
- Declaração do sindicato rural

**E se o INSS já negou?**
Normalmente a causa é documentação insuficiente ou tempo de contribuição reconhecido abaixo do necessário. O recurso deve atacar ponto a ponto os períodos não reconhecidos, com provas materiais sólidas.`,
    },
    {
      slug: "direito-retroativo-inss",
      title: "Retroativo do INSS: você tem direito desde quando?",
      excerpt:
        "Quando o recurso é deferido, o INSS precisa pagar o que deixou de pagar — mas a partir de qual data? Entenda seus direitos.",
      content: `Quando um recurso administrativo é provido (ou uma ação judicial vencida), o benefício não começa "a partir de hoje". Ele retroage.

**DER — Data de Entrada do Requerimento**
Como regra geral, o benefício é devido desde a DER — a data em que você fez o pedido inicial no INSS. Isso significa que, se você pediu em janeiro de 2024 e teve negativa revertida em fevereiro de 2025, tem direito aos valores desde janeiro de 2024.

**Exceção: auxílio-doença**
Para auxílio por incapacidade temporária, a data de início do benefício (DIB) pode ser:
- O dia seguinte ao afastamento, se o pedido foi feito em até 30 dias
- A DER, se o pedido foi feito depois dos 30 dias

**Como calcular**
Valor mensal do benefício × número de meses em atraso + correção monetária (IPCA-E) + juros moratórios.

Exemplo: benefício de R$ 1.500 × 13 meses de atraso = R$ 19.500 de principal. Com correção e juros, facilmente passa de R$ 22.000.

**Por que isso importa?**
Porque muita gente desiste de recorrer achando que "já passou o tempo". O contrário é verdadeiro: quanto mais demora, maior o retroativo a receber.`,
    },
    {
      slug: "pensao-por-morte-regras-atuais",
      title: "Pensão por morte: quem tem direito nas regras atuais",
      excerpt:
        "Depois da reforma da previdência, as regras da pensão por morte mudaram. Saiba quem ainda tem direito e como comprovar.",
      content: `A pensão por morte é devida aos dependentes do segurado que falece — mas as regras de duração e valor mudaram bastante com a Reforma da Previdência.

**Quem são os dependentes (art. 16 da Lei 8.213/91)**

Classe 1 (preferencial, presumida):
- Cônjuge
- Companheiro(a) em união estável
- Filho menor de 21 anos (ou inválido, ou com deficiência)

Classe 2: Pais (precisam comprovar dependência econômica)

Classe 3: Irmão menor de 21 anos ou com deficiência (também precisa comprovar dependência)

**Valor da pensão (regra pós-reforma)**
Desde a EC 103/2019:
- Cota familiar: 50% do valor que o segurado receberia
- Cota individual: +10% por dependente
- Exemplo: viúva sem filhos = 60% do benefício

**Duração para cônjuge**
Depende da idade do cônjuge na data do óbito:
- Até 21 anos → 3 anos
- 22 a 27 anos → 6 anos
- 28 a 30 anos → 10 anos
- 31 a 41 anos → 15 anos
- 42 a 44 anos → 20 anos
- 45 anos ou mais → vitalícia

**Principais causas de negativa**
1. Falta de qualidade de segurado do falecido na data do óbito
2. Dificuldade em comprovar união estável
3. Dependência econômica dos pais não reconhecida

Todos esses pontos podem ser atacados em recurso administrativo com a documentação adequada.`,
    },
    {
      slug: "como-comprovar-tempo-de-contribuicao",
      title: "Como comprovar tempo de contribuição que não aparece no CNIS",
      excerpt:
        "Períodos trabalhados que não aparecem no sistema do INSS são causa frequente de negativa. Veja como reconhecê-los.",
      content: `O CNIS (Cadastro Nacional de Informações Sociais) é a base do INSS. Nele aparecem todos os vínculos registrados formalmente. O problema é que nem todo tempo de trabalho é lançado corretamente.

**Situações comuns de vínculos não reconhecidos**
1. Empregador que não recolheu contribuições (responsabilidade dele, não do trabalhador)
2. Vínculos antigos (antes de 1994, quando o CNIS começou)
3. Trabalho rural sem registro
4. Contribuinte individual que contribuiu via carnê e não bateu o código
5. Períodos como doméstico antes da Lei Complementar 150/2015

**Como comprovar**
Cada período pode ser reconhecido com documentos específicos:

**Vínculo empregatício**: CTPS assinada, contrato, holerites, ficha de registro, declaração com reconhecimento de firma.

**Trabalho rural**: certidões, declaração do sindicato, notas de produtor, contratos agrários, fotos de época (complementares), CCIR.

**Contribuinte individual**: GPS pagas, extrato bancário com DARF, declaração de IR.

**Tempo militar**: certidão do tempo de serviço militar.

**Tempo fictício (regras antigas)**: em algumas hipóteses, o tempo pode ser majorado (por exemplo, tempo especial convertido em comum antes de 2019).

**O recurso administrativo**
Se o INSS não reconheceu esse tempo no pedido original, o recurso deve:
- Identificar cada período não computado
- Anexar documentação comprobatória
- Fundamentar com base em legislação e jurisprudência da TNU
- Requerer expressamente o cômputo e o recálculo do benefício`,
    },
    {
      slug: "inss-digital-meu-inss-como-usar",
      title: "Meu INSS: como usar o aplicativo pra acompanhar seu processo",
      excerpt:
        "Boa parte dos processos hoje roda dentro do Meu INSS. Saiba navegar o app e acompanhar cada etapa do seu pedido ou recurso.",
      content: `O aplicativo **Meu INSS** (também disponível no site meu.inss.gov.br) concentra hoje a maior parte dos serviços do INSS — desde pedidos de benefício até acompanhamento de recursos.

**Primeiros passos**
1. Baixe o app (Android/iOS) ou acesse o site
2. Faça login com sua conta gov.br (nível prata ou ouro é ideal)
3. Verifique seus dados cadastrais e o CNIS

**O que você pode fazer no Meu INSS**
- Simular aposentadoria
- Pedir benefício (auxílio-doença, aposentadoria, BPC, pensão, salário-maternidade)
- Agendar perícia médica
- Acompanhar status do pedido
- Receber notificações de exigência
- Protocolar recurso administrativo
- Consultar extrato do CNIS
- Verificar histórico de créditos recebidos

**Atenção às "exigências"**
Durante o processo, o INSS pode pedir documentos complementares. Isso aparece como "Em exigência" no app. O prazo pra responder costuma ser de 30 dias — passou disso, o pedido é arquivado.

**Como protocolar um recurso pelo app**
1. Acesse o pedido negado em "Meus pedidos"
2. Clique em "Recorrer" (se disponível)
3. Anexe o recurso em PDF e os documentos complementares
4. Confirme e anote o número de protocolo

**Dica importante**
Guarde **tudo** em PDF: a carta de negativa, o recurso enviado, o protocolo. Esses documentos são essenciais se o caso for para a justiça depois.`,
    },
    {
      slug: "quando-procurar-advogado",
      title: "Quando vale a pena procurar um advogado previdenciarista",
      excerpt:
        "Nem todo caso se resolve apenas com recurso administrativo. Saiba quando buscar ajuda profissional faz sentido.",
      content: `Nossa plataforma foi criada para democratizar o acesso ao recurso administrativo — a primeira e, muitas vezes, única porta de entrada pra quem não tem dinheiro pra advogado particular. Mas é importante ser transparente: nem todo caso é igual.

**Casos em que o recurso administrativo bem feito já basta**
- Negativa por documentação complementar faltante
- Perícia contestável com laudos médicos sólidos
- Períodos não reconhecidos com provas materiais claras
- Erros de cálculo de carência ou tempo de contribuição

**Casos em que advogado é recomendável**
1. Negativa mantida em segunda instância (Junta e CRPS)
2. Necessidade de produção de prova complexa (pericial judicial)
3. Casos de revisão de benefício antigo (com cálculos complexos)
4. Ações de restabelecimento com pedido de tutela de urgência
5. Casos envolvendo fraude ou acusação de simulação

**O papel da nossa plataforma**
Entendemos que muita gente nunca vai ter condição de pagar um advogado particular — e justamente por isso existimos. Uma peça recursal tecnicamente bem construída, na fase administrativa, aumenta significativamente a chance de reversão sem custos adicionais.

Quando o caso extrapola a esfera administrativa, orientamos a buscar profissional de confiança. Muitas OABs estaduais oferecem assistência jurídica gratuita para quem se enquadra em critérios de renda, e a Defensoria Pública Federal atua em causas previdenciárias em várias cidades do país.

**Nosso compromisso**
Ser claros sobre o que podemos e o que não podemos fazer. A tecnologia é poderosa — mas sempre a serviço das pessoas, não no lugar delas.`,
    },
  ];

  for (const p of posts) {
    const existing = await db.blogPost.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await db.blogPost.create({
        data: {
          ...p,
          published: true,
          publishedAt: new Date(),
        },
      });
    }
  }
  console.log(`✓ blog populado: ${posts.length} posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
