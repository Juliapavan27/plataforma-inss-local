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
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { guias, getGuia, type Block } from "@/content/guias";

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
    wrap: "border-brand-200/70 bg-brand-50/70",
    icon: "text-brand-600",
    title: "text-brand-900",
    Icon: Info,
  },
  warn: {
    wrap: "border-amber-200 bg-amber-50",
    icon: "text-amber-600",
    title: "text-amber-900",
    Icon: AlertTriangle,
  },
  tip: {
    wrap: "border-success-100 bg-success-50",
    icon: "text-success-600",
    title: "text-success-700",
    Icon: Lightbulb,
  },
} as const;

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={i}
          className="mt-12 font-display text-2xl font-semibold text-balance text-ink-950"
        >
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p key={i} className="mt-5 text-[17px] leading-relaxed text-ink-700 text-pretty">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul key={i} className="mt-5 space-y-3">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[17px] leading-relaxed text-ink-700">
              <span className="mt-1.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-200/60">
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
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700 text-pretty">
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

  const outros = guias.filter((g) => g.slug !== guia.slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="relative">
        <article className="container max-w-3xl py-14">
          <Link
            href="/guias"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" /> Todos os guias
          </Link>

          <header className="mt-6 border-b border-ink-200/70 pb-8">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700 ring-1 ring-brand-200/60">
                {guia.category}
              </span>
              <span className="flex items-center gap-1.5 text-ink-400">
                <Clock className="h-3.5 w-3.5" />
                {guia.readingMinutes} min de leitura
              </span>
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-balance text-ink-950">
              {guia.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-600 text-pretty">
              {guia.excerpt}
            </p>
          </header>

          <div>{guia.blocks.map(renderBlock)}</div>

          {/* CTA no fim do artigo */}
          <div className="mt-16 rounded-3xl bg-ink-950 p-8 text-white md:p-10">
            <h2 className="font-display text-2xl font-semibold text-balance">
              Pronto para recorrer?
            </h2>
            <p className="mt-3 leading-relaxed text-white/70 text-pretty">
              Responda um formulário guiado e receba seu recurso administrativo em PDF e
              Word, com fundamentação técnica, pronto para protocolar no Meu INSS.
            </p>
            <Link href="/novo-recurso" className="btn-gold mt-6 px-6 py-3.5">
              Gerar meu recurso <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-ink-400">
            Este conteúdo tem caráter informativo e não substitui orientação jurídica
            individualizada. A Recurso Fácil é uma plataforma privada e independente, sem
            vínculo com o INSS ou com o Governo Federal.
          </p>
        </article>

        {/* Outros guias */}
        <section className="border-t border-ink-200/70 bg-white/50">
          <div className="container max-w-5xl py-16">
            <h2 className="font-display text-xl font-semibold text-ink-950">
              Continue lendo
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {outros.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guias/${g.slug}`}
                  className="group rounded-2xl border border-ink-200/70 bg-white p-5 shadow-ring transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                    {g.category}
                  </span>
                  <p className="mt-2 font-display text-lg font-semibold leading-snug text-balance text-ink-950">
                    {g.title}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
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
