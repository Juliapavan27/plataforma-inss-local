"use client";

/**
 * Calculadora de prazo do recurso.
 *
 * É a pergunta mais urgente de quem acabou de ser negado, e a única cuja
 * resposta é objetiva: 30 dias corridos da ciência da decisão. Tudo roda no
 * navegador — não há por que mandar essa data para o servidor.
 */
import { useState } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarClock, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { PRAZO_RECURSO_DIAS } from "@/lib/pre-analise";
import { formatDateBR } from "@/lib/utils";

export function PrazoForm() {
  const [data, setData] = useState("");
  const [resultado, setResultado] = useState<{
    limite: Date;
    restantes: number;
  } | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    const [ano, mes, dia] = data.split("-").map(Number);
    const ciencia = new Date(ano, mes - 1, dia);
    const limite = new Date(ano, mes - 1, dia + PRAZO_RECURSO_DIAS);

    const hoje = new Date();
    const hojeZero = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const restantes = Math.round(
      (limite.getTime() - hojeZero.getTime()) / (24 * 60 * 60_000),
    );
    setResultado({ limite, restantes });
  }

  const vencido = resultado != null && resultado.restantes < 0;
  const apertado = resultado != null && resultado.restantes >= 0 && resultado.restantes <= 7;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <Label>Data da ciência da decisão</Label>
          <input
            type="date"
            className="input mt-1.5"
            value={data}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setData(e.target.value)}
            required
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-500">
            É a data em que você tomou conhecimento da negativa — normalmente a data da
            carta ou do aviso no Meu INSS. Ela pode ser diferente da data em que o INSS
            decidiu.
          </p>
        </div>
        <Button className="w-full" type="submit">
          Calcular meu prazo
        </Button>
      </form>

      <div className="card flex flex-col justify-center">
        {!resultado ? (
          <div className="text-center text-sm text-ink-500">
            <CalendarClock className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-3">
              Informe a data ao lado para saber até quando você pode apresentar o recurso
              administrativo.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink-600">Prazo final para recorrer</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-950">
              {formatDateBR(resultado.limite)}
            </p>

            <div
              className={`mt-5 rounded-xl border p-4 ${
                vencido
                  ? "border-red-200 bg-red-50"
                  : apertado
                    ? "border-amber-200 bg-amber-50"
                    : "border-success-200 bg-success-50"
              }`}
            >
              <p className="flex items-start gap-2 text-sm font-semibold text-ink-950">
                {vencido || apertado ? (
                  <AlertTriangle
                    className={`mt-0.5 h-4 w-4 flex-none ${vencido ? "text-red-600" : "text-amber-600"}`}
                  />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-success-600" />
                )}
                {vencido
                  ? "O prazo administrativo provavelmente já passou"
                  : resultado.restantes === 0
                    ? "Hoje é o último dia"
                    : `Faltam ${resultado.restantes} dias`}
              </p>
              <p className="mt-2 pl-6 text-sm leading-relaxed text-ink-700">
                {vencido
                  ? "Confira a data de ciência na sua carta antes de concluir: ela costuma ser diferente da data da decisão. Se o prazo passou mesmo, normalmente ainda cabe novo requerimento, e a via judicial segue aberta."
                  : "O protocolo no Meu INSS é gratuito e pode ser feito por você. O que exige técnica é a peça do recurso."}
              </p>
            </div>

            <Link
              href="/posso-recorrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
            >
              Ver a pré-análise completa do meu caso <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
