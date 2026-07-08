"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Label } from "@/components/ui/input";
import { formatCurrencyBRL } from "@/lib/utils";
import {
  beneficioSimuladoTipos,
  beneficioSimuladoLabels,
  calcularBeneficio,
  type BeneficioSimuladoTipo,
  type BeneficioResult,
} from "@/lib/inss-calculator";
import { ArrowRight } from "lucide-react";

export function BeneficioForm() {
  const [tipo, setTipo] = useState<BeneficioSimuladoTipo>("AUXILIO_DOENCA");
  const [mediaSalarial, setMediaSalarial] = useState("");
  const [dependentes, setDependentes] = useState("1");
  const [resultado, setResultado] = useState<BeneficioResult | null>(null);

  const isBPC = tipo === "BPC_LOAS";
  const isPensao = tipo === "PENSAO_MORTE";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mediaSalarialCents = isBPC ? 0 : Math.round(Number(mediaSalarial.replace(",", ".")) * 100);
    if (!isBPC && !mediaSalarialCents) return;

    setResultado(
      calcularBeneficio({
        tipo,
        mediaSalarialCents,
        dependentes: isPensao ? Number(dependentes) : undefined,
      }),
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <Label>Tipo de benefício</Label>
          <select
            className="input"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as BeneficioSimuladoTipo);
              setResultado(null);
            }}
          >
            {beneficioSimuladoTipos.map((t) => (
              <option key={t} value={t}>
                {beneficioSimuladoLabels[t]}
              </option>
            ))}
          </select>
        </div>

        {!isBPC && (
          <div>
            <Label>Média salarial mensal (R$)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={mediaSalarial}
              onChange={(e) => setMediaSalarial(e.target.value)}
              placeholder="2500,00"
              required
            />
          </div>
        )}

        {isPensao && (
          <div>
            <Label>Número de dependentes</Label>
            <select className="input" value={dependentes} onChange={(e) => setDependentes(e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                  {n === 5 ? " ou mais" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {isBPC && (
          <p className="rounded-lg bg-ink-50 px-3 py-2.5 text-xs text-ink-600">
            O BPC/LOAS é assistencial (não depende de contribuição): o valor é sempre 1 salário
            mínimo, para quem cumpre os critérios de idade/deficiência e renda familiar per capita.
          </p>
        )}

        <button type="submit" className="btn-primary w-full">
          Calcular estimativa
        </button>
      </form>

      <div className="card bg-brand-50/60">
        {!resultado ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center text-sm text-ink-500">
            Preencha o formulário para ver a estimativa do benefício.
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                Valor estimado do benefício
              </p>
              <p className="mt-1 font-display text-4xl font-bold text-ink-950">
                {formatCurrencyBRL(resultado.valorEstimadoCents)}
              </p>
              {!isBPC && (
                <p className="mt-1 text-xs text-ink-500">
                  Coeficiente aplicado: {Math.round(resultado.coeficiente * 100)}% da média salarial
                </p>
              )}
            </div>
            <p className="text-xs text-ink-500">
              Estimativa simplificada — o valor real depende de detalhes do caso concreto
              (histórico de contribuições, natureza da incapacidade, perícia, entre outros).
              Não substitui a análise oficial do INSS.
            </p>
            <Link href="/novo-recurso" className="btn-secondary w-full">
              Meu benefício foi negado <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
