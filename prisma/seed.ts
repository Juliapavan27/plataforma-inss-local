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

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
