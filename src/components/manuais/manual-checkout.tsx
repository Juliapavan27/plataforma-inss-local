"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { Loader2, Copy, Check, ShieldCheck, QrCode, CreditCard, ArrowLeft } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { formatCurrencyBRL } from "@/lib/utils";

type Fase = "form" | "metodo" | "pix" | "card" | "pago";

interface PixData {
  orderId: string;
  token: string;
  amountCents: number;
  qrCode: string | null;
  qrCodeBase64: string | null;
}

interface Draft {
  orderId: string;
  token: string;
  amountCents: number;
}

export function ManualCheckout({
  slug,
  precoCents,
  publicKey,
}: {
  slug: string;
  precoCents: number;
  publicKey?: string;
}) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("form");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pix, setPix] = useState<PixData | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [copiado, setCopiado] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (publicKey) initMercadoPago(publicKey, { locale: "pt-BR" });
  }, [publicKey]);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  function validar() {
    setErro(null);
    if (nome.trim().length < 3) {
      setErro("Informe seu nome completo.");
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErro("Informe um e-mail válido.");
      return false;
    }
    return true;
  }

  function irParaMetodo(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    trackEvent("InitiateCheckout", { content_name: `Manual: ${slug}`, value: precoCents / 100 });
    setFase("metodo");
  }

  // Pix: reaproveita a rota /comprar (pedido + Pix num passo só).
  async function escolherPix() {
    setErro(null);
    setEnviando(true);
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
      if (data.paid) return concluir(p.orderId, p.token);
      iniciarPolling(p);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao iniciar a compra.");
    } finally {
      setEnviando(false);
    }
  }

  // Cartão: cria o rascunho (só nome+e-mail) e abre o formulário do Mercado Pago.
  async function escolherCartao() {
    setErro(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/manuais/criar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, nome, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Não foi possível iniciar a compra.");
      setDraft(data);
      setFase("card");
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
      if (data.status === "paid") concluir(p.orderId, p.token);
    } catch {
      /* mantém o polling */
    }
  }

  const concluir = useCallback(
    (orderId: string, token: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      setFase("pago");
      router.push(`/manuais/${slug}/entrega/${orderId}?t=${encodeURIComponent(token)}`);
    },
    [router, slug],
  );

  function copiar() {
    if (!pix?.qrCode) return;
    navigator.clipboard?.writeText(pix.qrCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  /* --------------------------------------------------------------- pago */
  if (fase === "pago") {
    return (
      <div className="rounded-2xl border border-success-400/30 bg-success-500/10 p-6 text-center">
        <Check className="mx-auto h-8 w-8 text-success-400" />
        <p className="mt-2 font-semibold text-white">Pagamento confirmado! Abrindo seu manual…</p>
      </div>
    );
  }

  /* ---------------------------------------------------------------- pix */
  if (fase === "pix" && pix) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-300">
          Pague {formatCurrencyBRL(pix.amountCents)} no Pix
        </p>
        <p className="mt-1 text-sm text-white/60">
          Escaneie o QR Code ou use o copia-e-cola. A entrega é liberada na hora.
        </p>
        {pix.qrCodeBase64 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${pix.qrCodeBase64}`}
            alt="QR Code do Pix"
            className="mx-auto mt-4 h-56 w-56 rounded-xl bg-white p-2"
          />
        )}
        {pix.qrCode && (
          <button
            type="button"
            onClick={copiar}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {copiado ? <Check className="h-4 w-4 text-success-400" /> : <Copy className="h-4 w-4" />}
            {copiado ? "Código copiado!" : "Copiar código Pix"}
          </button>
        )}
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" /> Aguardando o pagamento…
        </p>
      </div>
    );
  }

  /* -------------------------------------------------------------- cartão */
  if (fase === "card" && draft) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <button
          type="button"
          onClick={() => {
            setDraft(null);
            setFase("metodo");
          }}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-sm text-white/60">Valor a pagar</span>
          <span className="font-display text-2xl font-bold text-white">
            {formatCurrencyBRL(draft.amountCents)}
          </span>
        </div>
        {erro && <p className="mb-3 rounded-xl bg-red-500/15 p-3 text-sm text-red-200">{erro}</p>}
        {/* O Brick renderiza o formulário do MP num cartão branco: dados do
            cartão nunca passam pelo nosso servidor. */}
        <div className="overflow-hidden rounded-xl bg-white p-1">
          <CardPayment
            initialization={{ amount: draft.amountCents / 100 }}
            customization={{
              visual: {
                style: {
                  theme: "default",
                  customVariables: {
                    baseColor: "#3557d4",
                    borderRadiusMedium: "0.625rem",
                    formBackgroundColor: "#ffffff",
                  },
                },
              },
              paymentMethods: { maxInstallments: 1 },
            }}
            onSubmit={async (formData: any) => {
              setErro(null);
              try {
                const res = await fetch(
                  `/api/manuais/${draft.orderId}/cartao?t=${encodeURIComponent(draft.token)}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                  },
                );
                const data = await res.json();
                if (data.paid) return concluir(draft.orderId, draft.token);
                if (data.pending) {
                  setErro(
                    "Pagamento em análise pelo banco. Assim que aprovar, o manual chega no seu e-mail.",
                  );
                  return;
                }
                setErro(
                  data.error ??
                    "O pagamento não foi aprovado. Confira os dados ou tente outro cartão.",
                );
              } catch {
                setErro("Falha de conexão ao processar o pagamento. Tente novamente.");
              }
            }}
            onError={() => setErro("Confira os dados do cartão e tente novamente.")}
          />
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/50">
          <ShieldCheck className="h-3.5 w-3.5 text-success-400" /> Processado pelo Mercado Pago
        </p>
      </div>
    );
  }

  /* -------------------------------------------------------- escolha método */
  if (fase === "metodo") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <button
          type="button"
          onClick={() => setFase("form")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <p className="font-display text-lg font-semibold text-white">Como você prefere pagar?</p>
        {erro && <p className="mt-3 text-sm text-red-300">{erro}</p>}
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={escolherPix}
            disabled={enviando}
            className="flex w-full items-center gap-4 rounded-2xl border-2 border-brand-500 bg-brand-500/10 p-4 text-left transition hover:bg-brand-500/15 disabled:opacity-60"
          >
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand-500/20 text-brand-200">
              {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5" />}
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-white">Pix</span>
              <span className="block text-sm text-white/60">Aprovação na hora, direto no app do banco</span>
            </span>
            <span className="font-display text-lg font-bold text-brand-200">
              {formatCurrencyBRL(precoCents)}
            </span>
          </button>
          <button
            type="button"
            onClick={escolherCartao}
            disabled={enviando}
            className="flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 text-left transition hover:bg-white/10 disabled:opacity-60"
          >
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white/10 text-white/80">
              <CreditCard className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-white">Cartão de crédito</span>
              <span className="block text-sm text-white/60">Aprovação na hora</span>
            </span>
            <span className="font-display text-lg font-bold text-white">
              {formatCurrencyBRL(precoCents)}
            </span>
          </button>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/50">
          <ShieldCheck className="h-3.5 w-3.5 text-success-400" /> Pagamento seguro via Mercado Pago
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------- form */
  return (
    <form onSubmit={irParaMetodo} className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="font-display text-lg font-semibold text-white">
        Receber o manual por {formatCurrencyBRL(precoCents)}
      </p>
      <p className="mt-1 text-sm text-white/60">
        Preencha, escolha Pix ou cartão, e o PDF chega no seu e-mail e abre na hora aqui.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-sm font-medium text-white/70">Nome completo</label>
          <input
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-white/70">E-mail</label>
          <input
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
          />
          <p className="mt-1 text-xs text-white/50">É neste e-mail que o manual será enviado.</p>
        </div>
      </div>
      {erro && <p className="mt-3 text-sm text-red-300">{erro}</p>}
      <button type="submit" className="btn-primary mt-5 w-full justify-center py-3">
        Continuar para o pagamento
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/50">
        <ShieldCheck className="h-3.5 w-3.5 text-success-400" /> Pix ou cartão · via Mercado Pago
      </p>
    </form>
  );
}
