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
      <main className="bg-ink-950 text-white">
        <div className="container py-12 md:py-16">
          {/* Identidade no topo (título + preço), largura cheia. */}
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-300">
              <FileText className="h-3.5 w-3.5" /> Manual em PDF · {formatCurrencyBRL(m.precoCents)}
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-balance text-white md:text-4xl">
              {m.titulo}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/70">{m.subtitulo}</p>
          </div>

          <div className="mt-8 grid gap-10 md:grid-cols-[1fr_400px]">
            {/* Checkout — PRIMEIRO no mobile (compra em 1 tela); à direita no desktop. */}
            <div
              id="comprar"
              className="order-1 scroll-mt-24 md:order-2 md:sticky md:top-24 md:self-start"
            >
              <ManualCheckout slug={m.slug} precoCents={m.precoCents} />
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50">
                <ShieldCheck className="h-3.5 w-3.5 text-success-400" />
                Entrega imediata · Garantia de 7 dias (CDC art. 49)
              </p>
            </div>

            {/* Pitch + conteúdo educativo — depois no mobile; à esquerda no desktop. */}
            <div className="order-2 md:order-1">
              <p className="leading-relaxed text-white/60">{m.resumo}</p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="font-display text-lg font-bold text-white">O que você recebe</h2>
                <ul className="mt-4 space-y-2.5">
                  {m.promessa.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[15px] text-white/80">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-success-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conteúdo educativo — o "blog" que dá contexto e desperta interesse. */}
              {beneficio && (
                <div className="mt-12 border-t border-white/10 pt-10">
                  <h2 className="font-display text-2xl font-bold text-balance text-white">
                    {beneficio.titulo}: por que acontece
                  </h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-white/70">{beneficio.intro}</p>

                  <h3 className="mt-8 font-display text-lg font-bold text-white">
                    Por que o INSS nega {beneficio.nome.toLowerCase()}
                  </h3>
                  <div className="mt-5 space-y-4">
                    {beneficio.causas.map((c, i) => (
                      <div key={c.titulo} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h4 className="flex gap-3 font-display text-base font-bold text-white">
                          <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-brand-600 text-xs font-black text-white">
                            {i + 1}
                          </span>
                          {c.titulo}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{c.explicacao}</p>
                        <p className="mt-3 rounded-xl bg-success-500/10 p-3 text-sm leading-relaxed text-white/80">
                          <strong className="text-success-400">O que costuma ajudar:</strong>{" "}
                          {c.oQueAjuda}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 rounded-2xl bg-gradient-to-br from-brand-700 to-ink-900 p-6 ring-1 ring-white/10">
                    <p className="font-display text-lg font-bold text-white">
                      Quer o passo a passo completo para montar o seu recurso?
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      O manual reúne a base legal, a estrutura da peça, o modelo para preencher e o
                      checklist de documentos — tudo em PDF, por {formatCurrencyBRL(m.precoCents)}.
                    </p>
                    <a
                      href="#comprar"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-ink-950 transition hover:-translate-y-0.5"
                    >
                      Adquirir agora
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
