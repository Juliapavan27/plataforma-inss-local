import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, ShieldCheck, Zap, ArrowRight, Clock, Lock } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ManualCheckout } from "@/components/manuais/manual-checkout";
import { getManual, manuais } from "@/content/manuais";
import { getBeneficio } from "@/content/beneficios";
import { formatCurrencyBRL } from "@/lib/utils";
import { PRICE_PIX_CENTS, MAX_INSTALLMENTS } from "@/lib/pricing";
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

/** Mockup visual da capa do PDF — representa o produto sem depender de foto. */
function ManualCover({ title, priceLabel }: { title: string; priceLabel: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      {/* brilho por trás */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-500/40 via-gold-500/20 to-transparent blur-2xl" />
      {/* páginas empilhadas atrás */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-white/10" />
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl bg-white/20" />
      {/* capa */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-ink-900 to-ink-950 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-gold-300 to-gold-600" />
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
          Manual em PDF
        </p>
        <p className="mt-3 font-display text-xl font-bold leading-tight text-white">{title}</p>
        <div className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1.5 rounded-full bg-white/15" style={{ width: `${90 - i * 18}%` }} />
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
            <ShieldCheck className="h-3.5 w-3.5 text-success-400" /> Passo a passo
          </span>
          <span className="rounded-full bg-gold-500/15 px-2.5 py-1 text-[11px] font-black text-gold-300">
            {priceLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Selo circular de garantia. */
function SeloGarantia() {
  return (
    <div className="relative grid h-24 w-24 flex-none place-items-center rounded-full bg-gradient-to-br from-success-500 to-success-700 text-center shadow-lift ring-4 ring-success-500/20">
      <div>
        <p className="font-display text-2xl font-black leading-none text-white">7</p>
        <p className="text-[9px] font-bold uppercase tracking-wide text-white/90">dias de</p>
        <p className="text-[9px] font-bold uppercase tracking-wide text-white/90">garantia</p>
      </div>
    </div>
  );
}

/** Bloco de autoridade: rosto + nome + credencial reais desarmam o medo de golpe. */
function FounderBand() {
  return (
    <section className="relative border-y border-white/10 bg-white/[0.03]">
      <div className="container py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/julia-matos.jpeg"
            alt="Julia Matos, fundadora da Recurso Fácil"
            className="h-32 w-32 flex-none rounded-2xl object-cover shadow-lift ring-2 ring-white/15"
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-300">
              Quem está por trás
            </p>
            <p className="mt-1 font-display text-xl font-black text-white">Julia Matos</p>
            <p className="text-sm text-white/60">Fundadora · Formada em Direito</p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">
              &ldquo;Criei a Recurso Fácil ao lado de um advogado com mais de 30 anos de
              experiência em Direito e recursos. Nossa missão é simples: que ninguém desista de
              um direito só por não saber o que escrever.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ManualSalesPage({ params }: { params: { slug: string } }) {
  const m = getManual(params.slug);
  if (!m) notFound();

  const beneficio = getBeneficio(m.beneficioSlug);
  const nome = beneficio?.nome ?? "benefício";
  const preco = formatCurrencyBRL(m.precoCents);

  return (
    <>
      <Navbar />
      <main className="bg-ink-950 text-white">
        {/* ===================== HERO ===================== */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-600/30 blur-3xl" />
            <div className="absolute -right-32 top-20 h-[460px] w-[460px] rounded-full bg-gold-500/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-grid opacity-[0.15] mask-fade-b" />
          </div>

          <div className="container py-12 md:py-20">
            <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
              {/* Copy */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-200">
                  <Clock className="h-3.5 w-3.5" /> Você tem 30 dias para recorrer
                </span>

                <h1 className="mt-5 font-display text-[2.1rem] font-black leading-[1.05] text-balance text-white md:text-5xl">
                  Teve o {nome} negado pelo INSS?{" "}
                  <span className="bg-gradient-to-r from-gold-200 via-gold-400 to-gold-600 bg-clip-text text-transparent">
                    Ainda dá para virar o jogo.
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                  Recorrer é um <strong className="text-white">direito seu</strong>, gratuito e sem
                  advogado. O que falta não é permissão — é saber <em>exatamente o que escrever</em>.
                  Este manual entrega o passo a passo, a base legal e o modelo para você montar o
                  seu recurso hoje.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#comprar"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-4 text-base font-black text-white shadow-[0_16px_40px_-12px_rgba(53,87,212,0.7)] transition hover:-translate-y-0.5"
                  >
                    QUERO MEU MANUAL · {preco} <ArrowRight className="h-5 w-5" />
                  </a>
                  <span className="text-sm text-white/50">Entrega na hora, no seu e-mail</span>
                </div>

                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-gold-300" /> Acesso imediato
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-success-400" /> Garantia de 7 dias
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-brand-300" /> Pagamento seguro
                  </span>
                </div>
              </div>

              {/* Mockup do produto */}
              <div className="order-first md:order-none">
                <ManualCover title={m.titulo} priceLabel={preco} />
              </div>
            </div>
          </div>
        </section>

        {/* ===================== QUEM ESTÁ POR TRÁS ===================== */}
        <FounderBand />

        {/* ===================== OFERTA + CONTEÚDO ===================== */}
        <section className="relative">
          <div className="container pb-16">
            <div className="grid gap-10 md:grid-cols-[1fr_400px]">
              {/* Checkout — primeiro no mobile */}
              <div
                id="comprar"
                className="order-1 scroll-mt-24 md:order-2 md:sticky md:top-24 md:self-start"
              >
                <div className="rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-1.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                  <ManualCheckout
                    slug={m.slug}
                    precoCents={m.precoCents}
                    publicKey={process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY}
                  />
                </div>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50">
                  <ShieldCheck className="h-3.5 w-3.5 text-success-400" />
                  Entrega imediata · Garantia de 7 dias (CDC art. 49)
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-white/40">
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Pagamento via Mercado Pago
                  </span>
                  <span>·</span>
                  <span>Empresa privada — não somos o INSS</span>
                </div>
              </div>

              {/* Pitch comercial */}
              <div className="order-2 space-y-6 md:order-1">
                {/* Value stack */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/20 blur-2xl" />
                  <h2 className="font-display text-2xl font-black text-balance text-white">
                    Tudo para montar o recurso{" "}
                    <span className="text-gold-300">sozinho e do jeito certo</span>
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{m.resumo}</p>
                  <ul className="mt-6 space-y-3.5">
                    {m.promessa.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-[15px] text-white/85">
                        <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-gradient-to-br from-success-400 to-success-600 text-white shadow-sm">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#comprar"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 py-4 text-base font-black text-white shadow-lift transition hover:-translate-y-0.5 md:hidden"
                  >
                    QUERO MEU MANUAL · {preco} <ArrowRight className="h-5 w-5" />
                  </a>
                </div>

                {/* Garantia — selo + copy */}
                <div className="flex items-center gap-5 rounded-3xl border border-success-400/20 bg-success-500/[0.07] p-6">
                  <SeloGarantia />
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      O risco é meu, não seu
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">
                      Se você achar que não valeu, eu devolvo seus {preco} em até 7 dias — sem
                      perguntar nada, sem precisar justificar (CDC art. 49). Você não perde nada
                      testando.
                    </p>
                  </div>
                </div>

                {/* Por que R$9,90 */}
                <div className="rounded-3xl border border-gold-400/20 bg-gold-500/[0.06] p-7">
                  <h3 className="font-display text-lg font-black text-white">
                    Por que apenas {preco}?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    Porque a maioria das negativas do INSS pode ser recorrida pela própria pessoa,
                    de graça, no Meu INSS — o que falta não é permissão, é saber{" "}
                    <strong className="text-white">exatamente o que escrever</strong>. Somos a{" "}
                    <strong className="text-white">mesma equipe que monta o recurso pronto por{" "}
                    {formatCurrencyBRL(PRICE_PIX_CENTS)}</strong>: o manual é a versão que você faz
                    sozinho, com a mesma base técnica — pelo preço de um lanche.
                  </p>
                </div>

                {/* Autoridade */}
                {beneficio && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                    <h2 className="font-display text-2xl font-black text-balance text-white">
                      Por que o INSS nega {beneficio.nome.toLowerCase()}
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/70">{beneficio.intro}</p>
                    <div className="mt-6 space-y-4">
                      {beneficio.causas.map((c, i) => (
                        <div
                          key={c.titulo}
                          className="rounded-2xl border border-white/10 bg-ink-900/60 p-5"
                        >
                          <h4 className="flex gap-3 font-display text-base font-bold text-white">
                            <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-black text-white">
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

                {/* É confiável? — nomeia o medo de golpe e responde de frente */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                  <h2 className="font-display text-2xl font-black text-balance text-white">
                    Dá pra confiar? <span className="text-gold-300">Perguntas honestas</span>
                  </h2>
                  <div className="mt-5 divide-y divide-white/10">
                    {[
                      {
                        q: "Isso é golpe?",
                        a: `Não. A Recurso Fácil é uma plataforma real, o pagamento é processado pelo Mercado Pago e você tem 7 dias para pedir o dinheiro de volta. Antes de comprar, você pode até falar com a gente no WhatsApp.`,
                      },
                      {
                        q: "Isso é oficial do INSS ou do governo?",
                        a: "Não. Somos uma empresa privada e independente — e é justamente por isso que ajudamos você a contestar a decisão do INSS. Nunca pedimos a sua senha do Meu INSS.",
                      },
                      {
                        q: "Vou mesmo receber o material?",
                        a: "Sim. Assim que o pagamento é confirmado, o PDF chega no seu e-mail e abre na hora aqui na tela. Acesso imediato.",
                      },
                      {
                        q: "E se não funcionar para o meu caso?",
                        a: `Você tem 7 dias de garantia (CDC art. 49): se achar que não valeu, devolvemos os ${preco} integralmente, sem perguntar nada.`,
                      },
                    ].map((f) => (
                      <details key={f.q} className="group py-4">
                        <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-white">
                          {f.q}
                          <span className="text-brand-300 transition group-open:rotate-45">+</span>
                        </summary>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{f.a}</p>
                      </details>
                    ))}
                  </div>
                </div>

                {/* Upsell Diamante — "em até 12x" (sem número de parcela) */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900 p-7 ring-1 ring-white/10">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold-500/25 blur-3xl" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-300">
                    Prefere não fazer sozinho?
                  </p>
                  <p className="mt-2 font-display text-xl font-black text-white">
                    A gente monta o seu recurso pronto, para você só protocolar
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Você descreve o caso, anexa os documentos e recebe a peça em PDF e Word,
                    fundamentada e pronta para o Meu INSS.
                  </p>
                  <div className="mt-4 flex items-end gap-3">
                    <span className="font-display text-3xl font-black text-white">
                      {formatCurrencyBRL(PRICE_PIX_CENTS)}
                    </span>
                    <span className="pb-1 text-sm text-white/70">
                      ou em até {MAX_INSTALLMENTS}x no cartão
                    </span>
                  </div>
                  <Link
                    href="/novo-recurso"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-ink-950 transition hover:-translate-y-0.5"
                  >
                    Quero o recurso pronto <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* WhatsApp rebaixado */}
                <p className="text-center text-sm text-white/50">
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
        </section>
      </main>
      <Footer />
    </>
  );
}
