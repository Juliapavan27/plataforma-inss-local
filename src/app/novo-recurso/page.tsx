import { AppealForm } from "@/components/form/appeal-form";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { formatCurrencyBRL } from "@/lib/utils";

const PRICE = Number(process.env.PRICE_RECURSO_CENTS ?? 29900);

export const metadata = { title: "Gerar recurso — Novo pedido" };

export default function NovoRecursoPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-brand-50/40 to-white">
        <div className="container py-12">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h1 className="font-display text-3xl font-bold text-ink-950 md:text-4xl">
              Vamos construir seu recurso
            </h1>
            <p className="mt-3 text-ink-600">
              Responda em 3 etapas simples. Valor único:{" "}
              <span className="font-semibold text-brand-700">
                {formatCurrencyBRL(PRICE)}
              </span>{" "}
              — só você paga após confirmar os dados.
            </p>
          </div>
          <AppealForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
