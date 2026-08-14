import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WHATSAPP_HREF } from "@/lib/whatsapp";
import { formatCurrencyBRL } from "@/lib/utils";
import type { Manual } from "@/content/manuais";

/** Glifo do WhatsApp (inline, para não depender de imagem externa). */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.3.7 4.5 1.9 6.4L4 29l7-1.8c1.8 1 3.9 1.5 6 1.5 6.6 0 12-5.3 12-11.9C29 8.3 22.6 3 16 3zm0 21.8c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-3.9 1 1-3.8-.3-.4a9.7 9.7 0 01-1.5-5.2c0-5.4 4.5-9.8 10-9.8s9.9 4.4 9.9 9.8c0 5.4-4.5 9.9-9.9 9.9zm5.5-7.4c-.3-.2-1.8-.9-2-1s-.5-.1-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.6-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.1 2.2.9 3 1 4.1.9.7-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
    </svg>
  );
}

/**
 * Barra fixa no rodapé do celular (páginas de benefício).
 *
 * Modelo híbrido: a oferta do manual (barata e concreta) é a âncora principal,
 * mas o WhatsApp — canal que de fato converte — fica sempre ao lado, num toque.
 * Onde não há manual para o benefício, a barra inteira vira WhatsApp.
 */
export function StickyMobileCTA({ manual }: { manual?: Manual }) {
  const barra =
    "fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 p-3 shadow-lift backdrop-blur md:hidden";

  const whatsappBtn = (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="grid h-12 w-12 flex-none place-items-center rounded-xl text-white"
      style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
    >
      <WhatsAppGlyph className="h-6 w-6" />
    </a>
  );

  if (manual) {
    return (
      <div className={barra}>
        <div className="flex items-center gap-2.5">
          <Link href={`/manuais/${manual.slug}`} className="flex flex-1 items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gold-300">
                Manual completo em PDF
              </p>
              <p className="truncate text-sm font-bold text-white">
                Adquira por apenas {formatCurrencyBRL(manual.precoCents)}
              </p>
            </div>
            <span className="inline-flex flex-none items-center gap-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white">
              Adquirir <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          {whatsappBtn}
        </div>
      </div>
    );
  }

  return (
    <div className={barra}>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-red-400">
            Prazo: 30 dias para recorrer
          </p>
          <p className="text-sm font-bold text-white">Fale agora, sem compromisso</p>
        </div>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold text-white"
          style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
        >
          <WhatsAppGlyph className="h-5 w-5" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
