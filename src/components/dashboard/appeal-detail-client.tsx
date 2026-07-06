"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import type { AppealStatus } from "@/lib/types";

export function AppealDetailClient({
  id,
  status,
  generatedText,
}: {
  id: string;
  status: AppealStatus;
  generatedText: string | null;
}) {
  const router = useRouter();
  const [regenerating, setRegenerating] = useState(false);

  // Auto-refresh quando status "em andamento".
  useEffect(() => {
    if (status === "GENERATING" || status === "PAID") {
      const t = setInterval(() => router.refresh(), 4000);
      return () => clearInterval(t);
    }
  }, [status, router]);

  if (status === "GENERATING" || status === "PAID") {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
        <Loader2 className="h-5 w-5 animate-spin" />
        <div>
          <p className="font-semibold">Gerando seu recurso…</p>
          <p className="text-brand-700/80">
            Isso leva em torno de 3 minutos. Esta página atualiza automaticamente.
          </p>
        </div>
      </div>
    );
  }

  if (status === "AWAITING_PAYMENT") {
    return (
      <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        Pagamento ainda não confirmado. Conclua o checkout para iniciar a geração.
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="mt-4 space-y-3">
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
          Ocorreu um erro na geração. Você pode tentar novamente.
        </div>
        <button
          disabled={regenerating}
          onClick={async () => {
            setRegenerating(true);
            await fetch(`/api/recursos/${id}/gerar`, { method: "POST" });
            router.refresh();
            setRegenerating(false);
          }}
          className="btn-secondary"
        >
          <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (status === "READY" && generatedText) {
    return (
      <div className="mt-4 max-h-[520px] overflow-y-auto rounded-xl border border-ink-100 bg-white p-6 font-serif leading-relaxed text-ink-900">
        <pre className="whitespace-pre-wrap font-serif text-[15px]">{generatedText}</pre>
      </div>
    );
  }

  return <div className="mt-4 text-sm text-ink-500">Sem conteúdo disponível.</div>;
}
