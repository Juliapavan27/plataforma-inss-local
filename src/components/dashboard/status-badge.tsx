import type { AppealStatus } from "@/lib/types";

const labels: Record<AppealStatus, { label: string; cls: string }> = {
  DRAFT: { label: "Rascunho", cls: "bg-ink-100 text-ink-700" },
  AWAITING_PAYMENT: { label: "Aguardando pagamento", cls: "bg-amber-100 text-amber-800" },
  PAID: { label: "Pago", cls: "bg-brand-100 text-brand-800" },
  GENERATING: { label: "Gerando…", cls: "bg-blue-100 text-blue-800 animate-pulse" },
  READY: { label: "Pronto", cls: "bg-emerald-100 text-emerald-800" },
  FAILED: { label: "Falhou", cls: "bg-red-100 text-red-800" },
  CANCELED: { label: "Cancelado", cls: "bg-ink-200 text-ink-700" },
};

export function StatusBadge({ status }: { status: AppealStatus }) {
  const { label, cls } = labels[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
