import Link from "next/link";
import { Mail, Clock, MessageCircle, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { SUPPORT_EMAIL, SUPPORT_SLA_HOURS } from "@/lib/support";

export const metadata = {
  title: "Contato e suporte",
  description:
    "Fale com a equipe do Recurso Fácil. Respondemos todas as dúvidas por e-mail em até 24 horas úteis.",
};

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;

export default function ContatoPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16">
        <div className="text-center">
          <span className="chip-brand">
            <MessageCircle className="h-3.5 w-3.5" /> Suporte
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-balance text-ink-950">
            Precisa falar com a gente?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-600 text-pretty">
            Tem uma dúvida que o site não respondeu, um problema com seu pedido ou quer
            entender melhor seu caso? Estamos aqui.
          </p>
        </div>

        {/* Selo de garantia de resposta */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-success-100 bg-success-50 px-5 py-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-success-600 ring-1 ring-success-100">
              <Clock className="h-4 w-4" />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-success-700">
                Resposta em até {SUPPORT_SLA_HOURS} horas úteis
              </p>
              <p className="text-xs text-ink-600">
                É o nosso compromisso com quem escreve pra gente.
              </p>
            </div>
          </div>
        </div>

        {/* Canais */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="group card-lift flex flex-col"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink-950">
              E-mail
            </h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-600">
              O canal principal. Escreva com calma, conte seu caso e anexe o que achar
              relevante.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
              {SUPPORT_EMAIL}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group card-lift flex flex-col"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-success-50 text-success-600 ring-1 ring-success-100">
                <MessageCircle className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink-950">
                WhatsApp
              </h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-600">
                Para dúvidas rápidas durante o horário comercial.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-success-700">
                Abrir conversa
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ) : (
            <Link href="/guias" className="group card-lift flex flex-col">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-50 text-gold-800 ring-1 ring-gold-200/70">
                <BookOpen className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink-950">
                Guias
              </h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-600">
                Boa parte das dúvidas já está respondida ali, em linguagem simples.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                Ver guias
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          )}
        </div>

        {/* Antes de escrever */}
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-ink-950">
            Talvez a resposta já esteja aqui
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link href="/faq" className="rounded-xl border border-ink-200/70 bg-white p-4 text-sm transition hover:-translate-y-0.5 hover:shadow-ring">
              <p className="font-semibold text-ink-900">Perguntas frequentes</p>
              <p className="mt-1 text-ink-600">Preço, prazos, garantia e reembolso.</p>
            </Link>
            <Link href="/guias" className="rounded-xl border border-ink-200/70 bg-white p-4 text-sm transition hover:-translate-y-0.5 hover:shadow-ring">
              <p className="font-semibold text-ink-900">Guias sobre o INSS</p>
              <p className="mt-1 text-ink-600">Perícia, BPC, carência, documentos.</p>
            </Link>
            <Link href="/tutorial" className="rounded-xl border border-ink-200/70 bg-white p-4 text-sm transition hover:-translate-y-0.5 hover:shadow-ring">
              <p className="font-semibold text-ink-900">Como funciona</p>
              <p className="mt-1 text-ink-600">Passo a passo do pedido ao protocolo.</p>
            </Link>
          </div>
        </section>

        {/* O que informar */}
        <section className="mt-12 rounded-2xl border border-ink-200/70 bg-white/80 p-6">
          <h2 className="font-display text-lg font-semibold text-ink-950">
            Para agilizar seu atendimento
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            Se sua mensagem for sobre um pedido já feito, incluir estas informações ajuda:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink-700">
            {[
              "O e-mail que você usou na compra",
              "O tipo de benefício do seu pedido",
              "O que aconteceu, com o máximo de detalhe que conseguir",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex items-start gap-3 rounded-xl bg-ink-50 p-4 text-sm text-ink-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-ink-400" />
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
