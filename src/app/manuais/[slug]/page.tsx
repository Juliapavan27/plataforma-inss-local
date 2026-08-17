import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, FileText, ShieldCheck, Clock, Zap, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ManualCheckout } from "@/components/manuais/manual-checkout";
import { getManual, manuais } from "@/content/manuais";
import { getBeneficio } from "@/content/beneficios";
import { formatCurrencyBRL } from "@/lib/utils";
import {
  PRICE_PIX_CENTS,
  INSTALLMENT_CENTS,
  MAX_INSTALLMENTS,
} from "@/lib/pricing";
import { whatsappHref } from "@/lib/whatsapp";

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

  const beneficio = getBeneficio(m.beneficioSlug);

  return (
    <>
      <Navbar />
      <main className="bg-ink-950 text-white">
        <div className="container py-10 md:py-16">
          {/* Hero comercial — dor + promessa, largura cheia. */}
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-300">
              <FileText className="h-3.5 w-3.5" /> Manual em PDF · {formatCurrencyBRL(m.precoCents)}
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-balance text-white md:text-[2.6rem]">
              {m.titulo}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/70">{m.subtitulo}</p>

            {/* Selos de confiança em linha */}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-gold-300" /> Entrega na hora, no e-mail
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-success-400" /> Garantia de 7 dias
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-brand-300" /> PDF para o celular
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-10 md:grid-cols-[1fr_400px]">
            {/* Checkout — PRIMEIRO no mobile (compra em 1 tela); à direita no desktop. */}
            <div
              id="comprar"
              className="order-1 scroll-mt-24 md:order-2 md:sticky md:top-24 md:self-start"
            >
              <ManualCheckout
                slug={m.slug}
                precoCents={m.precoCents}
                publicKey={process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY}
              />
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50">
                <ShieldCheck className="h-3.5 w-3.5 text-success-400" />
                Entrega imediata · Garantia de 7 dias (CDC art. 49)
              </p>
            </div>

            {/* Pitch comercial + conteúdo — depois no mobile; à esquerda no desktop. */}
            <div className="order-2 md:order-1">
              {/* Value stack */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="font-display text-xl font-bold text-white">
                  Tudo o que você precisa para montar o recurso sozinho
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{m.resumo}</p>
                <ul className="mt-5 space-y-3">
                  {m.promessa.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-[15px] text-white/80">
                      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-success-500/15 text-success-400 ring-1 ring-success-400/30">
                        <Check className="h-3 w-3" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href="#comprar"
                  className="btn-primary mt-6 w-full justify-center py-3.5 text-base md:hidden"
                >
                  Quero o manual por {formatCurrencyBRL(m.precoCents)} <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Por que R$9,90 — ancoragem honesta */}
              <div className="mt-6 rounded-2xl border border-gold-400/20 bg-gold-500/[0.06] p-6">
                <h3 className="font-display text-lg font-bold text-white">
                  Por que apenas {formatCurrencyBRL(m.precoCents)}?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Porque a maioria das negativas do INSS pode ser recorrida pela própria
                  pessoa, de graça, no Meu INSS — o que falta não é permissão, é saber
                  <strong className="text-white"> exatamente o que escrever</strong>. Este
                  manual entrega esse caminho, sem custar o preço de um serviço completo.
                </p>
              </div>

              {/* Autoridade: por que o INSS nega (conteúdo educativo, enxuto) */}
              {beneficio && (
                <div className="mt-10 border-t border-white/10 pt-8">
                  <h2 className="font-display text-2xl font-bold text-balance text-white">
                    Por que o INSS nega {beneficio.nome.toLowerCase()}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/70">{beneficio.intro}</p>
                  <div className="mt-6 space-y-4">
                    {beneficio.causas.map((c, i) => (
                      <div key={c.titulo} className="rounded-2xl border border-white/10 bg-white/5 p-5">
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
                </div>
              )}

              {/* Upsell Diamante — pela PARCELA (total sempre visível ao lado) */}
              <div className="mt-10 rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900 p-6 ring-1 ring-white/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-300">
                  Prefere não fazer sozinho?
                </p>
                <p className="mt-2 font-display text-lg font-bold text-white">
                  A gente monta o seu recurso pronto, para você só protocolar
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Você descreve o caso, anexa os documentos e recebe a peça em PDF e Word,
                  fundamentada e pronta para o Meu INSS.
                </p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-display text-3xl font-black text-white">
                    {MAX_INSTALLMENTS}x de {formatCurrencyBRL(INSTALLMENT_CENTS)}
                  </span>
                  <span className="pb-1 text-sm text-white/60">
                    ou {formatCurrencyBRL(PRICE_PIX_CENTS)} à vista
                  </span>
                </div>
                <Link
                  href="/novo-recurso"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-ink-950 transition hover:-translate-y-0.5"
                >
                  Quero o recurso pronto <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* WhatsApp rebaixado: link pequeno, só para dúvida pré-compra */}
              <p className="mt-6 text-center text-sm text-white/50">
                Ficou com uma dúvida antes de comprar?{" "}
                <a
                  href={whatsappHref(
                    `Olá! Tenho uma dúvida sobre o manual "${m.titulo}" antes de comprar.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-success-300 underline decoration-success-400/40 underline-offset-4 hover:text-success-200"
                >
                  Fale rápido no WhatsApp
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
