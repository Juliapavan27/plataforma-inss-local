import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import type { Manual } from "@/content/manuais";
import { formatCurrencyBRL } from "@/lib/utils";

/**
 * Oferta do manual FIXA na lateral direita (desktop), visível durante todo o
 * scroll — para o comprador não precisar descer a página inteira até achar a
 * compra. Escura de propósito: ecoa o hero de impacto e reforça a sensação de
 * "um ambiente só". No mobile não cabe uma lateral fixa, então a oferta aparece
 * cedo no conteúdo (ver a página de benefício).
 */
export function ManualFloatingOffer({ manual }: { manual: Manual }) {
  return (
    <aside className="fixed right-5 top-1/2 z-30 hidden w-64 -translate-y-1/2 xl:block">
      <div className="rounded-2xl border border-white/10 bg-ink-950 p-5 text-white shadow-lift">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-300">
          <FileText className="h-3.5 w-3.5" /> Fazer você mesmo
        </span>
        <p className="mt-3 font-display text-lg font-bold leading-tight">
          Manual completo em PDF
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/70">
          O passo a passo, a base legal e o modelo — pra você montar o seu recurso.
        </p>
        <p className="mt-3 flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-black">
            {formatCurrencyBRL(manual.precoCents)}
          </span>
          <span className="text-xs text-white/50">pagamento único</span>
        </p>
        <Link
          href={`/manuais/${manual.slug}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lift transition hover:-translate-y-0.5"
          style={{ backgroundImage: "linear-gradient(135deg, #3a53ea 0%, #2232bd 100%)" }}
        >
          Ver o manual <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
