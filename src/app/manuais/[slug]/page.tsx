import { notFound } from "next/navigation";
import { Check, FileText, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ManualCheckout } from "@/components/manuais/manual-checkout";
import { getManual, manuais } from "@/content/manuais";
import { getBeneficio } from "@/content/beneficios";
import { formatCurrencyBRL } from "@/lib/utils";

export function generateStaticParams() {
  return manuais.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const m = getManual(params.slug);
  if (!m) return {};
  return {
    title: `${m.titulo} — Manual em PDF por ${formatCurrencyBRL(m.precoCents)}`,
    description: m.resumo,
    alternates: { canonical: `/manuais/${m.slug}` },
  };
}

export default function ManualSalesPage({ params }: { params: { slug: string } }) {
  const m = getManual(params.slug);
  if (!m) notFound();

  // Conteúdo educativo (grátis) reaproveitado do benefício: aquece o leitor
  // antes de pedir a compra, em vez de bater direto na oferta.
  const beneficio = getBeneficio(m.beneficioSlug);

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-brand-50/40 to-white">
        <div className="container grid gap-10 py-12 md:grid-cols-[1fr_400px] md:py-16">
          {/* Pitch — vende sem entregar o conteúdo pago. */}
          <div>
            <span className="chip-brand bg-brand-50 text-brand-700 ring-brand-200">
              <FileText className="h-3.5 w-3.5" /> Manual em PDF · {formatCurrencyBRL(m.precoCents)}
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-balance text-ink-950 md:text-4xl">
              {m.titulo}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-700">{m.subtitulo}</p>
            <p className="mt-4 leading-relaxed text-ink-600">{m.resumo}</p>

            <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-ink-950">O que você recebe</h2>
              <ul className="mt-4 space-y-2.5">
                {m.promessa.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[15px] text-ink-700">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-success-600" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-ink-500">
              <ShieldCheck className="h-4 w-4 text-success-600" />
              Produto digital, entrega imediata. Direito de arrependimento em 7 dias (CDC art. 49).
            </p>

            {/* Conteúdo educativo — o "blog" que dá contexto e desperta interesse. */}
            {beneficio && (
              <div className="mt-12 border-t border-ink-200/70 pt-10">
                <h2 className="font-display text-2xl font-bold text-balance text-ink-950">
                  {beneficio.titulo}: por que acontece
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-700">{beneficio.intro}</p>

                <h3 className="mt-8 font-display text-lg font-semibold text-ink-950">
                  Por que o INSS nega {beneficio.nome.toLowerCase()}
                </h3>
                <div className="mt-5 space-y-4">
                  {beneficio.causas.map((c, i) => (
                    <div key={c.titulo} className="rounded-2xl border border-ink-200/70 bg-white p-6">
                      <h4 className="flex gap-3 font-display text-base font-semibold text-ink-950">
                        <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-ink-950 text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        {c.titulo}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-ink-700">{c.explicacao}</p>
                      <p className="mt-3 rounded-xl bg-success-50 p-3 text-sm leading-relaxed text-ink-800">
                        <strong className="text-success-700">O que costuma ajudar:</strong>{" "}
                        {c.oQueAjuda}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 rounded-2xl border border-brand-200 bg-brand-50/70 p-6">
                  <p className="font-display text-lg font-semibold text-ink-950">
                    Quer o passo a passo completo para montar o seu recurso?
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">
                    O manual reúne a base legal, a estrutura da peça, o modelo para preencher e o
                    checklist de documentos — tudo em PDF, por {formatCurrencyBRL(m.precoCents)}.
                  </p>
                  <a href="#comprar" className="btn-primary mt-4 px-6 py-3">
                    Ver o manual
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Checkout — sticky no desktop. */}
          <div id="comprar" className="scroll-mt-24 md:sticky md:top-24 md:self-start">
            <ManualCheckout slug={m.slug} precoCents={m.precoCents} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
