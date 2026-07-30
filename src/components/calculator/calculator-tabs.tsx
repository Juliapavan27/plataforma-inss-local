"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AposentadoriaForm } from "./aposentadoria-form";
import { BeneficioForm } from "./beneficio-form";
import { PrazoForm } from "./prazo-form";
import { AtrasadosForm } from "./atrasados-form";

type Tab = "prazo" | "beneficio" | "atrasados" | "aposentadoria";

const ABAS: { id: Tab; label: string }[] = [
  // O prazo vem primeiro: é a pergunta mais urgente de quem acabou de ser
  // negado, e a única cuja resposta é objetiva.
  { id: "prazo", label: "Prazo do recurso" },
  { id: "beneficio", label: "Benefício negado" },
  { id: "atrasados", label: "Atrasados" },
  { id: "aposentadoria", label: "Aposentadoria" },
];

export function CalculatorTabs() {
  const [tab, setTab] = useState<Tab>("prazo");

  return (
    <div>
      <div className="mx-auto flex max-w-2xl flex-wrap gap-1 rounded-2xl border border-ink-200 bg-white p-1 shadow-ring sm:rounded-full">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setTab(a.id)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition",
              tab === a.id
                ? "bg-brand-600 text-white shadow-soft"
                : "text-ink-600 hover:text-ink-900",
            )}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "prazo" && <PrazoForm />}
        {tab === "beneficio" && <BeneficioForm />}
        {tab === "atrasados" && <AtrasadosForm />}
        {tab === "aposentadoria" && <AposentadoriaForm />}
      </div>
    </div>
  );
}
