"use client";

/**
 * Estimativa de atrasados.
 *
 * O cálculo é aritmética simples: valor mensal × meses desde a data do pedido.
 * O que exige cuidado é o enquadramento — este número é CONDICIONAL ("se o
 * benefício for concedido a partir daquela data"), nunca uma previsão de que
 * será. A tela repete isso, e o resultado sai como faixa, não como valor
 * fechado, porque a data de início efetiva costuma ser discutida.
 *
 * Correção monetária e juros ficam de fora de propósito: dependem de índice e
 * de data de pagamento que ninguém sabe aqui, e chutá-los transformaria uma
 * estimativa honesta numa promessa de valor.
 */
import { useState } from "react";
import Link from "next/link";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight, Info } from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils";

export function AtrasadosForm() {
  const [valorMensal, setValorMensal] = useState("");
  const [dataPedido, setDataPedido] = useState("");
  const [resultado, setResultado] = useState<{ meses: number; totalCents: number } | null>(
    null,
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(Number(valorMensal.replace(/\./g, "").replace(",", ".")) * 100);
    if (!cents || !dataPedido) return;

    const [ano, mes, dia] = dataPedido.split("-").map(Number);
    const hoje = new Date();
    let meses = (hoje.getFullYear() - ano) * 12 + (hoje.getMonth() - (mes - 1));
    if (hoje.getDate() < dia) meses -= 1;
    meses = Math.max(0, meses);

    setResultado({ meses, totalCents: cents * meses });
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <Label>Valor mensal estimado do benefício</Label>
          <Input
            value={valorMensal}
            onChange={(e) => setValorMensal(e.target.value)}
            inputMode="decimal"
            placeholder="Ex: 1.518,00"
            required
          />
          <p className="mt-2 text-xs text-ink-500">
            Não sabe? Use a aba “Benefício negado” para estimar primeiro.
          </p>
        </div>
        <div>
          <Label>Data do pedido no INSS (DER)</Label>
          <input
            type="date"
            className="input mt-1.5"
            value={dataPedido}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDataPedido(e.target.value)}
            required
          />
          <p className="mt-2 text-xs text-ink-500">
            É a data em que você deu entrada no benefício, não a data da negativa.
          </p>
        </div>
        <Button className="w-full" type="submit">
          Estimar atrasados
        </Button>
      </form>

      <div className="card flex flex-col justify-center">
        {!resultado ? (
          <div className="text-center text-sm text-ink-500">
            <Calculator className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-3">
              Preencha ao lado para ver uma estimativa de quanto se acumularia desde a data
              do seu pedido.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink-600">
              Estimativa para {resultado.meses}{" "}
              {resultado.meses === 1 ? "mês" : "meses"} desde o pedido
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-950">
              {formatCurrencyBRL(resultado.totalCents)}
            </p>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-800">
                <Info className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
                <span>
                  Este número é <strong>condicional</strong>: só existiria se o benefício
                  fosse concedido com início na data do seu pedido. Não é previsão de que
                  isso vá acontecer, nem promessa de valor. A data de início efetiva
                  costuma ser discutida no processo, e o INSS pode fixá-la em outra data.
                </span>
              </p>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink-500">
              A conta não inclui correção monetária nem juros, que dependem de índices e da
              data de pagamento. O valor final, se houver concessão, tende a ser diferente.
            </p>

            <Link
              href="/posso-recorrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
            >
              Ver se ainda dá tempo de recorrer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
