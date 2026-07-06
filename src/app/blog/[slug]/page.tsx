import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Clock, Scale, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { formatDateBR } from "@/lib/utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const post = await db.blogPost.findUnique({ where: { slug: params.slug } });
  return {
    title: post?.title,
    description: post?.excerpt,
    openGraph: { title: post?.title, description: post?.excerpt },
  };
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}

/**
 * Renderiza o conteúdo com suporte mínimo a **negrito**, parágrafos e listas.
 * O conteúdo do seed usa markdown simples.
 */
function renderContent(content: string) {
  const blocks = content.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();

    // Lista numerada
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split(/\n/).map((l) => l.replace(/^\d+\.\s*/, ""));
      return (
        <ol key={i} className="list-decimal space-y-2 pl-6">
          {items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}
        </ol>
      );
    }
    // Lista bullet
    if (/^[-•]\s/.test(trimmed)) {
      const items = trimmed.split(/\n/).map((l) => l.replace(/^[-•]\s*/, ""));
      return (
        <ul key={i} className="list-disc space-y-2 pl-6">
          {items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}
        </ul>
      );
    }
    // Heading inline com **
    if (/^\*\*.+\*\*$/.test(trimmed)) {
      return (
        <h3 key={i} className="mt-10 font-display text-xl font-semibold text-ink-950">
          {trimmed.replace(/\*\*/g, "")}
        </h3>
      );
    }
    // Parágrafo padrão
    return (
      <p key={i} className="leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    /^\*\*[^*]+\*\*$/.test(p) ? (
      <strong key={i} className="font-semibold text-ink-950">
        {p.replace(/\*\*/g, "")}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export default async function PostPage({ params }: Props) {
  const post = await db.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) notFound();

  const related = await db.blogPost.findMany({
    where: { published: true, NOT: { id: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <>
      <Navbar />
      <main className="relative">
        {/* Header */}
        <section className="relative overflow-hidden pt-10">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-x-0 -top-40 h-[400px] bg-radial-brand" />
          </div>

          <div className="container max-w-3xl py-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
            >
              <ArrowLeft className="h-4 w-4" /> Todos os artigos
            </Link>

            <div className="mt-8 flex items-center gap-4 text-xs text-ink-500">
              <span>{formatDateBR(post.publishedAt)}</span>
              <span className="h-1 w-1 rounded-full bg-ink-300" />
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {readingTime(post.content)} min de leitura
              </span>
            </div>

            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink-950 md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-ink-600 text-pretty">
              {post.excerpt}
            </p>

            {/* Autor */}
            <div className="mt-8 flex items-center gap-3 border-y border-ink-200/60 py-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-xs font-bold text-white">
                <Scale className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  Equipe editorial · Plataforma INSS
                </p>
                <p className="text-xs text-ink-500">
                  Conteúdo revisado por nossos fundadores, ambos profissionais do direito
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Corpo */}
        <section className="container max-w-3xl">
          <article className="space-y-6 text-[17px] text-ink-700">
            {renderContent(post.content)}
          </article>

          {/* Disclaimer */}
          <div className="mt-16 flex items-start gap-3 rounded-2xl border border-ink-200/70 bg-white/80 p-5 text-[13px] leading-relaxed text-ink-600 shadow-ring">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
            <p>
              <strong className="text-ink-900">Importante:</strong> este artigo tem
              caráter informativo e não substitui consultoria jurídica personalizada.
              A Plataforma INSS é uma empresa de tecnologia jurídica, não escritório
              de advocacia. Sempre revise seu caso específico antes de tomar decisões.
            </p>
          </div>

          {/* CTA */}
          <div className="relative mt-16 overflow-hidden rounded-3xl border border-ink-950/10 bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-10 text-white shadow-lift">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold-500/30 blur-3xl" />
            <div className="relative max-w-xl">
              <h3 className="font-display text-2xl font-semibold leading-snug md:text-3xl">
                Seu benefício foi negado?{" "}
                <span className="italic text-gradient-gold">
                  Monte seu recurso agora.
                </span>
              </h3>
              <p className="mt-4 text-white/80">
                Em 3 minutos você tem um recurso tecnicamente sólido, pronto
                pra protocolar no INSS.
              </p>
              <Link
                href="/novo-recurso"
                className="btn-gold mt-6 inline-flex px-7 py-4 text-base"
              >
                Gerar meu recurso <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="container max-w-5xl py-24">
            <h2 className="font-display text-2xl font-semibold text-ink-950">
              Continue lendo
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group rounded-2xl border border-ink-200/70 bg-white/80 p-6 shadow-ring transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <p className="text-xs text-ink-500">{formatDateBR(r.publishedAt)}</p>
                  <h3 className="mt-3 font-display text-base font-semibold leading-snug text-ink-950 group-hover:text-brand-700">
                    {r.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-600">
                    {r.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
