import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { formatDateBR } from "@/lib/utils";

export const metadata = {
  title: "Blog — Conteúdo jurídico previdenciário em linguagem acessível",
  description:
    "Artigos, guias e orientações sobre benefícios do INSS, direitos do segurado, novidades legislativas e boas práticas para recursos administrativos.",
};

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}

export default async function BlogIndex() {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  const [featured, ...rest] = posts;

  return (
    <>
      <Navbar />
      <main className="relative">
        {/* HERO */}
        <section className="relative isolate overflow-hidden pt-10">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-x-0 -top-40 h-[420px] bg-radial-brand" />
            <div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-gold-200/40 blur-3xl" />
          </div>

          <div className="container py-16 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="chip-brand">
                <BookOpen className="h-3.5 w-3.5" /> Conteúdo livre
              </span>
              <h1 className="mt-6 font-display text-display-lg font-semibold text-balance text-ink-950">
                Seus direitos,{" "}
                <span className="italic text-gradient-brand">
                  explicados de forma simples.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600 text-pretty">
                Guias, artigos e orientações escritos por especialistas para que
                qualquer pessoa entenda seus direitos previdenciários — sem
                juridiquês, sem pegadinha.
              </p>
            </div>
          </div>
        </section>

        <section className="container pb-24">
          {posts.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-ink-200/70 bg-white/80 p-10 text-center shadow-ring">
              <p className="text-ink-500">Ainda não há posts publicados.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group mb-14 block overflow-hidden rounded-3xl border border-ink-200/70 bg-white/90 shadow-ring transition hover:shadow-lift"
                >
                  <div className="grid md:grid-cols-12">
                    <div className="relative hidden bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-12 md:col-span-5 md:block">
                      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.08]" />
                      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold-500/30 blur-3xl" />
                      <div className="relative flex h-full flex-col justify-between">
                        <span className="chip-dark w-fit">
                          <BookOpen className="h-3.5 w-3.5 text-gold-400" /> Destaque
                        </span>
                        <BookOpen className="h-16 w-16 text-gold-400/40" />
                      </div>
                    </div>
                    <div className="p-8 md:col-span-7 md:p-12">
                      <div className="flex items-center gap-4 text-xs text-ink-500">
                        <span className="chip-brand">Em destaque</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {readingTime(featured.content)} min de leitura
                        </span>
                        <span>{formatDateBR(featured.publishedAt)}</span>
                      </div>
                      <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink-950 group-hover:text-brand-700">
                        {featured.title}
                      </h2>
                      <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
                        {featured.excerpt}
                      </p>
                      <span className="link-underline mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                        Ler artigo completo <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid de posts */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <Link
                    href={`/blog/${p.slug}`}
                    key={p.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white/80 p-6 shadow-ring transition hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-500">
                      <span>{formatDateBR(p.publishedAt)}</span>
                      <span className="h-1 w-1 rounded-full bg-ink-300" />
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readingTime(p.content)} min
                      </span>
                    </div>
                    <h2 className="mt-4 font-display text-xl font-semibold leading-snug tracking-tight text-ink-950 group-hover:text-brand-700">
                      {p.title}
                    </h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600 line-clamp-4">
                      {p.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                      Ler mais <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>

              {/* CTA fim */}
              <div className="relative mt-20 overflow-hidden rounded-3xl border border-ink-950/10 bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-10 text-center text-white md:p-16">
                <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />
                <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold-500/30 blur-3xl" />
                <div className="relative mx-auto max-w-2xl">
                  <h3 className="font-display text-3xl font-semibold text-balance md:text-4xl">
                    Conhecer seus direitos é o primeiro passo.{" "}
                    <span className="italic text-gradient-gold">
                      Exercê-los é o segundo.
                    </span>
                  </h3>
                  <p className="mx-auto mt-5 max-w-xl text-white/80">
                    Se o INSS negou seu benefício, monte seu recurso agora —
                    com a mesma técnica de quem fez esses artigos.
                  </p>
                  <Link
                    href="/novo-recurso"
                    className="btn-gold mt-8 inline-flex px-7 py-4 text-base"
                  >
                    Gerar meu recurso <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
