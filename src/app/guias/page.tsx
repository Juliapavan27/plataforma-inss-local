import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { guias } from "@/content/guias";

export const metadata = {
  title: "Guias — Entenda seus direitos no INSS",
  description:
    "Guias práticos sobre benefícios negados pelo INSS: o que fazer após o indeferimento, como contestar a perícia, quais documentos reunir e como funciona o cálculo do BPC/LOAS.",
};

export default function GuiasPage() {
  const [destaque, ...demais] = guias;

  return (
    <>
      <Navbar />
      <main className="relative bg-ink-950 text-white">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-x-0 -top-40 h-[420px] bg-radial-brand opacity-30" />
            <div className="absolute -right-32 top-10 h-[380px] w-[380px] rounded-full bg-gold-500/10 blur-3xl" />
          </div>
          <div className="container py-16 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-200 ring-1 ring-white/15">
                <BookOpen className="h-3.5 w-3.5" /> Guias
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold text-balance text-white md:text-5xl">
                Entenda seus direitos{" "}
                <span className="italic text-gold-300">em linguagem simples.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/70 text-pretty">
                Conteúdo prático sobre as dúvidas mais comuns de quem teve um benefício
                negado pelo INSS — sem juridiquês.
              </p>
            </div>
          </div>
        </section>

        <section className="container pb-24">
          {/* Guia em destaque */}
          <Link
            href={`/guias/${destaque.slug}`}
            className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-lift transition hover:-translate-y-1 md:p-12"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl transition-opacity group-hover:opacity-80" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" />
            <div className="relative max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
                <span className="rounded-full bg-white/10 px-3 py-1 text-white/90 ring-1 ring-white/15">
                  {destaque.category}
                </span>
                <span className="flex items-center gap-1.5 text-white/60">
                  <Clock className="h-3.5 w-3.5" />
                  {destaque.readingMinutes} min de leitura
                </span>
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold text-balance md:text-4xl">
                {destaque.title}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/70 text-pretty">
                {destaque.excerpt}
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
                Ler o guia
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Demais guias */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {demais.map((g) => (
              <Link
                key={g.slug}
                href={`/guias/${g.slug}`}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/[0.08]"
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-brand-200 ring-1 ring-brand-400/30">
                    {g.category}
                  </span>
                  <span className="flex items-center gap-1 text-white/40">
                    <Clock className="h-3 w-3" />
                    {g.readingMinutes} min
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-balance text-white">
                  {g.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">
                  {g.excerpt}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-300">
                  Ler
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900 p-8 text-center md:p-12">
            <h2 className="font-display text-2xl font-semibold text-balance text-white md:text-3xl">
              Já sabe o motivo da sua negativa?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/70 text-pretty">
              Monte seu recurso administrativo com fundamentação técnica e receba em PDF e
              Word, pronto para protocolar no Meu INSS.
            </p>
            <Link
              href="/novo-recurso"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-ink-950 transition hover:-translate-y-0.5"
            >
              Gerar meu recurso <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
