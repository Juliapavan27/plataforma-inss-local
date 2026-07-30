"use client";

/**
 * Checkout dentro do nosso site.
 *
 * O cliente escolhe o meio de pagamento numa tela nossa, com a identidade do
 * Recurso Fácil, e só então aparece o formulário. Os dados do cartão são
 * digitados dentro do Brick do Mercado Pago e viram um token no navegador —
 * nunca chegam ao nosso servidor.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { QrCode, CreditCard, Check, Copy, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/lib/utils";

type Method = "pix" | "credit_card";

interface Props {
  appealId: string;
  token: string;
  publicKey: string;
  pricePixCents: number;
  priceCardCents: number;
  successUrl: string;
}

export function PaymentCheckout({
  appealId,
  token,
  publicKey,
  pricePixCents,
  priceCardCents,
  successUrl,
}: Props) {
  const router = useRouter();
  const [method, setMethod] = useState<Method | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    initMercadoPago(publicKey, { locale: "pt-BR" });
  }, [publicKey]);

  const onPaid = useCallback(() => {
    setPaid(true);
    // Pequena pausa para o cliente ver a confirmação antes de sair da tela.
    setTimeout(() => router.push(successUrl), 1800);
  }, [router, successUrl]);

  if (paid) return <PaidState />;

  return (
    <div className="mx-auto w-full max-w-xl">
      {method === null && (
        <MethodPicker
          pricePixCents={pricePixCents}
          priceCardCents={priceCardCents}
          onPick={setMethod}
        />
      )}

      {method !== null && (
        <div>
          <button
            type="button"
            onClick={() => setMethod(null)}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" /> Trocar forma de pagamento
          </button>

          {method === "pix" ? (
            <PixPanel
              appealId={appealId}
              token={token}
              amountCents={pricePixCents}
              onPaid={onPaid}
            />
          ) : (
            <CardPanel
              appealId={appealId}
              token={token}
              amountCents={priceCardCents}
              onPaid={onPaid}
            />
          )}
        </div>
      )}

      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-ink-500">
        <ShieldCheck className="h-4 w-4 text-success-600" />
        Pagamento processado pelo Mercado Pago. Não guardamos os dados do seu cartão.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- escolha */

function MethodPicker({
  pricePixCents,
  priceCardCents,
  onPick,
}: {
  pricePixCents: number;
  priceCardCents: number;
  onPick: (m: Method) => void;
}) {
  const economia = priceCardCents - pricePixCents;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-ink-950">
        Como você prefere pagar?
      </h2>

      <button
        type="button"
        onClick={() => onPick("pix")}
        className="group relative flex w-full items-center gap-4 rounded-2xl border-2 border-brand-500 bg-white p-5 text-left shadow-soft transition hover:shadow-lift"
      >
        {economia > 0 && (
          <span className="absolute -top-3 right-5 rounded-full bg-success-600 px-3 py-1 text-[11px] font-semibold text-white">
            Economize {formatCurrencyBRL(economia)}
          </span>
        )}
        <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">
          <QrCode className="h-6 w-6" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-ink-950">Pix</span>
          <span className="block text-sm text-ink-600">
            Aprovação na hora, direto no app do seu banco
          </span>
        </span>
        <span className="font-display text-xl font-bold text-brand-700">
          {formatCurrencyBRL(pricePixCents)}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onPick("credit_card")}
        className="flex w-full items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5 text-left transition hover:border-ink-300 hover:shadow-soft"
      >
        <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-ink-50 text-ink-700 ring-1 ring-ink-200">
          <CreditCard className="h-6 w-6" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-ink-950">Cartão de crédito</span>
          <span className="block text-sm text-ink-600">
            À vista ou parcelado, com juros da operadora
          </span>
        </span>
        <span className="font-display text-xl font-bold text-ink-900">
          {formatCurrencyBRL(priceCardCents)}
        </span>
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------- pix */

