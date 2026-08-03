import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { isAIDisponivel } from "@/lib/ai/provider";
import { Footer } from "@/components/landing/footer";
import { AnalisadorForm } from "@/components/analisador/analisador-form";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { Lock, Zap, FileSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analisador de carta de indeferimento do INSS — gratuito",
  description:
    "Envie a carta de indeferimento do INSS e entenda em linguagem simples por que o benefício foi negado, qual é o seu prazo e quais documentos costumam pesar. Gratuito, sem cadastro.",
  keywords: [
    "carta de indeferimento INSS",
    "entender indeferimento INSS",
    "por que o INSS negou meu benefício",
    "comunicação de decisão INSS",
    "motivo do indeferimento INSS",
  ],
  alternates: { canonical: "/analisar-indeferimento" },
};

export default function AnalisarIndeferimentoPage() {
  // Sem provedor de IA configurado a ferramenta não faz nada. Em vez de mostrar
  // uma tela que só sabe dizer "indisponível", manda para a pré-análise, que
  // resolve boa parte da mesma dúvida sem depender de modelo. Volta sozinha
  // quando a chave existir.
  if (!isAIDisponivel()) redirect("/posso-recorrer");

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { nome: "Início", path: "/" },
          { nome: "Analisar carta de indeferimento", path: "/analisar-indeferimento" },
        ])}
      />
      <Navbar />
      <main className="bg-gradient-to-b from-brand-50/40 to-white">
        <div className="container py-14 md:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="chip-brand">
              <FileSearch className="h-3.5 w-3.5" /> Ferramenta gratuita
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold text-balance text-ink-950">
              Entenda por que o INSS negou seu benefício
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-600 text-pretty">
              A carta de indeferimento é escrita em linguagem técnica e quase ninguém
              entende o que ela realmente diz. Envie a carta e receba a leitura dela em
              português claro.
            </p>
          </div>

          <div className="mx-auto mb-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            <Selo icon={Lock} texto="O arquivo não sai do seu navegador" />
            <Selo icon={Zap} texto="Resultado na hora, sem cadastro" />
            <Selo icon={FileSearch} texto="Nada é armazenado" />
          </div>

          <AnalisadorForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

function Selo({
  icon: Icon,
  texto,
}: {
  icon: React.ComponentType<{ className?: string }>;
  texto: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-center text-xs font-medium text-ink-700 ring-1 ring-ink-200/70">
      <Icon className="h-4 w-4 flex-none text-brand-600" />
      {texto}
    </div>
  );
}
