/**
 * Integração com o Checkout da InfinitePay.
 *
 * IMPORTANTE sobre segurança: a criação de link não usa chave secreta (só a
 * `handle`, que é pública), e o webhook de confirmação não tem assinatura
 * verificável. Por isso, NUNCA confie no corpo do webhook sozinho — sempre
 * reconfirme via `verifyPayment` (payment_check), que é uma chamada nossa
 * direta pro servidor da InfinitePay, essa sim confiável.
 */
import { logger } from "./logger";

const HANDLE = process.env.INFINITEPAY_HANDLE;

export function isInfinitePayConfigured() {
  return Boolean(HANDLE);
}

interface CreateLinkInput {
  orderNsu: string;
  amountCents: number;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: {
    cep: string;
    street: string;
    neighborhood: string;
    number: string;
    complement?: string;
  };
}

export async function createCheckoutLink(input: CreateLinkInput): Promise<{ url: string }> {
  const res = await fetch("https://api.checkout.infinitepay.io/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: HANDLE,
      items: [
        { quantity: 1, price: input.amountCents, description: input.description },
      ],
      order_nsu: input.orderNsu,
      redirect_url: input.redirectUrl,
      webhook_url: input.webhookUrl,
      customer: input.customerName
        ? {
            name: input.customerName,
            email: input.customerEmail,
            phone_number: input.customerPhone,
          }
        : undefined,
      address: input.address,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`InfinitePay createCheckoutLink falhou (${res.status}): ${text}`);
  }
  const data = await res.json();
  if (!data.url) throw new Error("InfinitePay não retornou url no link de checkout");
  return { url: data.url };
}

interface VerifyPaymentInput {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
}

interface VerifyPaymentResult {
  paid: boolean;
  amountCents: number | null;
  paidAmountCents: number | null;
  captureMethod: string | null;
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  try {
    const res = await fetch("https://api.checkout.infinitepay.io/payment_check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: HANDLE,
        order_nsu: input.orderNsu,
        transaction_nsu: input.transactionNsu,
        slug: input.slug,
      }),
    });
    if (!res.ok) {
      return { paid: false, amountCents: null, paidAmountCents: null, captureMethod: null };
    }
    const data = await res.json();
    return {
      paid: Boolean(data.success && data.paid),
      amountCents: typeof data.amount === "number" ? data.amount : null,
      paidAmountCents: typeof data.paid_amount === "number" ? data.paid_amount : null,
      captureMethod: data.capture_method ?? null,
    };
  } catch (err) {
    logger.error("infinitepay.verifyPayment falhou", err, { orderNsu: input.orderNsu });
    return { paid: false, amountCents: null, paidAmountCents: null, captureMethod: null };
  }
}
