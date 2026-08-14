import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Info,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { guias, getGuia, fontesDoGuia, type Block } from "@/content/guias";
import { getManualPorGuia } from "@/content/manuais";
import { JsonLd } from "@/components/seo/json-ld";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { AUTORIA, temCredencial, revisadoEmData } from "@/lib/org";
import { formatDateBR, formatCurrencyBRL } from "@/lib/utils";
import { whatsappHref } from "@/lib/whatsapp";

export function generateStaticParams() {
  return guias.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const guia = getGuia(params.slug);
  if (!guia) return {};
  return { title: guia.title, description: guia.excerpt };
}

const calloutStyles = {
  info: {
    wrap: "border-brand-400/30 bg-brand-500/10",
    icon: "text-brand-300",
    title: "text-brand-200",
    Icon: Info,
  },
  warn: {
    wrap: "border-amber-400/30 bg-amber-500/10",
    icon: "text-amber-300",
    title: "text-amber-200",
    Icon: AlertTriangle,
  },
  tip: {
    wrap: "border-success-400/30 bg-success-500/10",
    icon: "text-success-300",
    title: "text-success-200",
    Icon: Lightbulb,
  },
} as const;

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={i}
          className="mt-12 font-display text-2xl font-semibold text-balance text-white"
        >
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p key={i} className="mt-5 text-[17px] leading-relaxed text-white/70 text-pretty">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul key={i} className="mt-5 space-y-3">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[17px] leading-relaxed text-white/70">
              <span className="mt-1.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <span className="text-pretty">{item}</span>
            </li>
          ))}
        </ul>
      );
    case "callout": {
      const s = calloutStyles[block.variant];
      return (
        <div key={i} className={`mt-8 rounded-2xl border p-5 ${s.wrap}`}>
          <div className="flex items-start gap-3">
            <s.Icon className={`mt-0.5 h-5 w-5 flex-none ${s.icon}`} />
            <div>
              <p className={`font-semibold ${s.title}`}>{block.title}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-white/70 text-pretty">
                {block.text}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default function GuiaPage({ params }: { params: { slug: string } }) {
  const guia = getGuia(params.slug);
  if (!guia) notFound();

  // Manual da esteira que atende o benefício deste guia (se houver).
  const manual = getManualPorGuia(guia.slug);

  // Relacionados explícitos quando existem; senão, da mesma categoria. Os "3
  // primeiros da lista" não têm relação nenhuma com o que a pessoa está lendo.
  const relacionados = (guia.relacionados ?? [])
    .map((slug) => guias.find((g) => g.slug === slug))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const outros =
    relacionados.length > 0
      ? relacionados
      : guias.filter((g) => g.slug !== guia.slug && g.category === guia.category).slice(0, 3);

  const fontes = fontesDoGuia(guia);

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: guia.title,
            description: guia.excerpt,
            path: `/guias/${guia.slug}`,
            updatedAt: AUTORIA.revisadoEm,
            authorName: AUTORIA.autor,
            sources: fontes.map((f) => ({ titulo: f.titulo, url: f.url })),
          }),
          breadcrumbSchema([
            { nome: "Início", path: "/" },
            { nome: "Guias", path: "/guias" },
            { nome: guia.title, path: `/guias/${guia.slug}` },
          ]),
        ]}
      />
      <Navbar />
      <main className="relative bg-ink-950 text-white">
        <article className="container max-w-3xl py-14">
          <Link
            href="/guias"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Todos os guias
          </Link>

          <header className="mt-6 border-b border-white/10 pb-8">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
              <span className="rounded-full bg-brand-500/15 px-3 py-1 text-brand-200 ring-1 ring-brand-400/30">
                {guia.category}
              </span>
              <span className="flex items-center gap-1.5 text-white/40">
                <Clock className="h-3.5 w-3.5" />
                {guia.readingMinutes} min de leitura
              </span>
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-balance text-white">
              {guia.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/70 text-pretty">
              {guia.excerpt}
            </p>

            {/* Autoria e data de revisão: em tema previdenciário (YMYL) o Google
                e o leitor querem saber quem escreveu e quando foi conferido. */}
            <p className="mt-6 text-sm text-white/50">
              Por <span className="font-medium text-white/80">{AUTORIA.autor}</span>
              {temCredencial && <span className="text-white/60"> · OAB {AUTORIA.oab}</span>}
              {" · "}
              Revisado em {formatDateBR(revisadoEmData())}
            </p>
          </header>

          <div>{guia.blocks.map(renderBlock)}</div>

          {/* Fontes oficiais. Só legislação e órgãos públicos — em tema YMYL,
              link para site de terceiro conta contra, não a favor. */}
          {fontes.length > 0 && (
            <section className="mt-14 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Fontes oficiais
              </h2>
              <ul className="mt-4 space-y-2.5">
                {fontes.map((f) => (
                  <li key={f.url}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-300 underline decoration-brand-400/40 underline-offset-4 hover:decoration-brand-300"
                    >
                      {f.titulo}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CTA WhatsApp-first: canal humano em destaque; manual e recurso como 2ª opção. */}
          <div className="mt-16 rounded-3xl bg-ink-950 p-8 text-white md:p-10">
            <h2 className="font-display text-2xl font-semibold text-balance">
              Ficou com dúvida sobre o seu caso?
            </h2>
            <p className="mt-3 leading-relaxed text-white/70 text-pretty">
              Fale com um especialista no WhatsApp, sem compromisso. E, se preferir, a
              gente monta o recurso pronto — ou você faz por conta própria com o manual.
            </p>

            <a
              href={whatsappHref(
                "Olá! Vim pelos guias da Recurso Fácil e gostaria de tirar uma dúvida sobre o meu recurso.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-white shadow-lift transition hover:-translate-y-0.5 sm:w-auto sm:px-8"
              style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
            >
              Falar no WhatsApp <ArrowRight className="h-4 w-4" />
            </a>

            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Ou resolva por conta própria
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {manual && (
                <Link
                  href={`/manuais/${manual.slug}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <FileText className="h-4 w-4 text-brand-300" /> Fazer você mesmo com o manual
                    </span>
                    <span className="mt-0.5 block text-xs text-white/60">
                      Passo a passo completo em PDF — {formatCurrencyBRL(manual.precoCents)}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 flex-none text-white/70" />
                </Link>
              )}
              <Link
                href="/novo-recurso"
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <span>
                  <span className="text-sm font-semibold text-white">Receber o recurso pronto</span>
                  <span className="mt-0.5 block text-xs text-white/60">
                    A gente monta e entrega em PDF e Word para protocolar
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 flex-none text-white/70" />
              </Link>
            </div>
          </div>

          {/* Caminhos de maior intenção. Ficam depois do CTA principal para não
              competir com ele, mas antes do rodapé, onde ainda são vistos. */}
          <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/posso-recorrer" className="font-medium text-brand-300 hover:underline">
              Posso recorrer? (grátis)
            </Link>
            <Link href="/calculadora" className="font-medium text-brand-300 hover:underline">
              Simular meu benefício
            </Link>
            <Link href="/guias/prazo-de-30-dias-para-recorrer" className="font-medium text-brand-300 hover:underline">
              Qual é o meu prazo?
            </Link>
            <Link href="/guias/documentos-que-fortalecem-seu-recurso" className="font-medium text-brand-300 hover:underline">
              Quais documentos juntar
            </Link>
            <Link href="/faq" className="font-medium text-brand-300 hover:underline">
              Perguntas frequentes
            </Link>
          </nav>

          <p className="mt-8 text-xs leading-relaxed text-white/40">
            Este conteúdo tem caráter informativo e não substitui orientação jurídica
            individualizada. A Recurso Fácil é uma plataforma privada e independente, sem
            vínculo com o INSS ou com o Governo Federal.
          </p>
        </article>

        {/* Outros guias */}
        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="container max-w-5xl py-16">
            <h2 className="font-display text-xl font-semibold text-white">
              Continue lendo
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {outros.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guias/${g.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/[0.08]"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                    {g.category}
                  </span>
                  <p className="mt-2 font-display text-lg font-semibold leading-snug text-balance text-white">
                    {g.title}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300">
                    Ler
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
