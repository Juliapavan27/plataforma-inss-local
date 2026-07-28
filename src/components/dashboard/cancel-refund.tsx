"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea, FieldError } from "@/components/ui/input";
import { Loader2, XCircle } from "lucide-react";
import { formatDateBR } from "@/lib/utils";
import type { RefundEligibility } from "@/lib/refund-policy";

export function CancelRefundPanel({
  appealId,
  eligibility,
  refundStatus,
}: {
  appealId: string;
  eligibility: RefundEligibility;
  refundStatus: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (refundStatus === "REQUESTED") {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Solicitação de reembolso em análise</p>
        <p className="mt-1">
          Recebemos seu pedido e vamos responder por e-mail em breve.
        </p>
      </div>
    );
  }

  if (refundStatus === "APPROVED") {
    return (
      <div className="rounded-xl bg-success-50 p-4 text-sm text-success-700">
        <p className="font-semibold">Reembolso aprovado</p>
        <p className="mt-1">
          O estorno foi processado pelo meio de pagamento usado na compra.
        </p>
      </div>
    );
  }

  if (refundStatus === "REJECTED") {
    return (
      <div className="rounded-xl bg-ink-50 p-4 text-sm text-ink-700">
        <p className="font-semibold">Solicitação de reembolso não aprovada</p>
        <p className="mt-1">
          Enviamos os detalhes por e-mail. Se quiser conversar sobre o caso, fale com a gente.
        </p>
      </div>
    );
  }

  async function submit(endpoint: "cancelar" | "reembolso") {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/recursos/${appealId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: endpoint === "reembolso" ? JSON.stringify({ reason }) : undefined,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Não foi possível concluir");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  const canAct = eligibility.canCancel || eligibility.canRequestRefund;

  return (
    <div className="text-sm">
      <p className="text-ink-600">{eligibility.message}</p>
      {eligibility.deadline && eligibility.canRequestRefund && (
        <p className="mt-1 text-xs text-ink-500">
          Prazo da garantia: até {formatDateBR(eligibility.deadline)}.
        </p>
      )}

      {canAct && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-800"
        >
          <XCircle className="h-4 w-4" />
          {eligibility.canCancel ? "Cancelar pedido" : "Cancelar e solicitar reembolso"}
        </button>
      )}

      {open && (
        <div className="mt-4 space-y-3 rounded-xl border border-ink-200 bg-white p-4">
          {eligibility.canRequestRefund ? (
            <>
              <p className="font-semibold text-ink-900">Solicitar reembolso</p>
              <p className="text-ink-600">
                Conte brevemente o motivo — isso nos ajuda a melhorar o serviço.
              </p>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: mudei de ideia, resolvi meu caso de outra forma…"
                className="min-h-[90px]"
              />
            </>
          ) : (
            <>
              <p className="font-semibold text-ink-900">Cancelar pedido</p>
              <p className="text-ink-600">
                Como o pagamento não foi confirmado, o cancelamento é imediato e sem custo.
              </p>
            </>
          )}
          <FieldError>{error}</FieldError>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={submitting || (eligibility.canRequestRefund && reason.trim().length < 5)}
              onClick={() => submit(eligibility.canCancel ? "cancelar" : "reembolso")}
              className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="btn-secondary"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
