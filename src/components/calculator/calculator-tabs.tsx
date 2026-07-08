"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AposentadoriaForm } from "./aposentadoria-form";
import { BeneficioForm } from "./beneficio-form";

type Tab = "aposentadoria" | "beneficio";

export function CalculatorTabs() {
  const [tab, setTab] = useState<Tab>("aposentadoria");

  return (
    <div>
      <div className="mx-auto flex max-w-md gap-1 rounded-full border border-ink-200 bg-white p-1 shadow-ring">
        <button
          type="button"
          onClick={() => setTab("aposentadoria")}
          className={cn(
            "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            tab === "aposentadoria" ? "bg-brand-600 text-white shadow-soft" : "text-ink-600 hover:text-ink-900",
          )}
        >
          Aposentadoria
        </button>
        <button
          type="button"
          onClick={() => setTab("beneficio")}
          className={cn(
            "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            tab === "beneficio" ? "bg-brand-600 text-white shadow-soft" : "text-ink-600 hover:text-ink-900",
          )}
        >
          Benefício negado
        </button>
      </div>

      <div className="mt-8">
        {tab === "aposentadoria" ? <AposentadoriaForm /> : <BeneficioForm />}
      </div>
    </div>
  );
}
