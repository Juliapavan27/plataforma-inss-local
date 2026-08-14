import Link from "next/link";
import { ArrowRight, Clock, FileText, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { StickyMobileCTA } from "@/components/landing/sticky-mobile-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { beneficiosNegados } from "@/content/beneficios";
import { PRICE_PIX_CENTS, PRICE_CARD_CENTS } from "@/lib/pricing";
import { formatCurrencyBRL } from "@/lib/utils";

export const metadata = {
  title: "Benefício negado pelo INSS: o que fazer e como recorrer",
  description:
    "Auxílio-doença, BPC/LOAS, aposentadoria, pensão ou salário-maternidade negados? Entenda por que o INSS indeferiu, qual é o seu prazo e como apresentar recurso.",
  alternates: { canonical: "/beneficio-negado" },
};

/**
 * Página-pilar do cluster "benefício negado".
 *
 * Existe porque a busca real é por benefício ("auxílio-doença negado"), não
 * pelo nome do produto. Ela concentra a intenção e distribui para os guias que
 * já respondem cada caso — os guias sozinhos competiam entre si.
 */
const PERGUNTAS = [
  {
    pergunta: "O INSS negou meu benefício. Ainda posso conseguir?",
    resposta:
      "Sim. O indeferimento não encerra o processo: cabe recurso administrativo à Junta de Recursos do CRPS, que é gratuito e não exige advogado. O recurso é analisado por um colegiado diferente de quem negou.",
  },
  {
    pergunta: "Qual é o prazo para recorrer de uma negativa do INSS?",
    resposta:
      "São 30 dias corridos contados da ciência da decisão. Perdido esse prazo, o caminho normalmente passa a ser um novo requerimento ou a via judicial.",
  },
  {
    pergunta: "Preciso de advogado para recorrer do INSS?",
    resposta:
      "Não. O recurso administrativo pode ser apresentado pelo próprio segurado no Meu INSS. Advogado é obrigatório apenas na via judicial.",
  },
  {
    pergunta: "Recorrer pode fazer eu perder algum direito?",
    resposta:
      "Não. Apresentar recurso administrativo não cancela nem reduz nenhum benefício que você já receba, e não impede um novo requerimento.",
  },
  {
    pergunta: "Quanto custa fazer o recurso pela Recurso Fácil?",
    resposta: `É pagamento único de ${formatCurrencyBRL(PRICE_PIX_CENTS)} no Pix ou ${formatCurrencyBRL(PRICE_CARD_CENTS)} no cartão à vista, sem mensalidade e sem percentual sobre o benefício. O protocolo no Meu INSS continua sendo gratuito.`,
  },
];

export default function BeneficioNegadoPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { nome: "Início", path: "/" },
            { nome: "Benefício negado pelo INSS", path: "/beneficio-negado" },
          ]),
          faqSchema(PERGUNTAS),
        ]}
      />
      <Navbar />

      <main className="relative bg-ink-950 text-white">
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-x-0 -top-40 h-[520px] bg-radial-brand opacity-30" />
            <div className="absolute inset-0 bg-grid mask-fade-b opacity-20" />
          </div>

          <div className="container max-w-3xl py-16 md:py-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-300 ring-1 ring-red-400/30">
              <Clock className="h-3.5 w-3.5" /> Você tem 30 dias para recorrer
            </span>
            <h1 className="mt-6 font-display text-display-lg font-semibold text-balance text-white">
              Benefício negado pelo INSS: <span className="italic text-gold-300">o que fazer agora</span>
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-white/70 text-pretty">
              Receber a carta de indeferimento não significa que você não tem direito.
              Significa que, com o que estava no processo, o INSS entendeu que faltava
              algum requisito — e isso pode ser contestado.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/posso-recorrer" className="btn-primary px-7 py-3.5">
                Descobrir se posso recorrer <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/novo-recurso"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Já sei, quero gerar meu recurso
              </Link>
            </div>
          </div>
        </section>

        {/* Entrada por benefício — o jeito como a pessoa procura */}
        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="container max-w-5xl py-16">
            <h2 className="font-display text-3xl font-semibold text-balance text-white">
              Qual benefício foi negado?
            </h2>
            <p className="mt-3 max-w-2xl text-white/60">
              Cada benefício é negado por motivos diferentes, e o recurso precisa atacar
              exatamente o motivo que aparece na sua carta.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {beneficiosNegados.map((b) => {
                return (
                  <Link
                    key={b.slug}
                    href={`/beneficio-negado/${b.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/[0.08]"
                  >
                    <h3 className="font-display text-xl font-semibold text-white">
                      {b.titulo}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{b.chamada}</p>

                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                      Motivos mais comuns
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {b.motivosComuns.map((m) => (
                        <li key={m} className="flex gap-2 text-sm text-white/70">
                          <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-gold-400" />
                          {m}
                        </li>
                      ))}
                    </ul>

                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300">
                      Ver causas, documentos e prazo
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Passos — intenção alta, leva para conversão */}
        <section className="border-t border-white/10">
          <div className="container max-w-3xl py-16">
            <h2 className="font-display text-3xl font-semibold text-balance text-white">
              Como recorrer, passo a passo
            </h2>
            <ol className="mt-8 space-y-6">
              {[
                {
                  titulo: "Confira o prazo na sua carta",
                  texto: "São 30 dias corridos da ciência da decisão. É o item mais importante — perdido o prazo, o caminho muda.",
                  href: "/guias/prazo-de-30-dias-para-recorrer",
                  link: "Entender o prazo",
                },
                {
                  titulo: "Descubra o motivo exato da negativa",
                  texto: "A carta traz o fundamento do indeferimento. O recurso precisa responder a ele, e não repetir o pedido original.",
                  href: "/guias/inss-negou-meu-beneficio-o-que-fazer",
                  link: "Ler a carta de indeferimento",
                },
                {
                  titulo: "Reúna os documentos que sustentam o seu caso",
                  texto: "Documento novo e pertinente é o que muda a análise. Laudo genérico costuma não mudar nada.",
                  href: "/guias/documentos-que-fortalecem-seu-recurso",
                  link: "Ver quais documentos juntar",
                },
                {
                  titulo: "Monte e protocole o recurso",
                  texto: "O protocolo é gratuito, feito por você no Meu INSS. O que exige técnica é a peça.",
                  href: "/guias/como-protocolar-recurso-no-meu-inss",
                  link: "Como protocolar no Meu INSS",
                },
              ].map((passo, i) => (
                <li key={passo.titulo} className="flex gap-5">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-600 font-display font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {passo.titulo}
                    </h3>
                    <p className="mt-1.5 leading-relaxed text-white/60">{passo.texto}</p>
                    <Link
                      href={passo.href}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:underline"
                    >
                      {passo.link} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ visível — é o que autoriza o FAQ schema lá em cima */}
        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="container max-w-3xl py-16">
            <h2 className="font-display text-3xl font-semibold text-balance text-white">
              Perguntas frequentes
            </h2>
            <div className="mt-8 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {PERGUNTAS.map((p) => (
                <details key={p.pergunta} className="group px-6 py-5 open:bg-white/[0.04]">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-white">
                    {p.pergunta}
                    <span className="ml-4 text-brand-300 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{p.resposta}</p>
                </details>
              ))}
            </div>

            <p className="mt-6 text-sm text-white/60">
              Mais dúvidas na{" "}
              <Link href="/faq" className="font-medium text-brand-300 hover:underline">
                página de perguntas frequentes
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="container max-w-3xl py-16">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white md:p-10">
              <h2 className="font-display text-2xl font-semibold text-balance">
                Pronto para recorrer?
              </h2>
              <p className="mt-3 leading-relaxed text-white/70 text-pretty">
                Descreva o que aconteceu, anexe seus documentos e receba o recurso em PDF e
                Word para revisar antes de protocolar.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold-400" /> Entrega em até 24h
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gold-400" /> PDF + Word
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gold-400" /> Garantia de 7 dias
                </span>
              </div>
              <Link href="/novo-recurso" className="btn-gold mt-7 px-6 py-3.5">
                Gerar meu recurso <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-white/40">
              Este conteúdo tem caráter informativo e não substitui orientação jurídica
              individualizada. A Recurso Fácil é uma plataforma privada e independente, sem
              vínculo com o INSS ou com o Governo Federal.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