function PixPanel({
  appealId,
  token,
  amountCents,
  onPaid,
}: {
  appealId: string;
  token: string;
  amountCents: number;
  onPaid: () => void;
}) {
  const [qr, setQr] = useState<{ code: string | null; base64: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const criado = useRef(false);

  useEffect(() => {
    // Sem essa trava o StrictMode do React em dev geraria dois Pix.
    if (criado.current) return;
    criado.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/pagamentos/${appealId}/pix?t=${encodeURIComponent(token)}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "falha");
        if (data.paid || data.alreadyPaid) return onPaid();
        setQr({ code: data.qrCode, base64: data.qrCodeBase64 });
      } catch {
        setError("Não foi possível gerar o Pix. Recarregue a página e tente de novo.");
      }
    })();
  }, [appealId, token, onPaid]);

  // Enquanto o QR está na tela, pergunta ao servidor se o pagamento caiu.
  useEffect(() => {
    if (!qr) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/pagamentos/${appealId}/status?t=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (data.paid) {
          clearInterval(id);
          onPaid();
        }
      } catch {
        /* falha de rede momentânea — a próxima passagem tenta de novo */
      }
    }, 4000);
    return () => clearInterval(id);
  }, [qr, appealId, token, onPaid]);

  if (error) {
    return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  if (!qr) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-ink-200 bg-white p-12 text-sm text-ink-600">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" /> Gerando seu Pix…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 text-center shadow-soft">
      <p className="text-sm text-ink-600">Valor a pagar</p>
      <p className="font-display text-3xl font-bold text-ink-950">
        {formatCurrencyBRL(amountCents)}
      </p>

      {qr.base64 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`data:image/png;base64,${qr.base64}`}
          alt="QR Code do Pix"
          className="mx-auto mt-5 h-56 w-56 rounded-xl ring-1 ring-ink-200"
        />
      )}

      <p className="mt-5 text-sm text-ink-600">
        Abra o app do seu banco, escolha Pix e leia o QR Code — ou use o código abaixo.
      </p>

      {qr.code && (
        <>
          <p className="mt-4 break-all rounded-xl bg-ink-50 p-3 text-left font-mono text-[11px] leading-relaxed text-ink-700">
            {qr.code}
          </p>
          <Button
            className="mt-3 w-full"
            variant="secondary"
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(qr.code!);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success-600" /> Código copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copiar código Pix
              </>
            )}
          </Button>
        </>
      )}

      <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Esta tela confirma sozinha assim que o pagamento cair. Pode deixar aberta.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------- cartão */

function CardPanel({
  appealId,
  token,
  amountCents,
  onPaid,
}: {
  appealId: string;
  token: string;
  amountCents: number;
  onPaid: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-baseline justify-between">
        <span className="text-sm text-ink-600">Valor a pagar</span>
        <span className="font-display text-2xl font-bold text-ink-950">
          {formatCurrencyBRL(amountCents)}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      {pending && (
        <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Seu pagamento está em análise pelo banco. Assim que for aprovado, você recebe
          um e-mail e o pedido entra na fila de produção.
        </p>
      )}

      <CardPayment
        initialization={{ amount: amountCents / 100 }}
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
          paymentMethods: { maxInstallments: 12 },
        }}
        onSubmit={async (formData: any) => {
          setError(null);
          setPending(false);
          try {
            const res = await fetch(
              `/api/pagamentos/${appealId}/cartao?t=${encodeURIComponent(token)}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
              },
            );
            const data = await res.json();
            if (data.paid) return onPaid();
            if (data.pending) return setPending(true);
            setError(
              data.error ??
                "O pagamento não foi aprovado. Confira os dados ou tente outro cartão.",
            );
          } catch {
            setError("Falha de conexão ao processar o pagamento. Tente novamente.");
          }
        }}
        onError={() => setError("Confira os dados do cartão e tente novamente.")}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ pago */

function PaidState() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-success-200 bg-success-50 p-10 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-600 text-white">
        <Check className="h-7 w-7" />
      </span>
      <h2 className="mt-5 font-display text-xl font-semibold text-ink-950">
        Pagamento confirmado
      </h2>
      <p className="mt-2 text-sm text-ink-700">
        Seu recurso entrou na fila de produção. Estamos te levando para o acompanhamento
        do pedido.
      </p>
    </div>
  );
}
