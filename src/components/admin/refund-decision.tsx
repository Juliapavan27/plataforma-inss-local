"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea, Label, FieldError } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function AdminRefundDecision({
  appealId,
  reason,
}: {
  appealId: string;
  reason: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(action: "approve" | "reject") {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/recursos/${appealId}/reembolso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note || undefined }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Falha ao decidir");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl bg-ink-50 p-3 text-sm">
        <p className="text-xs font-semibold uppercase text-ink-500">Motivo do cliente</p>
        <p className="mt-1 whitespace-pre-wrap text-ink-800">{reason}</p>
      </div>
      <div>
        <Label>Observação para o cliente (opcional)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Aparece no e-mail enviado ao cliente"
          className="min-h-[70px]"
        />
      </div>
      <FieldError>{error}</FieldError>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => decide("approve")}
          className="btn-primary flex-1"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aprovar reembolso"}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => decide("reject")}
          className="btn-secondary"
        >
          Recusar
        </button>
      </div>
      <p className="text-xs text-ink-500">
        Aprovar registra a decisão, cancela o pedido e avisa o cliente — mas o estorno do
        dinheiro precisa ser feito por você no painel da InfinitePay/Stripe.
      </p>
    </div>
  );
}
