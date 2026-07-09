"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { formatDateBR } from "@/lib/utils";
import type { AppealStatus } from "@/lib/types";

export function AppealDetailClient({
  id,
  status,
  generatedText,
  dueAt,
}: {
  id: string;
  status: AppealStatus;
  generatedText: string | null;
  dueAt: Date | null;
}) {
  const router = useRouter();
  const [regenerating, setRegenerating] = useState(false);

  // Auto-refresh só enquanto uma geração (manual ou por IA) está em andamento —
  // "PAID" agora é uma espera de horas/dias, não faz sentido pollar a cada poucos segundos.
  useEffect(() => {
    if (status === "GENERATING") {
      const t = setInterval(() => router.refresh(), 4000);
      return () => clearInterval(t);
    }
    if (status === "PAID") {
      const t = setInterval(() => router.refresh(), 60_000);
      return () => clearInterval(t);
    }
  }, [status, router]);

  if (status === "PAID") {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
        <Loader2 className="h-5 w-5 flex-none animate-spin" />
        <div>
          <p className="font-semibold">Seu recurso está sendo preparado</p>
          <p className="text-brand-700/80">
            {dueAt
              ? `Previsão de entrega: até ${formatDateBR(dueAt)}. Você recebe um e-mail assim que estiver pronto.`
              : "Você recebe um e-mail assim que estiver pronto."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "GENERATING") {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="font-semibold">Gerando seu recurso… esta página atualiza automaticamente.</p>
      </div>
    );
  }

  if (status === "AWAITING_PAYMENT") {
    return (
      <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        Pagamento ainda não confirmado. Conclua o checkout para iniciar a preparação do recurso.
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

  if (status === "READY") {
    if (generatedText) {
      return (
        <div className="mt-4 max-h-[520px] overflow-y-auto rounded-xl border border-ink-100 bg-white p-6 font-serif leading-relaxed text-ink-900">
          <pre className="whitespace-pre-wrap font-serif text-[15px]">{generatedText}</pre>
        </div>
      );
    }
    return (
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-success-50 p-4 text-sm text-success-700">
        <CheckCircle2 className="h-5 w-5 flex-none" />
        <p>Seu recurso está pronto — baixe em PDF ou Word ao lado.</p>
      </div>
    );
  }

  return <div className="mt-4 text-sm text-ink-500">Sem conteúdo disponível.</div>;
}
