"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy, Check, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { formatCurrencyBRL } from "@/lib/utils";

type Fase = "form" | "pix" | "pago";

interface PixData {
  orderId: string;
  token: string;
  amountCents: number;
  qrCode: string | null;
  qrCodeBase64: string | null;
}

export function ManualCheckout({ slug, precoCents }: { slug: string; precoCents: number }) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("form");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pix, setPix] = useState<PixData | null>(null);
  const [copiado, setCopiado] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  async function comprar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (nome.trim().length < 3) return setErro("Informe seu nome completo.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErro("Informe um e-mail válido.");
    setEnviando(true);
    trackEvent("InitiateCheckout", { content_name: `Manual: ${slug}`, value: precoCents / 100 });
    try {
      const res = await fetch("/api/manuais/comprar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, nome, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Não foi possível iniciar a compra.");
      const p: PixData = data;
      setPix(p);
      setFase("pix");
      if (data.paid) return concluir(p);
      iniciarPolling(p);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao iniciar a compra.");
    } finally {
      setEnviando(false);
    }
  }

  function iniciarPolling(p: PixData) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => checarStatus(p), 4000);
  }

  async function checarStatus(p: PixData) {
    try {
      const res = await fetch(`/api/manuais/${p.orderId}/status?t=${encodeURIComponent(p.token)}`);
      const data = await res.json();
      if (data.status === "paid") concluir(p);
    } catch {
      /* mantém o polling */
    }
  }

  function concluir(p: PixData) {
    if (pollRef.current) clearInterval(pollRef.current);
    setFase("pago");
    router.push(`/manuais/${slug}/entrega/${p.orderId}?t=${encodeURIComponent(p.token)}`);
  }

  function copiar() {
    if (!pix?.qrCode) return;
    navigator.clipboard?.writeText(pix.qrCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (fase === "pago") {
    return (
      <div className="rounded-2xl border border-success-200 bg-success-50 p-6 text-center">
        <Check className="mx-auto h-8 w-8 text-success-600" />
        <p className="mt-2 font-semibold text-ink-900">Pagamento confirmado! Abrindo seu manual…</p>
      </div>
    );
  }

  if (fase === "pix" && pix) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-6 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Pague {formatCurrencyBRL(pix.amountCents)} no Pix
        </p>
        <p className="mt-1 text-sm text-ink-600">
          Escaneie o QR Code ou use o copia-e-cola. A entrega é liberada na hora.
        </p>
        {pix.qrCodeBase64 && (
          <img
            src={`data:image/png;base64,${pix.qrCodeBase64}`}
            alt="QR Code do Pix"
            className="mx-auto mt-4 h-56 w-56 rounded-xl border border-ink-200"
          />
        )}
        {pix.qrCode && (
          <button
            type="button"
            onClick={copiar}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-ink-300 bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-800 transition hover:bg-ink-100"
          >
            {copiado ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
            {copiado ? "Código copiado!" : "Copiar código Pix"}
          </button>
        )}
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Aguardando o pagamento…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={comprar} className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
      <p className="font-display text-lg font-semibold text-ink-950">
        Receber o manual por {formatCurrencyBRL(precoCents)}
      </p>
      <p className="mt-1 text-sm text-ink-600">
        Preencha e pague no Pix. O PDF chega no seu e-mail e abre na hora aqui.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-sm font-medium text-ink-700">Nome completo</label>
          <input
            className="input mt-1.5"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-700">E-mail</label>
          <input
            className="input mt-1.5"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
          />
          <p className="mt-1 text-xs text-ink-500">É neste e-mail que o manual será enviado.</p>
        </div>
      </div>
      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
      <button type="submit" disabled={enviando} className="btn-primary mt-5 w-full justify-center py-3">
        {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Pagar {formatCurrencyBRL(precoCents)} no Pix</>}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500">
        <ShieldCheck className="h-3.5 w-3.5 text-success-600" /> Pagamento seguro via Mercado Pago
      </p>
    </form>
  );
}
