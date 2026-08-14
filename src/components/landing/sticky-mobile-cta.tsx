import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WHATSAPP_HREF } from "@/lib/whatsapp";
import { formatCurrencyBRL } from "@/lib/utils";
import type { Manual } from "@/content/manuais";

/**
 * Barra fixa no rodapé do celular (páginas de benefício).
 *
 * Âncora clara para quem chega perdido no meio do conteúdo: a oferta do manual
 * (barata e concreta) fica fixa o tempo todo. O WhatsApp segue acessível pelo
 * botão flutuante. Onde não há manual para o benefício, cai no WhatsApp.
 */
export function StickyMobileCTA({ manual }: { manual?: Manual }) {
  const barra =
    "fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/70 bg-white/95 p-3 shadow-lift backdrop-blur md:hidden";

  if (manual) {
    return (
      <div className={barra}>
        <Link href={`/manuais/${manual.slug}`} className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700">
              Manual completo em PDF
            </p>
            <p className="text-sm font-bold text-ink-950">
              Adquira por apenas {formatCurrencyBRL(manual.precoCents)}
            </p>
          </div>
          <span className="btn-primary px-5 py-3 text-sm">
            Adquirir <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className={barra}>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-red-600">
            Prazo: 30 dias para recorrer
          </p>
          <p className="text-sm font-bold text-ink-950">Fale agora — é grátis</p>
        </div>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold text-white"
          style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
        >
          WhatsApp <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
