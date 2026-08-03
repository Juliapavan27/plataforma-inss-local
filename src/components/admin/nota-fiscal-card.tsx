"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { NF_LABELS, type NfStatus } from "@/lib/nota-fiscal";

interface Props {
  paymentId: string;
  status: NfStatus;
  numero: string | null;
  observacao: string | null;
  bloco: string;
  diasDesdePagamento: number;
  atrasada: boolean;
}

/**
 * Uma venda na fila de emissão.
 *
 * O botão de copiar existe porque a nota é digitada à mão no portal da
 * prefeitura: copiar o bloco inteiro de uma vez evita ir e voltar entre abas e
 * errar dígito de CPF.
 */
export function NotaFiscalCard({
  paymentId,
  status,
  numero,
  observacao,
  bloco,
  diasDesdePagamento,
  atrasada,
}: Props) {
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);
  const [numeroNf, setNumeroNf] = useState(numero ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function registrar(novo: NfStatus, obs?: string) {
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/admin/notas-fiscais/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novo, numero: numeroNf, observacao: obs }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível salvar.");
        return;
      }
      router.refresh();
    } catch {
      setErro("Falha de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  const pendente = status === "PENDENTE";
  const precisaCancelar = status === "CANCELAR";

  return (
    <div
      className={`rounded-xl border p-4 ${
        precisaCancelar
          ? "border-red-200 bg-red-50"
          : atrasada
            ? "border-amber-200 bg-amber-50"
            : "border-ink-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-800">
            {bloco}
          </pre>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(bloco);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2500);
          }}
          className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink-700 ring-1 ring-ink-200 transition hover:bg-ink-50"
        >
          {copiado ? (
            <>
              <Check className="h-3.5 w-3.5 text-success-600" /> Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copiar dados
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="font-semibold text-ink-600">{NF_LABELS[status]}</span>
        <span className={atrasada ? "font-semibold text-amber-700" : "text-ink-500"}>
          {diasDesdePagamento === 0
            ? "pago hoje"
            : `pago há ${diasDesdePagamento} ${diasDesdePagamento === 1 ? "dia" : "dias"}`}
        </span>
        {numero && <span className="text-ink-500">NF {numero}</span>}
        {observacao && <span className="text-ink-500">· {observacao}</span>}
      </div>

      {precisaCancelar && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-white/70 p-3 text-xs leading-relaxed text-red-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none text-red-600" />
          Este pedido foi cancelado ou reembolsado depois da nota ter sido emitida.
          Cancele a nota {numero ? `nº ${numero} ` : ""}no portal da prefeitura — sem isso
          fica imposto pago sobre uma venda que não existe mais.
        </p>
      )}

      {(pendente || precisaCancelar) && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          {pendente && (
            <div className="w-40">
              <Label className="text-xs">Número da NF</Label>
              <Input
                value={numeroNf}
                onChange={(e) => setNumeroNf(e.target.value)}
                placeholder="Ex: 1234"
                className="mt-1"
              />
            </div>
          )}

          {pendente && (
            <>
              <Button size="sm" type="button" disabled={salvando} onClick={() => registrar("EMITIDA")}>
                {salvando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Marcar como emitida"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                disabled={salvando}
                onClick={() => registrar("DISPENSADA", "Dispensada manualmente")}
              >
                Dispensar
              </Button>
            </>
          )}

          {precisaCancelar && (
            <Button
              size="sm"
              type="button"
              disabled={salvando}
              onClick={() => registrar("CANCELADA", "Cancelada na prefeitura")}
            >
              {salvando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Já cancelei na prefeitura"}
            </Button>
          )}
        </div>
      )}

      {erro && <p className="mt-2 text-xs font-medium text-red-700">{erro}</p>}
    </div>
  );
}
