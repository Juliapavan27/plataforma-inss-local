/**
 * Carrega o pedido a ser pago, autorizando por sessão OU por token assinado.
 * Usado tanto pela página `/pagamento/[appealId]` quanto pelas rotas que criam
 * a cobrança, para que as duas apliquem exatamente a mesma regra de acesso.
 */
import { db } from "./db";
import { auth } from "./auth";
import { verifyPaymentToken } from "./payment-token";

export async function loadPaymentForCheckout(appealId: string, token: string | null) {
  const payment = await db.payment.findUnique({
    where: { appealId },
    include: { appeal: true, user: true },
  });
  if (!payment) return null;

  if (verifyPaymentToken(appealId, token)) return payment;

  const session = await auth();
  if (session?.user?.id === payment.userId) return payment;

  return null;
}

/**
 * Valor a cobrar. O Pix é mais barato que o cartão (ver src/lib/pricing.ts), e
 * o desconto de recuperação de carrinho, quando existe, incide sobre os dois.
 */
export function amountToCharge(
  payment: { amountCents: number; discountCents: number },
  method: "pix" | "credit_card",
  prices: { pix: number; card: number },
) {
  const base = method === "pix" ? prices.pix : prices.card;
  return Math.max(100, base - payment.discountCents);
}
