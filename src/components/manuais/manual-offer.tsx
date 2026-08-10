import Link from "next/link";
import { ArrowRight, FileText, Check } from "lucide-react";
import type { Manual } from "@/content/manuais";
import { formatCurrencyBRL } from "@/lib/utils";

/**
 * Oferta do manual embaixo do conteúdo da página de benefício.
 *
 * Atende quem tem intenção de DÚVIDA ("como recorrer"), não de compra do
 * serviço: em vez de bater na venda de R$ 299, leva o manual barato. É a porta
 * de entrada da esteira — e ela mesma empurra para o serviço lá dentro.
 */
export function ManualOffer({ manual }: { manual: Manual }) {
  return (
    <aside className="mt-14 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white">
      <div className="p-7 md:p-8">
        <span className="chip-brand bg-white text-brand-700 ring-brand-200">
          <FileText className="h-3.5 w-3.5" /> Prefere fazer você mesmo?
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-balance text-ink-950">
          {manual.titulo}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{manual.resumo}</p>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {manual.promessa.slice(0, 4).map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-ink-700">
              <Check className="mt-0.5 h-4 w-4 flex-none text-success-600" />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link href={`/manuais/${manual.slug}`} className="btn-primary px-6 py-3">
            Ver o manual por {formatCurrencyBRL(manual.precoCents)}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-ink-500">PDF · entrega imediata</span>
        </div>
      </div>
    </aside>
  );
}
