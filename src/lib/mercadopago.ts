/**
 * Integração com a API de Orders do Mercado Pago (Checkout Transparente).
 *
 * Diferente da InfinitePay, aqui o cliente paga dentro do nosso site: o
 * formulário de cartão é um Brick do Mercado Pago (os dados do cartão vão
 * direto pro servidor deles e viram um token — nunca passam pelo nosso), e o
 * Pix é só um QR Code que a gente exibe. Por isso a página de pagamento tem a
 * identidade visual do Recurso Fácil.
 *
 * Também diferente da InfinitePay: o valor cobrado é exatamente o que a gente
 * manda. O Mercado Pago desconta a taxa do que a gente recebe, e não por cima
 * do que o cliente paga. Então R$ 299 no cartão é R$ 299 na fatura.
 */
import { randomUUID, createHmac, timingSafeEqual } from "crypto";
import { logger } from "./logger";

const API = "https://api.mercadopago.com";

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;

export function isMercadoPagoConfigured() {
  return Boolean(ACCESS_TOKEN && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
}

/** O Mercado Pago fala em reais como string ("299.00"), não em centavos. */
function toAmountString(cents: number) {
  return (cents / 100).toFixed(2);
}

async function mpFetch(path: string, init: RequestInit & { idempotencyKey?: string } = {}) {
  const { idempotencyKey, ...rest } = init;
  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}),
      ...(rest.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* resposta não-JSON cai no erro abaixo com o texto cru */
  }

  if (!res.ok) {
    // A mensagem útil do Mercado Pago costuma vir em `message`; os detalhes por
    // campo, em `errors` ou `cause`. Sem isso, depurar 400 é adivinhação.
    const detail = data?.message ?? text.slice(0, 500);
    const err = new Error(`Mercado Pago ${path} falhou (${res.status}): ${detail}`);
    (err as any).mpStatus = res.status;
    (err as any).mpBody = data;
    throw err;
  }
  return data;
}

export interface OrderPayer {
  email: string;
  firstName?: string;
  lastName?: string;
  /** CPF, só dígitos. */
  cpf?: string;
}

export interface MpOrderResult {
  orderId: string;
  paymentId: string | null;
  status: string;
  statusDetail: string | null;
  /** Aprovado e creditado — a única combinação que libera a entrega. */
  paid: boolean;
  /** Só no Pix: string do copia-e-cola e a imagem do QR em base64. */
  pix?: {
    qrCode: string | null;
    qrCodeBase64: string | null;
    ticketUrl: string | null;
    expiresAt: string | null;
  };
}

/**
 * `processed`/`accredited` é a única combinação que significa dinheiro
 * creditado. `action_required` no Pix é normal (esperando a transferência).
 */
function readOrder(data: any): MpOrderResult {
  const payment = data?.transactions?.payments?.[0] ?? null;
  const method = payment?.payment_method ?? {};
  return {
    orderId: data?.id,
    paymentId: payment?.id ?? null,
    status: data?.status ?? "unknown",
    statusDetail: data?.status_detail ?? null,
    paid: data?.status === "processed" && data?.status_detail === "accredited",
    pix:
      method?.qr_code || method?.qr_code_base64
        ? {
            qrCode: method.qr_code ?? null,
            qrCodeBase64: method.qr_code_base64 ?? null,
            ticketUrl: method.ticket_url ?? null,
            expiresAt: payment?.expiration_time ?? null,
          }
        : undefined,
  };
}

function payerPayload(payer: OrderPayer) {
  return {
    email: payer.email,
    ...(payer.firstName ? { first_name: payer.firstName } : {}),
    ...(payer.lastName ? { last_name: payer.lastName } : {}),
    ...(payer.cpf
      ? { identification: { type: "CPF", number: payer.cpf } }
      : {}),
  };
}

/**
 * `externalReference` é o nosso appealId — é por ele que o webhook reencontra o
 * pedido. `idempotencyKey` precisa ser estável por tentativa para que um
 * clique duplo não vire duas cobranças.
 */
export async function createPixOrder(input: {
  appealId: string;
  amountCents: number;
  description: string;
  payer: OrderPayer;
  /** Minutos até o Pix expirar. */
  expiresInMinutes?: number;
}): Promise<MpOrderResult> {
  const data = await mpFetch("/v1/orders", {
    method: "POST",
    idempotencyKey: `pix-${input.appealId}-${randomUUID()}`,
    body: JSON.stringify({
      type: "online",
      processing_mode: "automatic",
      total_amount: toAmountString(input.amountCents),
      external_reference: input.appealId,
      description: input.description,
      payer: payerPayload(input.payer),
      transactions: {
        payments: [
          {
            amount: toAmountString(input.amountCents),
            payment_method: { id: "pix", type: "bank_transfer" },
            expiration_time: `PT${input.expiresInMinutes ?? 30}M`,
          },
        ],
      },
    }),
  });
  return readOrder(data);
}

/**
 * Traduz o motivo da recusa para uma frase que diz ao cliente o que fazer.
 *
 * Sem isso ele recebe "confira os dados" para qualquer recusa e tenta o mesmo
 * cartão de novo — inclusive quando o problema era saldo, e nenhuma tentativa
 * ia funcionar. É diferença de venda, não de texto.
 */
