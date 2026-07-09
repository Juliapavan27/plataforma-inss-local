import Link from "next/link";
import {
  ClipboardList,
  CreditCard,
  Clock,
  FileCheck2,
  Send,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Tutorial — Como gerar seu recurso passo a passo",
  description:
    "Veja o passo a passo completo para gerar seu recurso administrativo contra o INSS: formulário, pagamento, prazos de entrega e protocolo.",
};

const steps = [
  {
    icon: ClipboardList,
    title: "1. Preencha o formulário guiado",
    text: "Em /novo-recurso você responde 4 etapas simples: seus dados, o benefício e motivo da negativa, um resumo do seu caso e a revisão final. Leva menos de 5 minutos.",
  },
  {
    icon: CreditCard,
    title: "2. Escolha o prazo e pague",
    text: "Na revisão final, escolha entre receber em até 24h (abrindo mão do prazo de arrependimento de 7 dias do art. 49 do CDC) ou em até 8 dias (mantendo esse prazo). O pagamento é único, por cartão ou Pix.",
  },
  {
    icon: Clock,
    title: "3. Acompanhe na área do cliente",
    text: "Assim que o pagamento é confirmado, seu pedido entra em preparação. Você pode acompanhar o status em /dashboard e recebe um e-mail assim que o recurso ficar pronto.",
  },
  {
    icon: FileCheck2,
    title: "4. Baixe e revise",
    text: "Seu recurso chega em PDF e Word. Revise o conteúdo com calma — você pode editar o Word antes de protocolar.",
  },
  {
    icon: Send,
    title: "5. Protocole no Meu INSS",
    text: "Envie o recurso pelo aplicativo ou site do Meu INSS, na opção de recorrer do pedido negado. Fique atento: o prazo legal é de 30 dias corridos a partir da ciência da decisão do INSS.",
  },
];

export default function TutorialPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16">
        <div className="text-center">
          <span className="chip-brand">Tutorial</span>
          <h1 className="mt-4 font-display text-4xl font-bold text-ink-950">
            Como gerar seu recurso, passo a passo
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-600">
            Do formulário ao protocolo no Meu INSS — veja exatamente o que esperar em
            cada etapa.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {steps.map((s) => (
            <div key={s.title} className="card flex items-start gap-4">
              <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-ink-950">
                  {s.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <strong>Atenção ao prazo:</strong> você tem 30 dias corridos a partir da
          ciência da decisão do INSS para apresentar o recurso administrativo. Comece
          o quanto antes.
        </div>

        <div className="mt-10 text-center">
          <Link href="/novo-recurso" className="btn-primary px-7 py-4 text-base">
            Quero gerar meu recurso agora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
