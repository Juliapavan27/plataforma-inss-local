import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, FileText, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Reveal } from "@/components/ui/reveal";
import { Footer } from "@/components/landing/footer";
import { StickyMobileCTA } from "@/components/landing/sticky-mobile-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { beneficiosNegados, getBeneficio } from "@/content/beneficios";
import { getManualPorBeneficio } from "@/content/manuais";
import { ManualFloatingOffer } from "@/components/manuais/manual-floating-offer";
import { getGuia } from "@/content/guias";
import { AUTORIA, temCredencial, revisadoEmData } from "@/lib/org";
import { formatDateBR, formatCurrencyBRL } from "@/lib/utils";
import { PRICE_PIX_CENTS, PRICE_CARD_CENTS } from "@/lib/pricing";
import { WHATSAPP_HREF } from "@/lib/whatsapp";

export function generateStaticParams() {
  return beneficiosNegados.map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const b = getBeneficio(params.slug);
  if (!b) return {};
  return {
    title: `${b.titulo}: por que acontece e como recorrer`,
    description: `${b.chamada} Entenda as causas mais comuns, quais documentos reunir, qual é o seu prazo e como apresentar recurso ao INSS.`,
    // As buscas reais viram keywords desta página — é ela que deve atender
    // "auxílio-doença negado" e variações, não a home.
    keywords: b.buscas,
    alternates: { canonical: `/beneficio-negado/${b.slug}` },
  };
}

/**
 * Página por benefício — a folha do cluster.
 *
 * Existe porque a busca é específica ("BPC negado por renda"), e uma página
 * genérica sobre recursos não responde a isso. Cada uma cobre causas,
 * documentos, prazo e como recorrer, que é o conjunto que a pessoa precisa
 * antes de decidir qualquer coisa.
 */
