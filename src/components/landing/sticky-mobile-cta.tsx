import { ArrowRight } from "lucide-react";
import { WHATSAPP_HREF } from "@/lib/whatsapp";

/**
 * Barra fixa no rodapé do celular — nas páginas de benefício, onde os anúncios caem.
 *
 * WhatsApp-first: o público de tráfego pago é informacional e decide no impulso;
 * o canal que converte é o humano. A barra mantém o WhatsApp sempre à vista
 * enquanto a pessoa rola. `md:hidden` — só no celular. A home tem a própria versão.
 */
export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/70 bg-white/95 p-3 shadow-lift backdrop-blur md:hidden">
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
