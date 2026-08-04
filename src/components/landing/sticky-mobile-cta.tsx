import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils";
import { PRICE_PIX_CENTS } from "@/lib/pricing";

/**
 * Barra fixa de compra no rodapé do celular.
 *
 * Existe porque no mobile a "dobra" é curta e o botão de compra some assim que
 * a pessoa rola. Em tráfego pago isso é venda escapando: o anúncio traz a
 * pessoa, ela lê, mas quando decide agir o CTA já não está à vista. A barra
 * mantém o preço e o botão sempre visíveis. `md:hidden` — só no celular.
 *
 * A home tem a própria versão inline; esta é para as páginas de benefício, que
 * são onde os anúncios caem.
 */
export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/70 bg-white/95 p-3 pr-[4.75rem] shadow-lift backdrop-blur md:hidden">
      {/* pr extra reserva o canto para o balão do chat (fixo, bottom-right) não
          cobrir o botão de compra — a colisão vale para toda página com esta barra. */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
            Prazo: 30 dias
          </p>
          <p className="text-sm font-bold text-ink-950">
            {formatCurrencyBRL(PRICE_PIX_CENTS)}{" "}
            <span className="text-xs font-normal text-ink-500">no Pix</span>
          </p>
        </div>
        <Link href="/novo-recurso" className="btn-primary px-5 py-3 text-sm">
          Gerar recurso
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