export default function BeneficioPage({ params }: { params: { slug: string } }) {
  const b = getBeneficio(params.slug);
  if (!b) notFound();

  const guias = b.guiasRelacionados
    .map((slug) => getGuia(slug))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  const manual = getManualPorBeneficio(b.slug);

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: `${b.titulo}: por que acontece e como recorrer`,
            description: b.chamada,
            path: `/beneficio-negado/${b.slug}`,
            updatedAt: AUTORIA.revisadoEm,
            authorName: AUTORIA.autor,
          }),
          breadcrumbSchema([
            { nome: "Início", path: "/" },
            { nome: "Benefício negado", path: "/beneficio-negado" },
            { nome: b.titulo, path: `/beneficio-negado/${b.slug}` },
          ]),
          faqSchema(b.perguntas),
        ]}
      />
      <Navbar />

      <main className="relative bg-ink-950 text-white">
        {/* HERO DE IMPACTO — feito para o tráfego de anúncio: celular, decide em
            segundos, reage a impacto e não lê texto longo. Grande, curto, alto
            contraste, WhatsApp gritando. O conteúdo rico segue no <article> abaixo,
            que é o que sustenta o SEO orgânico da página. */}
        <section className="relative overflow-hidden bg-ink-950 text-white">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-red-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#25D366]/20 blur-3xl" />
          <div className="container relative max-w-3xl py-12 text-center md:py-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-white">
              <Clock className="h-4 w-4" /> Você tem só 30 dias
            </span>
            <p className="mt-6 font-display text-4xl font-black leading-[1.05] sm:text-5xl md:text-6xl">
              O INSS negou o seu <span className="text-red-400">{b.nome}?</span>
            </p>
            <p className="mx-auto mt-5 max-w-xl text-lg font-semibold leading-snug text-white/90 sm:text-xl">
              Você pode recorrer — mas o prazo é curto. A maioria perde por não saber.{" "}
              <span className="text-gold-300">Não seja essa pessoa.</span>
            </p>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl px-8 py-5 text-lg font-extrabold uppercase tracking-wide text-white shadow-lift transition hover:-translate-y-0.5"
              style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
            >
              <WhatsAppGlyph className="h-6 w-6" /> Falar agora no WhatsApp
            </a>
            <p className="mt-3 text-sm font-medium text-white/70">
              É grátis e sem compromisso · Resposta rápida
            </p>
            <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-white/85">
              <span>✅ Sem enrolação</span>
              <span>✅ Você entende seus direitos</span>
              <span>✅ Atendimento humano</span>
            </div>
          </div>
        </section>

        <article className="container max-w-3xl py-12 pb-28 md:py-16 md:pb-16">
          <Link
            href="/beneficio-negado"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Todos os benefícios
          </Link>

          <header className="mt-6 border-b border-white/10 pb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <Clock className="h-3.5 w-3.5" /> 30 dias para recorrer
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-balance text-white">
              {b.titulo}: por que acontece e como recorrer
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/70 text-pretty">{b.intro}</p>
            <p className="mt-6 text-sm text-white/50">
              Por <span className="font-medium text-white/80">{AUTORIA.autor}</span>
              {temCredencial && <span className="text-white/70"> · OAB {AUTORIA.oab}</span>}
              {" · "}Revisado em {formatDateBR(revisadoEmData())}
            </p>
          </header>

          {/* Pré-análise cedo: quem chegou aqui quer saber se ainda dá tempo.
              Escura de propósito — faz a ponte entre o hero de impacto e o corpo. */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-ink-950 p-6 text-white">
            <p className="font-display text-lg font-bold">Ainda dá tempo de recorrer?</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              O prazo é de 30 dias corridos da ciência da decisão. Responda 3 perguntas e
              descubra em qual situação você está — grátis e sem cadastro.
            </p>
            <Link
              href="/posso-recorrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-ink-950 transition hover:-translate-y-0.5"
            >
              Fazer a pré-análise (grátis) <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Oferta do manual cedo, para o mobile (que não tem a lateral fixa). */}
          {manual && (
            <Link
              href={`/manuais/${manual.slug}`}
              className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 xl:hidden"
            >
              <span>
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileText className="h-4 w-4 text-gold-300" /> Prefere fazer você mesmo?
                </span>
                <span className="mt-0.5 block text-xs text-white/60">
                  Manual completo em PDF, passo a passo — {formatCurrencyBRL(manual.precoCents)}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 flex-none text-white/70" />
            </Link>
          )}

          <Reveal>
            <h2 className="mt-16 font-display text-3xl font-bold text-balance text-white md:text-4xl">
              Por que o INSS nega {b.nome.toLowerCase()}
            </h2>
          </Reveal>
          <div className="mt-8 space-y-5">
            {b.causas.map((c, i) => (
              <Reveal key={c.titulo} delay={i * 80}>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-7">
                  <h3 className="flex items-start gap-4 font-display text-xl font-bold text-white md:text-2xl">
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-brand-600 text-base font-black text-white">
                      {i + 1}
                    </span>
                    <span className="pt-1.5">{c.titulo}</span>
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">{c.explicacao}</p>
                  <p className="mt-5 flex gap-3 rounded-2xl bg-success-500/10 p-5 text-base leading-relaxed text-white/80">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 flex-none text-success-400" />
                    <span>
                      <strong className="font-bold text-success-400">O que costuma ajudar:</strong>{" "}
                      {c.oQueAjuda}
                    </span>
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <h2 className="mt-16 font-display text-3xl font-bold text-balance text-white md:text-4xl">
              Documentos que ajudam no seu recurso
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {b.documentos.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-base font-medium text-white/85"
                >
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-none text-brand-300" />
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="mt-16 font-display text-3xl font-bold text-balance text-white md:text-4xl">
              Você tem só 30 dias
            </h2>
            <div className="mt-8 overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-amber-500/10">
              <div className="flex items-center gap-3 bg-amber-400 px-6 py-4">
                <AlertTriangle className="h-7 w-7 flex-none text-amber-950" />
                <p className="font-display text-xl font-bold text-amber-950 md:text-2xl">
                  30 dias corridos a partir da ciência
                </p>
              </div>
              <div className="p-6">
                <p className="text-base leading-relaxed text-white/80 md:text-lg">
                  Ciência é a data em que você ficou sabendo — em geral a data da carta ou do
                  aviso no Meu INSS. Perdeu o prazo? Aí o caminho passa a ser um novo pedido
                  ou a Justiça.
                  {b.observacaoPrazo ? ` ${b.observacaoPrazo}` : ""}
                </p>
                <Link
                  href="/guias/prazo-de-30-dias-para-recorrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-base font-bold text-amber-300 hover:underline"
                >
                  Entender o prazo <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="mt-16 font-display text-3xl font-bold text-balance text-white md:text-4xl">
              Como recorrer, passo a passo
            </h2>
          </Reveal>
          {/* Régua vertical desenhada: cada passo surge conforme a pessoa rola. */}
          <div className="relative mt-8">
            <div
              className="absolute bottom-8 left-6 top-8 w-1 rounded-full bg-gradient-to-b from-brand-400 via-brand-500 to-[#25D366]/60 md:left-7"
              aria-hidden="true"
            />
            <ol className="space-y-5">
              {[
                "Localize na carta o motivo exato da negativa — é a ele que o recurso responde.",
                "Reúna os documentos acima, dando prioridade aos que são novos no seu processo.",
                "Monte o recurso apontando o erro e ligando cada documento ao que o INSS questionou.",
                "Protocole no Meu INSS, em “Recorrer de decisão”. É de graça e você mesmo pode fazer.",
                "Acompanhe pelo Meu INSS. Quem julga é a Junta de Recursos do CRPS.",
              ].map((passo, i) => (
                <Reveal key={passo} delay={i * 90}>
                  <li className="relative flex items-stretch gap-5">
                    <span className="relative z-10 grid h-12 w-12 flex-none place-items-center rounded-full bg-brand-600 text-lg font-black text-white shadow-lift ring-4 ring-ink-950 md:h-14 md:w-14">
                      {i + 1}
                    </span>
                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-5 text-base leading-relaxed text-white/85 md:text-lg">
                      {passo}
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
          <Link
            href="/guias/como-protocolar-recurso-no-meu-inss"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:underline"
          >
            Ver o passo a passo com telas do Meu INSS <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* CTA — WhatsApp-first: a audiência é informacional e o canal humano
              é o que converte. A compra direta fica como segunda opção. */}
          <div className="mt-14 rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900 p-8 text-white ring-1 ring-white/10 md:p-10">
            <h2 className="font-display text-2xl font-bold text-balance">
              Ficou com dúvida sobre o seu caso?
            </h2>
            <p className="mt-3 leading-relaxed text-white/70 text-pretty">
              Fale com um especialista no WhatsApp, sem compromisso. E, se preferir, a
              gente monta o recurso pronto — em PDF e Word, para você revisar e protocolar.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base font-semibold text-white shadow-lift transition hover:-translate-y-0.5"
                style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
              >
                Falar no WhatsApp <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/novo-recurso"
                className="btn px-7 py-3.5 text-base text-white ring-1 ring-white/20 hover:bg-white/10"
              >
                Gerar meu recurso ({formatCurrencyBRL(PRICE_PIX_CENTS)})
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold-400" /> Entrega em até 24h
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold-400" /> Garantia de 7 dias
              </span>
            </div>
          </div>

          <h2 className="mt-14 font-display text-2xl font-bold text-balance text-white">
            Perguntas frequentes
          </h2>
          <div className="mt-6 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {b.perguntas.map((p) => (
              <details key={p.pergunta} className="group px-6 py-5 open:bg-white/5">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-white">
                  {p.pergunta}
                  <span className="ml-4 text-brand-300 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{p.resposta}</p>
              </details>
            ))}
          </div>

          {guias.length > 0 && (
            <>
              <h2 className="mt-14 font-display text-2xl font-bold text-balance text-white">
                Continue lendo
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {guias.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guias/${g.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                      {g.category}
                    </span>
                    <p className="mt-2 font-display text-base font-semibold leading-snug text-balance text-white">
                      {g.title}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}

          <p className="mt-12 text-xs leading-relaxed text-white/40">
            Este conteúdo tem caráter informativo e não substitui orientação jurídica
            individualizada. A Recurso Fácil é uma plataforma privada e independente, sem
            vínculo com o INSS ou com o Governo Federal.
          </p>
        </article>
      </main>
      <Footer />
      <StickyMobileCTA />
      {manual && <ManualFloatingOffer manual={manual} />}
    </>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.447h.005c6.585 0 11.946-5.335 11.949-11.893a11.821 11.821 0 00-3.479-8.413z" />
    </svg>
  );
}
