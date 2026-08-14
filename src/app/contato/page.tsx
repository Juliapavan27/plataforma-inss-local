import Link from "next/link";
import { Mail, Clock, MessageCircle, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { SUPPORT_EMAIL, SUPPORT_SLA_HOURS } from "@/lib/support";

export const metadata = {
  title: "Contato e suporte",
  description:
    "Fale com a equipe do Recurso Fácil por e-mail. Respondemos dúvidas em até 48 horas úteis.",
};

export default function ContatoPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16 text-white">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-200 ring-1 ring-white/15">
            <MessageCircle className="h-3.5 w-3.5" /> Suporte
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-balance text-white">
            Precisa falar com a gente?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60 text-pretty">
            Tem uma dúvida que o site não respondeu, um problema com seu pedido ou quer
            entender melhor seu caso? Estamos aqui.
          </p>
        </div>

        {/* Selo de garantia de resposta */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex max-w-lg items-center gap-3 rounded-2xl border border-success-400/30 bg-success-500/10 px-5 py-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-success-500/15 text-success-300 ring-1 ring-success-400/30">
              <Clock className="h-4 w-4" />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-success-200">
                Dúvidas por e-mail: resposta em até {SUPPORT_SLA_HOURS} horas úteis
              </p>
              <p className="text-xs text-white/60">
                Este prazo é do nosso atendimento. A entrega do recurso segue o prazo que
                você escolheu na compra (24 horas ou 8 dias).
              </p>
            </div>
          </div>
        </div>

        {/* Canais */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/[0.08]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/30">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-white">
              E-mail
            </h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-white/60">
              O canal principal. Escreva com calma, conte seu caso e anexe o que achar
              relevante.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-300">
              {SUPPORT_EMAIL}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

          <Link href="/guias" className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/[0.08]">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-500/15 text-gold-300 ring-1 ring-gold-400/30">
              <BookOpen className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-white">
              Guias
            </h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-white/60">
              Boa parte das dúvidas já está respondida ali, em linguagem simples — e a
              resposta é imediata.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-300">
              Ver guias
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        {/* Antes de escrever */}
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-white">
            Talvez a resposta já esteja aqui
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link href="/faq" className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
              <p className="font-semibold text-white">Perguntas frequentes</p>
              <p className="mt-1 text-white/60">Preço, prazos, garantia e reembolso.</p>
            </Link>
            <Link href="/guias" className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
              <p className="font-semibold text-white">Guias sobre o INSS</p>
              <p className="mt-1 text-white/60">Perícia, BPC, carência, documentos.</p>
            </Link>
            <Link href="/tutorial" className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
              <p className="font-semibold text-white">Como funciona</p>
              <p className="mt-1 text-white/60">Passo a passo do pedido ao protocolo.</p>
            </Link>
          </div>
        </section>

        {/* O que informar */}
        <section className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            Para agilizar seu atendimento
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Se sua mensagem for sobre um pedido já feito, incluir estas informações ajuda:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {[
              "O e-mail que você usou na compra",
              "O tipo de benefício do seu pedido",
              "O que aconteceu, com o máximo de detalhe que conseguir",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-400" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-white/40" />
          <p>
            Nunca pedimos senha, dados de cartão ou códigos por e-mail. Se receber uma
            mensagem assim em nosso nome, desconfie e fale com a gente por este canal.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
