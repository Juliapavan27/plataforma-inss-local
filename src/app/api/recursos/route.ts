import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appealCreateSchema } from "@/lib/validations";
import { auth, hashPassword } from "@/lib/auth";
import { stripe, isStripeConfigured, PRICE_RECURSO_CENTS } from "@/lib/stripe";
import { PRICE_CARD_CENTS } from "@/lib/pricing";
import { isInfinitePayConfigured, createCheckoutLink } from "@/lib/infinitepay";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createPaymentToken } from "@/lib/payment-token";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`recursos:create:${ip}`, {
    max: 10,
    windowMs: 60 * 60_000,
    blockMs: 30 * 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl);
  try {
    const body = await req.json();
    const data = appealCreateSchema.parse(body);

    // Identifica usuário: usa sessão, senão cria usuário leve (lead) com senha aleatória.
    const session = await auth();
    let userId: string;

    if (session?.user) {
      userId = session.user.id;
      await db.user.update({
        where: { id: userId },
        data: {
          cpf: data.cpf,
          phone: data.phone,
          name: data.fullName ?? session.user.name,
        } as any,
      });
    } else {
      // Procura por e-mail E por CPF: os dois são únicos no banco. Quem já pediu
      // antes e volta usando outro e-mail (ou corrigindo um e-mail digitado
      // errado) cairia em erro de constraint no create, sem conseguir comprar.
      const email = data.email.toLowerCase();
      const existing =
        (await db.user.findUnique({ where: { email } })) ??
        (await db.user.findUnique({ where: { cpf: data.cpf } }));

      if (existing) {
        userId = existing.id;
        await db.user.update({
          where: { id: existing.id },
          // Não sobrescreve o e-mail de uma conta existente: ele é o login, e
          // trocá-lo por aqui deixaria a pessoa sem acesso ao histórico dela.
          data: {
            cpf: data.cpf, phone: data.phone, name: data.fullName,
            cep: data.cep, street: data.street, number: data.number,
            complement: data.complement ?? null, neighborhood: data.neighborhood,
            city: data.city, state: data.state,
          },
        });
      } else {
        // Cria usuário "lead" — senha temporária (o usuário define depois via reset).
        const tempPwd = crypto.randomUUID();
        const user = await db.user.create({
          data: {
            email,
            name: data.fullName,
            cpf: data.cpf,
            phone: data.phone,
            cep: data.cep,
            street: data.street,
            number: data.number,
            complement: data.complement ?? null,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            passwordHash: await hashPassword(tempPwd),
          },
        });
        userId = user.id;
      }
    }

    const extraFacts: Record<string, unknown> = {};
    if (data.hasMedicalReport !== undefined)
      extraFacts.possui_laudo_medico = data.hasMedicalReport;
    if (data.medicalCondition) extraFacts.condicao_medica = data.medicalCondition;
    if (data.medicalLimitations) extraFacts.limitacoes_funcionais = data.medicalLimitations;
    if (data.workHistory) extraFacts.historico_contribuicoes = data.workHistory;
    if (data.insuredCategory) extraFacts.categoria_segurado = data.insuredCategory;
    if (data.gracePeriodContext) extraFacts.periodo_graca_contexto = data.gracePeriodContext;
    if (data.familyIncome) extraFacts.renda_familiar = data.familyIncome;
    if (data.householdExpenses) extraFacts.despesas_essenciais = data.householdExpenses;
    if (data.relationship) extraFacts.relacao_falecido = data.relationship;
    if (data.dependencyProof) extraFacts.provas_dependencia = data.dependencyProof;
    if (data.missingDocuments) extraFacts.documentos_que_inss_apontou_como_ausentes = data.missingDocuments;
    if (data.inssIgnoredDetails) extraFacts.pontos_ignorados_pelo_inss = data.inssIgnoredDetails;

    const appeal = await db.appeal.create({
      data: {
        userId,
        benefitType: data.benefitType,
        denialReason: data.denialReason,
        denialDate: data.denialDate ? new Date(data.denialDate) : null,
        beneficioNumero: data.beneficioNumero ?? null,
        inssProtocolo: data.inssProtocolo ?? null,
        caseSummary: data.caseSummary,
        extraFactsJson: Object.keys(extraFacts).length
          ? JSON.stringify(extraFacts)
          : null,
        withdrawalWaived: data.withdrawalWaived,
        status: "AWAITING_PAYMENT",
      },
    });

    // Ordem de preferência: Mercado Pago > InfinitePay > Stripe > modo dev
    // (marca como pago direto). O Mercado Pago vem primeiro porque é o único
    // que paga dentro do nosso site; enquanto as chaves dele não estiverem
    // configuradas, a InfinitePay segue atendendo normalmente.
    let checkoutUrl: string | null = null;
    if (isMercadoPagoConfigured()) {
      await db.payment.create({
        data: {
          userId,
          appealId: appeal.id,
          // Placeholder: o valor definitivo depende do meio de pagamento
          // escolhido e é gravado quando a cobrança é criada.
          amountCents: PRICE_CARD_CENTS,
          provider: "mercadopago",
          status: "PENDING",
        },
      });
      checkoutUrl = `/pagamento/${appeal.id}?t=${encodeURIComponent(createPaymentToken(appeal.id))}`;
    } else if (isInfinitePayConfigured()) {
      const { url } = await createCheckoutLink({
        orderNsu: appeal.id,
        amountCents: PRICE_RECURSO_CENTS,
        description: "Recurso Administrativo INSS",
        redirectUrl: `${process.env.APP_URL}/dashboard/recursos/${appeal.id}?paid=1`,
        webhookUrl: `${process.env.APP_URL}/api/webhooks/infinitepay`,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
        // Enviar o endereço faz o checkout da InfinitePay pular a etapa de
        // entrega e ir direto ao pagamento — é atrito que não faz sentido para
        // um produto digital.
        address: {
          cep: data.cep,
          street: data.street,
          neighborhood: data.neighborhood,
          number: data.number,
          complement: data.complement ?? "",
        },
      });
      await db.payment.create({
        data: {
          userId,
          appealId: appeal.id,
          amountCents: PRICE_RECURSO_CENTS,
          provider: "infinitepay",
          status: "PENDING",
        },
      });
      checkoutUrl = url;
    } else if (isStripeConfigured()) {
      const sessionStripe = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: "Recurso Administrativo INSS",
                description: "Geração automatizada de recurso com fundamentação jurídica",
              },
              unit_amount: PRICE_RECURSO_CENTS,
            },
            quantity: 1,
          },
        ],
        metadata: { appealId: appeal.id },
        success_url: `${process.env.APP_URL}/dashboard/recursos/${appeal.id}?paid=1`,
        cancel_url: `${process.env.APP_URL}/novo-recurso?canceled=1`,
        customer_email: data.email,
      });
      await db.payment.create({
        data: {
          userId,
          appealId: appeal.id,
          amountCents: PRICE_RECURSO_CENTS,
          provider: "stripe",
          stripeSessionId: sessionStripe.id,
          status: "PENDING",
        },
      });
      checkoutUrl = sessionStripe.url;
    } else {
      // Modo dev: marca como pago imediatamente (geração continua manual).
      await db.payment.create({
        data: {
          userId,
          appealId: appeal.id,
          amountCents: PRICE_RECURSO_CENTS,
          status: "PAID",
          paidAt: new Date(),
        },
      });
      const { markPaidAndNotifyAdmin } = await import("@/lib/appeal-service");
      await markPaidAndNotifyAdmin(appeal.id);
    }

    return NextResponse.json({ appealId: appeal.id, checkoutUrl });
  } catch (err) {
    const { logger } = await import("@/lib/logger");
    logger.error("recursos.POST falhou", err);
    return NextResponse.json(
      { error: "Não foi possível criar o recurso. Tente novamente." },
      { status: 400 },
    );
  }
}