const MOTIVOS_RECUSA: Record<string, string> = {
  // Códigos observados na própria API de Orders (sandbox, julho/2026).
  insufficient_amount:
    "O cartão não tem limite disponível para este valor. Tente outro cartão ou pague no Pix.",
  bad_filled_card_data:
    "Algum dado do cartão está incorreto. Confira o número, a validade e o código de segurança.",
  required_call_for_authorize:
    "Seu banco precisa autorizar esta compra. Ligue para o número no verso do cartão e tente de novo.",
  card_disabled:
    "Este cartão está bloqueado para compras online. Fale com seu banco ou use outro cartão.",
  rejected_by_issuer:
    "O banco emissor recusou a compra. Tente outro cartão ou pague no Pix.",
  max_attempts_exceeded:
    "Foram muitas tentativas com este cartão. Aguarde alguns minutos ou use outro cartão.",
  invalid_installments:
    "Este cartão não aceita esse número de parcelas. Escolha outra opção de parcelamento.",
  invalid_card_token:
    "Não foi possível ler os dados do cartão. Recarregue a página e digite de novo.",
  processing_error:
    "Houve um problema ao processar. Aguarde um minuto e tente de novo, ou pague no Pix.",
};

export class CardDeclinedError extends Error {
  constructor(
    readonly reason: string,
    message: string,
  ) {
    super(message);
    this.name = "CardDeclinedError";
  }
}

/** O 402 do Mercado Pago traz o motivo em `errors[].details` como "PAY...: motivo". */
function readDeclineReason(body: any): string | null {
  const details: unknown = body?.errors?.[0]?.details;
  if (Array.isArray(details) && typeof details[0] === "string") {
    const afterColon = details[0].split(":").pop()?.trim();
    if (afterColon) return afterColon;
  }
  return body?.data?.status_detail ?? null;
}

export async function createCardOrder(input: {
  appealId: string;
  amountCents: number;
  description: string;
  payer: OrderPayer;
  /** Token gerado pelo Brick no navegador — representa o cartão, e só serve uma vez. */
  token: string;
  paymentMethodId: string;
  installments: number;
  issuerId?: string;
}): Promise<MpOrderResult> {
  try {
    return await postCardOrder(input);
  } catch (err: any) {
    // Recusa é resposta esperada do fluxo, não falha nossa: o 402 vira um erro
    // tipado com o motivo, para a rota devolver uma frase útil ao cliente.
    if (err?.mpStatus === 402) {
      const reason = readDeclineReason(err.mpBody) ?? "desconhecido";
      throw new CardDeclinedError(
        reason,
        MOTIVOS_RECUSA[reason] ??
          "O pagamento não foi autorizado pelo banco. Tente outro cartão ou pague no Pix.",
      );
    }
    throw err;
  }
}

async function postCardOrder(input: {
  appealId: string;
  amountCents: number;
  description: string;
  payer: OrderPayer;
  token: string;
  paymentMethodId: string;
  installments: number;
  issuerId?: string;
}): Promise<MpOrderResult> {
  const data = await mpFetch("/v1/orders", {
    method: "POST",
    idempotencyKey: `card-${input.appealId}-${input.token}`,
    body: JSON.stringify({
      type: "online",
      processing_mode: "automatic",
      total_amount: toAmountString(input.amountCents),
      external_reference: input.appealId,
      description: input.description,
      payer: payerPayload(input.payer),
      transactions: {
        payments: [
          {
            amount: toAmountString(input.amountCents),
            payment_method: {
              id: input.paymentMethodId,
              type: "credit_card",
              token: input.token,
              installments: input.installments,
              ...(input.issuerId ? { issuer_id: input.issuerId } : {}),
              statement_descriptor: "RECURSOFACIL",
            },
          },
        ],
      },
    }),
  });
  return readOrder(data);
}

/** Fonte da verdade sobre o pagamento. Nunca confiar no corpo do webhook. */
export async function getOrder(orderId: string): Promise<MpOrderResult> {
  return readOrder(await mpFetch(`/v1/orders/${orderId}`, { method: "GET" }));
}

/**
 * Valida o cabeçalho `x-signature`.
 *
 * O manifesto é montado no formato exato
 * `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` e assinado com HMAC-SHA256
 * usando o segredo do webhook. Campos ausentes são omitidos do manifesto.
 *
 * Sem segredo configurado devolvemos `false`: é melhor ignorar a notificação
 * (o polling e a reconsulta ainda confirmam o pagamento) do que aceitar
 * qualquer POST anônimo como confirmação de compra.
 */
export function verifyWebhookSignature(opts: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
}): boolean {
  if (!WEBHOOK_SECRET) {
    logger.warn("mercadopago.webhook sem MERCADOPAGO_WEBHOOK_SECRET — ignorando notificação");
    return false;
  }
  if (!opts.signatureHeader) return false;

  const parts = Object.fromEntries(
    opts.signatureHeader.split(",").map((p) => {
      const [k, ...v] = p.split("=");
      return [k.trim(), v.join("=").trim()];
    }),
  ) as { ts?: string; v1?: string };

  if (!parts.ts || !parts.v1) return false;

  // O ID vem em minúsculas no manifesto quando é alfanumérico.
  const id = opts.dataId ? opts.dataId.toLowerCase() : null;
  const manifest =
    (id ? `id:${id};` : "") +
    (opts.requestId ? `request-id:${opts.requestId};` : "") +
    `ts:${parts.ts};`;

  const expected = createHmac("sha256", WEBHOOK_SECRET).update(manifest).digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(parts.v1, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
