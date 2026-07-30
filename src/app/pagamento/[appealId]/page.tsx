import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { PaymentCheckout } from "@/components/checkout/payment-checkout";
import { loadPaymentForCheckout, amountToCharge } from "@/lib/payment-access";
import { createPaymentToken } from "@/lib/payment-token";
import { PRICE_PIX_CENTS, PRICE_CARD_CENTS } from "@/lib/pricing";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { SUPPORT_EMAIL } from "@/lib/support";
import { Clock, FileText, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pagamento",
  robots: { index: false, follow: false },
};

export default async function PagamentoPage({
  params,
  searchParams,
}: {
  params: { appealId: string };
  searchParams: { t?: string };
}) {
  const payment = await loadPaymentForCheckout(params.appealId, searchParams.t ?? null);

  if (!payment) {
    return (
      <Shell>
        <Aviso
          titulo="Não encontramos este pedido"
          texto={`O link pode ter expirado. Entre com sua conta para retomar o pagamento, ou fale com a gente em ${SUPPORT_EMAIL}.`}
        />
      </Shell>
    );
  }

  if (payment.status === "PAID") {
    redirect(`/dashboard/recursos/${params.appealId}?paid=1`);
  }

  if (!isMercadoPagoConfigured()) {
    return (
      <Shell>
        <Aviso
          titulo="Pagamento temporariamente indisponível"
          texto={`Já registramos seu pedido. Escreva para ${SUPPORT_EMAIL} que a gente conclui o pagamento com você.`}
        />
      </Shell>
    );
  }

  // Renova o token a cada carregamento: quem chegou por sessão passa a ter um,
  // e quem chegou com um token perto de expirar continua com margem.
  const token = createPaymentToken(params.appealId);
  const prices = { pix: PRICE_PIX_CENTS, card: PRICE_CARD_CENTS };

  return (
    <Shell>
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h1 className="font-display text-3xl font-bold text-ink-950">
          Falta só o pagamento
        </h1>
        <p className="mt-3 text-ink-600">
          Assim que confirmar, seu recurso entra na fila de produção.
        </p>
      </div>

      <div className="mx-auto mb-10 grid max-w-xl gap-3 sm:grid-cols-3">
        <Selo icon={Clock} texto={payment.appeal.withdrawalWaived ? "Entrega em até 24h" : "Entrega em até 8 dias"} />
        <Selo icon={FileText} texto="PDF + Word" />
        <Selo icon={ShieldCheck} texto="Garantia de 7 dias" />
      </div>

      <PaymentCheckout
        appealId={params.appealId}
        token={token}
        publicKey={process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!}
        pricePixCents={amountToCharge(payment, "pix", prices)}
        priceCardCents={amountToCharge(payment, "credit_card", prices)}
        successUrl={`/dashboard/recursos/${params.appealId}?paid=1`}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-brand-50/40 to-white">
        <div className="container py-12 md:py-16">{children}</div>
      </main>
      <Footer />
    </>
  );
}

function Selo({
  icon: Icon,
  texto,
}: {
  icon: React.ComponentType<{ className?: string }>;
  texto: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-medium text-ink-700 ring-1 ring-ink-200/70">
      <Icon className="h-4 w-4 text-brand-600" />
      {texto}
    </div>
  );
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-ink-200 bg-white p-8 text-center">
      <h1 className="font-display text-xl font-semibold text-ink-950">{titulo}</h1>
      <p className="mt-3 text-sm text-ink-600">{texto}</p>
    </div>
  );
}
