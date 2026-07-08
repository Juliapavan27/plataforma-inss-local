"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Label } from "@/components/ui/input";
import { formatCurrencyBRL } from "@/lib/utils";
import { calcularAposentadoria, type AposentadoriaResult, type Sexo } from "@/lib/inss-calculator";
import { ArrowRight } from "lucide-react";

export function AposentadoriaForm() {
  const [sexo, setSexo] = useState<Sexo>("F");
  const [idade, setIdade] = useState("");
  const [tempoContribuicao, setTempoContribuicao] = useState("");
  const [mediaSalarial, setMediaSalarial] = useState("");
  const [resultado, setResultado] = useState<AposentadoriaResult | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idadeAtual = Number(idade);
    const tempoContribuicaoAnos = Number(tempoContribuicao);
    const mediaSalarialCents = Math.round(Number(mediaSalarial.replace(",", ".")) * 100);
    if (!idadeAtual || !mediaSalarialCents) return;

    setResultado(
      calcularAposentadoria({
        sexo,
        idadeAtual,
        tempoContribuicaoAnos: tempoContribuicaoAnos || 0,
        mediaSalarialCents,
      }),
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <Label>Sexo</Label>
          <select className="input" value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)}>
            <option value="F">Feminino</option>
            <option value="M">Masculino</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Idade atual</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              placeholder="45"
              required
            />
          </div>
          <div>
            <Label>Tempo de contribuição (anos)</Label>
            <Input
              type="number"
              min={0}
              max={60}
              value={tempoContribuicao}
              onChange={(e) => setTempoContribuicao(e.target.value)}
              placeholder="18"
            />
          </div>
        </div>
        <div>
          <Label>Média salarial mensal (R$)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={mediaSalarial}
            onChange={(e) => setMediaSalarial(e.target.value)}
            placeholder="3000,00"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          Calcular estimativa
        </button>
      </form>

      <div className="card bg-brand-50/60">
        {!resultado ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center text-sm text-ink-500">
            Preencha o formulário para ver a estimativa da sua aposentadoria.
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
              <p className="mt-1 text-xs text-ink-500">
                Coeficiente aplicado: {Math.round(resultado.coeficiente * 100)}% da média salarial
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink-500">Idade mínima exigida</dt>
                <dd className="font-semibold text-ink-900">{resultado.idadeMinima} anos</dd>
              </div>
              <div>
                <dt className="text-ink-500">Tempo mínimo de contribuição</dt>
                <dd className="font-semibold text-ink-900">{resultado.tempoMinimoAnos} anos</dd>
              </div>
              <div>
                <dt className="text-ink-500">Faltam (estimativa)</dt>
                <dd className="font-semibold text-ink-900">
                  {resultado.anosFaltantes === 0 ? "Já cumpre os requisitos" : `${resultado.anosFaltantes} anos`}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Idade estimada na aposentadoria</dt>
                <dd className="font-semibold text-ink-900">{resultado.idadeEstimadaAposentadoria} anos</dd>
              </div>
            </dl>
            <p className="text-xs text-ink-500">
              Estimativa simplificada da regra geral (EC 103/2019). Não considera regras de
              transição (pontos, pedágio) que podem antecipar quem já contribuía antes de
              13/11/2019. Confirme sempre no simulador oficial do Meu INSS.
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
