import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { AUTORIA, temCredencial, revisadoEmData } from "@/lib/org";
import { FONTES } from "@/content/guias";
import { formatDateBR } from "@/lib/utils";
import { SUPPORT_EMAIL } from "@/lib/support";
import { BookOpen, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Política editorial — como produzimos nosso conteúdo",
  description:
    "Quem escreve, como revisamos, quais fontes usamos e o que deliberadamente não afirmamos no conteúdo sobre benefícios do INSS.",
  alternates: { canonical: "/politica-editorial" },
};

/**
 * Página de política editorial.
 *
 * Conteúdo previdenciário é YMYL: o Google avalia se existe processo
 * editorial declarado, não só se o texto está bom. Dizer publicamente quem
 * escreve, com que fontes e o que não se afirma é o sinal que ele procura — e
 * é o que o leitor precisa para decidir se confia.
 */
export default function PoliticaEditorialPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { nome: "Início", path: "/" },
          { nome: "Política editorial", path: "/politica-editorial" },
        ])}
      />
      <Navbar />
      <main className="container max-w-3xl py-16">
        <h1 className="font-display text-4xl font-bold text-balance text-ink-950">
          Política editorial
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600 text-pretty">
          Conteúdo sobre benefícios do INSS afeta decisões de dinheiro e de saúde de quem
          lê. Por isso deixamos explícito como ele é produzido, e o que escolhemos não
          afirmar.
        </p>

        <Bloco icon={BookOpen} titulo="Quem escreve">
          <p>
            O conteúdo é produzido por{" "}
            <strong className="text-ink-900">{AUTORIA.autor}</strong>
            {temCredencial && `, OAB ${AUTORIA.oab}`}, {AUTORIA.descricaoAutor}. Nenhum
            texto é publicado sem revisão jurídica.
          </p>
          <p className="mt-3">
            A última revisão do acervo foi em{" "}
            <strong className="text-ink-900">{formatDateBR(revisadoEmData())}</strong>. A
            data de revisão aparece em cada guia.
          </p>
        </Bloco>

        <Bloco icon={ShieldCheck} titulo="Quais fontes usamos">
          <p>
            Citamos apenas legislação e órgãos públicos. Não usamos blogs, sites de
            terceiros ou conteúdo de outras plataformas como fonte.
          </p>
          <ul className="mt-4 space-y-2">
            {Object.values(FONTES).map((f) => (
              <li key={f.url}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-500"
                >
                  {f.titulo}
                </a>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco icon={AlertTriangle} titulo="O que não afirmamos">
          <p>
            Não prometemos resultado, não estimamos chance de êxito e não damos
            probabilidade de ganho. Nenhum profissional pode assegurar o resultado de um
            processo administrativo ou judicial, e criar essa expectativa seria enganoso.
          </p>
          <p className="mt-3">
            As estimativas das calculadoras são condicionais e apresentadas como tal: elas
            mostram o que aconteceria <em>se</em> determinada hipótese se confirmasse, não
            o que vai acontecer.
          </p>
          <p className="mt-3">
            Também não somos o INSS. A Recurso Fácil é uma empresa privada e independente,
            sem qualquer vínculo com o INSS ou com o Governo Federal.
          </p>
        </Bloco>

        <Bloco icon={RefreshCw} titulo="Correções">
          <p>
            Legislação previdenciária muda, e entendimentos administrativos também. Se
            você identificar informação desatualizada ou incorreta em qualquer página,
            escreva para{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-700 underline">
              {SUPPORT_EMAIL}
            </a>
            . Corrigimos e registramos a data da alteração.
          </p>
        </Bloco>

        <p className="mt-12 rounded-2xl bg-ink-50 p-6 text-sm leading-relaxed text-ink-600">
          Todo o conteúdo tem caráter informativo e não substitui orientação jurídica
          individualizada sobre o seu caso. Para conhecer nosso serviço, veja{" "}
          <Link href="/#como-funciona" className="font-medium text-brand-700 underline">
            como funciona
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}

function Bloco({
  icon: Icon,
  titulo,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-ink-950">
        <Icon className="h-5 w-5 text-brand-600" />
        {titulo}
      </h2>
      <div className="mt-4 leading-relaxed text-ink-700">{children}</div>
    </section>
  );
}
