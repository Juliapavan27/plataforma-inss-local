import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { loadPaymentForCheckout } from "@/lib/payment-access";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { SUPPORT_EMAIL, SUPPORT_SLA_HOURS } from "@/lib/support";
import { Check, Clock, Mail, FileText, KeyRound } from "lucide-react";
import { TrackOnMount } from "@/components/analytics/track-on-mount";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

/**
 * Onde o cliente cai depois de pagar.
 *
 * Não exige login de propósito: quem compra sem criar conta recebe uma senha
 * aleatória que nunca vê, então mandar essa pessoa para o /dashboard logo
 * depois de pagar era jogá-la numa tela de login intransponível. O acesso aqui
 * é pelo mesmo token assinado do checkout, que também vai no e-mail.
 */
export default async function ConfirmadoPage({
  params,
  searchParams,
}: {
  params: { appealId: string };
  searchParams: { t?: string };
}) {
  const payment = await loadPaymentForCheckout(params.appealId, searchParams.t ?? null);

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-brand-50/40 to-white">
        <div className="container py-16">
          {!payment ? (
            <div className="mx-auto max-w-md rounded-2xl border border-ink-200 bg-white p-8 text-center">
              <h1 className="font-display text-xl font-semibold text-ink-950">
                Não encontramos este pedido
              </h1>
              <p className="mt-3 text-sm text-ink-600">
                O link pode ter expirado. Escreva para {SUPPORT_EMAIL} que a gente localiza
                seu pedido.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-lg">
              {/* A conversão que importa. transaction_id = id do pedido, que é
                  como o GA4 descarta reabertura desta página. */}
              <TrackOnMount
                event="Purchase"
                value={payment.amountCents / 100}
                transactionId={params.appealId}
                contentName="Recurso administrativo INSS"
                chaveUnica={`purchase-${params.appealId}`}
              />

              <div className="rounded-2xl border border-success-200 bg-white p-8 text-center shadow-soft">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-600 text-white">
                  <Check className="h-7 w-7" />
                </span>
                <h1 className="mt-5 font-display text-2xl font-bold text-ink-950">
                  Pagamento confirmado
                </h1>
                <p className="mt-2 text-ink-600">
                  Recebemos {formatCurrencyBRL(payment.amountCents)}. Seu recurso já está em
                  produção.
                </p>

                <div className="mt-8 space-y-3 text-left">
                  <Linha
                    icon={Clock}
                    titulo={
                      payment.appeal.dueAt
                        ? `Entrega até ${formatDateBR(payment.appeal.dueAt)}`
                        : "Entrega em andamento"
                    }
                    texto={
                      payment.appeal.withdrawalWaived
                        ? "Você abriu mão do prazo de arrependimento para receber em até 24h."
                        : "Você manteve seu prazo de arrependimento de 7 dias (art. 49 do CDC)."
                    }
                  />
                  <Linha
                    icon={Mail}
                    titulo="Enviamos um e-mail de confirmação"
                    texto="O recurso chega no mesmo e-mail, em PDF e Word, dentro do prazo acima."
                  />
                  <Linha
                    icon={FileText}
                    titulo="Revise antes de protocolar"
                    texto="Lembre-se do prazo do INSS: 30 dias corridos da ciência da decisão."
                  />
                </div>

                {payment.user.passwordSetAt === null && (
                  <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5 text-left">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                      <KeyRound className="h-4 w-4 text-brand-600" />
                      Crie sua senha
                    </p>
                    <p className="mt-1.5 text-sm text-ink-700">
                      Sua conta já existe — criamos junto com o pedido. Defina uma senha
                      para acessar seus recursos quando quiser. O link também foi para o
                      seu e-mail.
                    </p>
                    <Link
                      href="/esqueci-senha"
                      className="btn-primary mt-4 w-full justify-center"
                    >
                      Criar minha senha
                    </Link>
                  </div>
                )}
              </div>

              <p className="mt-6 text-center text-sm text-ink-600">
                Guarde este link para acompanhar seu pedido. Dúvidas? Escreva para{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-700 underline">
                  {SUPPORT_EMAIL}
                </a>{" "}
                — respondemos em até {SUPPORT_SLA_HOURS}h.
              </p>

              <p className="mt-4 text-center">
                <Link href="/" className="text-sm font-medium text-ink-600 hover:text-ink-900">
                  Voltar para o início
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Linha({
  icon: Icon,
  titulo,
  texto,
}: {
  icon: React.ComponentType<{ className?: string }>;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-ink-50 p-4">
      <Icon className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
      <div>
        <p className="text-sm font-semibold text-ink-900">{titulo}</p>
        <p className="mt-0.5 text-sm text-ink-600">{texto}</p>
      </div>
    </div>
  );
}
