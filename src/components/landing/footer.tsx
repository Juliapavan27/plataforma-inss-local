import Link from "next/link";
import { Scale, ShieldCheck, Lock, Clock, Mail } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_SLA_HOURS } from "@/lib/support";

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden bg-ink-950 text-ink-200">
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(212,164,61,0.4) 50%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-700/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="container relative grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl ring-1 ring-white/10">
              <span className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-800" />
              <Scale className="relative h-5 w-5 text-white" />
            </span>
            <div className="leading-none">
              <p className="font-display text-lg font-semibold tracking-tight text-white">
                Recurso Fácil
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
                Recursos jurídicos previdenciários
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-400">
            Tecnologia jurídica para recursos administrativos previdenciários.
            Democratizando o acesso à defesa técnica, com base em legislação,
            jurisprudência e modelos validados.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-ink-200">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-400" /> LGPD e privacidade
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-ink-200">
              <Lock className="h-3.5 w-3.5 text-gold-400" /> Pagamento seguro e transparente
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success-500/25 bg-success-500/10 px-3 py-1.5 text-[11px] font-medium text-success-500">
              <Clock className="h-3.5 w-3.5" /> Dúvidas por e-mail em até {SUPPORT_SLA_HOURS}h úteis
            </span>
          </div>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-5 inline-flex items-center gap-2 text-sm text-ink-300 transition hover:text-white"
          >
            <Mail className="h-4 w-4" />
            {SUPPORT_EMAIL}
          </a>
        </div>

        <div className="md:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
              Produto
            </p>
            <ul className="space-y-3 text-sm">
              <li><Link href="/novo-recurso" className="text-ink-200 hover:text-white">Gerar recurso</Link></li>
              <li><Link href="/dashboard" className="text-ink-200 hover:text-white">Minha área</Link></li>
              <li><Link href="/#comparativo" className="text-ink-200 hover:text-white">Comparativo</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
              Conteúdo
            </p>
            <ul className="space-y-3 text-sm">
              <li><Link href="/quem-somos" className="text-ink-200 hover:text-white">Quem somos</Link></li>
              <li><Link href="/calculadora" className="text-ink-200 hover:text-white">Calculadora</Link></li>
              <li><Link href="/guias" className="text-ink-200 hover:text-white">Guias</Link></li>
              <li><Link href="/tutorial" className="text-ink-200 hover:text-white">Tutorial</Link></li>
              <li><Link href="/faq" className="text-ink-200 hover:text-white">FAQ</Link></li>
              <li><Link href="/contato" className="text-ink-200 hover:text-white">Contato</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
              Legal
            </p>
            <ul className="space-y-3 text-sm">
              <li><Link href="/termos" className="text-ink-200 hover:text-white">Termos de uso</Link></li>
              <li><Link href="/privacidade" className="text-ink-200 hover:text-white">Privacidade</Link></li>
              <li><Link href="/lgpd" className="text-ink-200 hover:text-white">LGPD</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container flex flex-col items-start justify-between gap-3 py-6 text-xs text-ink-400 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Recurso Fácil. Todos os direitos reservados.</p>
          <p className="max-w-2xl text-right text-ink-500">
            Não temos qualquer vínculo com o INSS ou o Governo Federal — somos uma plataforma
            privada e independente. Este serviço não substitui consultoria jurídica
            personalizada. O material gerado deve ser revisado pelo usuário antes do protocolo e
            não representa promessa de deferimento pelo INSS.
          </p>
        </div>
      </div>
    </footer>
  );
}
