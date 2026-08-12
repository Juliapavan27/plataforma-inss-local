import Link from "next/link";
import { Scale, ShieldCheck, Lock, Clock, Mail } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_SLA_HOURS } from "@/lib/support";
import { WHATSAPP_HREF, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-ink-200">
              <Clock className="h-3.5 w-3.5 text-gold-400" /> Dúvidas por e-mail em até {SUPPORT_SLA_HOURS}h úteis
            </span>
          </div>

          {/* Canal principal: WhatsApp, com resposta humana e rápida. */}
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-3 transition hover:bg-[#25D366]/15"
          >
            <span
              className="grid h-10 w-10 flex-none place-items-center rounded-full text-white"
              style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
            >
              <WhatsAppGlyph className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-white">
                Fale no WhatsApp — resposta humana e rápida
              </span>
              <span className="block text-sm text-ink-300">{WHATSAPP_DISPLAY}</span>
            </span>
          </a>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-4 inline-flex items-center gap-2 text-sm text-ink-400 transition hover:text-white"
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
              <li><Link href="/politica-editorial" className="text-ink-200 hover:text-white">Política editorial</Link></li>
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

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.447h.005c6.585 0 11.946-5.335 11.949-11.893a11.821 11.821 0 00-3.479-8.413z" />
    </svg>
  );
}
