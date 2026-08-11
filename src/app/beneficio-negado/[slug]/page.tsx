import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, FileText, ShieldCheck, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { StickyMobileCTA } from "@/components/landing/sticky-mobile-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { beneficiosNegados, getBeneficio } from "@/content/beneficios";
import { getManualPorBeneficio } from "@/content/manuais";
import { ManualOffer } from "@/components/manuais/manual-offer";
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

      <main className="relative">
        <article className="container max-w-3xl py-12 pb-28 md:py-16 md:pb-16">
          <Link
            href="/beneficio-negado"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" /> Todos os benefícios
          </Link>

          <header className="mt-6 border-b border-ink-200/70 pb-8">
            <span className="chip-brand bg-red-50 text-red-700 ring-red-200">
              <Clock className="h-3.5 w-3.5" /> 30 dias para recorrer
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-balance text-ink-950">
              {b.titulo}: por que acontece e como recorrer
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-700 text-pretty">{b.intro}</p>
            <p className="mt-6 text-sm text-ink-500">
              Por <span className="font-medium text-ink-700">{AUTORIA.autor}</span>
              {temCredencial && <span className="text-ink-600"> · OAB {AUTORIA.oab}</span>}
              {" · "}Revisado em {formatDateBR(revisadoEmData())}
            </p>
          </header>

          {/* Pré-análise cedo: quem chegou aqui quer saber se ainda dá tempo. */}
          <div className="mt-10 rounded-2xl border border-brand-200 bg-brand-50/70 p-6">
            <p className="font-display text-lg font-semibold text-ink-950">
              Ainda dá tempo de recorrer?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              O prazo é de 30 dias corridos da ciência da decisão. Responda 3 perguntas e
              descubra em qual situação você está — é gratuito e não pede cadastro.
            </p>
            <Link href="/posso-recorrer" className="btn-primary mt-4 px-6 py-3">
              Fazer a pré-análise <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <h2 className="mt-14 font-display text-2xl font-semibold text-balance text-ink-950">
            Por que o INSS nega {b.nome.toLowerCase()}
          </h2>
          <div className="mt-6 space-y-5">
            {b.causas.map((c, i) => (
              <div key={c.titulo} className="rounded-2xl border border-ink-200/70 bg-white p-6">
                <h3 className="flex gap-3 font-display text-lg font-semibold text-ink-950">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-ink-950 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {c.titulo}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{c.explicacao}</p>
                <p className="mt-4 rounded-xl bg-success-50 p-4 text-sm leading-relaxed text-ink-800">
                  <strong className="text-success-700">O que costuma ajudar:</strong>{" "}
                  {c.oQueAjuda}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-14 font-display text-2xl font-semibold text-balance text-ink-950">
            Documentos que costumam ser relevantes
          </h2>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {b.documentos.map((d) => (
              <li
                key={d}
                className="flex items-start gap-2.5 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-700"
              >
                <FileText className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
                {d}
              </li>
            ))}
          </ul>

          <h2 className="mt-14 font-display text-2xl font-semibold text-balance text-ink-950">
            Qual é o seu prazo
          </h2>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="flex gap-3 font-semibold text-amber-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
              30 dias corridos a partir da ciência da decisão
            </p>
            <p className="mt-3 pl-8 text-sm leading-relaxed text-ink-800">
              Ciência é a data em que você tomou conhecimento — normalmente a data da carta
              ou do aviso no Meu INSS —, que pode ser diferente da data em que o INSS
              decidiu. Perdido esse prazo, o caminho normalmente passa a ser um novo
              requerimento ou a via judicial.
              {b.observacaoPrazo ? ` ${b.observacaoPrazo}` : ""}
            </p>
            <Link
              href="/guias/prazo-de-30-dias-para-recorrer"
              className="mt-4 inline-flex items-center gap-1.5 pl-8 text-sm font-semibold text-brand-700 hover:underline"
            >
              Entender o prazo em detalhe <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <h2 className="mt-14 font-display text-2xl font-semibold text-balance text-ink-950">
            Como recorrer, passo a passo
          </h2>
          <ol className="mt-6 space-y-4">
            {[
              "Localize na carta o motivo exato do indeferimento — é a ele que o recurso precisa responder.",
              "Reúna os documentos acima, priorizando os que são novos em relação ao que já estava no processo.",
              "Monte o recurso apontando o erro na análise e ligando cada documento ao requisito questionado.",
              "Protocole no Meu INSS, em “Recorrer de decisão”. O protocolo é gratuito e pode ser feito por você.",
              "Acompanhe pelo Meu INSS. O julgamento é feito pela Junta de Recursos do CRPS.",
            ].map((passo, i) => (
              <li key={passo} className="flex gap-4">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-[15px] leading-relaxed text-ink-700">{passo}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/guias/como-protocolar-recurso-no-meu-inss"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
          >
            Ver o passo a passo com telas do Meu INSS <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Esteira: quem quer fazer sozinho leva o manual barato antes da venda cheia. */}
          {manual && <ManualOffer manual={manual} />}

          {/* CTA — WhatsApp-first: a audiência é informacional e o canal humano
              é o que converte. A compra direta fica como segunda opção. */}
          <div className="mt-14 rounded-3xl bg-ink-950 p-8 text-white md:p-10">
            <h2 className="font-display text-2xl font-semibold text-balance">
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

          <h2 className="mt-14 font-display text-2xl font-semibold text-balance text-ink-950">
            Perguntas frequentes
          </h2>
          <div className="mt-6 divide-y divide-ink-200/70 overflow-hidden rounded-2xl border border-ink-200/70 bg-white">
            {b.perguntas.map((p) => (
              <details key={p.pergunta} className="group px-6 py-5 open:bg-ink-50/60">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink-900">
                  {p.pergunta}
                  <span className="ml-4 text-brand-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{p.resposta}</p>
              </details>
            ))}
          </div>

          {guias.length > 0 && (
            <>
              <h2 className="mt-14 font-display text-2xl font-semibold text-balance text-ink-950">
                Continue lendo
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {guias.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guias/${g.slug}`}
                    className="group rounded-2xl border border-ink-200/70 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lift"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                      {g.category}
                    </span>
                    <p className="mt-2 font-display text-base font-semibold leading-snug text-balance text-ink-950">
                      {g.title}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}

          <p className="mt-12 text-xs leading-relaxed text-ink-400">
            Este conteúdo tem caráter informativo e não substitui orientação jurídica
            individualizada. A Recurso Fácil é uma plataforma privada e independente, sem
            vínculo com o INSS ou com o Governo Federal.
          </p>
        </article>
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
