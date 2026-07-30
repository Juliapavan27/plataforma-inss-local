import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    })
  : (null as any as Stripe);

// Mantido como reexport para não quebrar quem já importa daqui. A definição
// (e a explicação dos dois preços) mora em src/lib/pricing.ts.
export { PRICE_PIX_CENTS as PRICE_RECURSO_CENTS } from "./pricing";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

const ABANDONED_CART_COUPON_ID = "ABANDONO10";

/** Cupom fixo de 10% usado no e-mail de recuperação de carrinho abandonado — cria uma vez, reutiliza depois. */
export async function getOrCreateAbandonedCartCoupon(): Promise<string> {
  try {
    await stripe.coupons.retrieve(ABANDONED_CART_COUPON_ID);
  } catch {
    await stripe.coupons.create({
      id: ABANDONED_CART_COUPON_ID,
      percent_off: 10,
      duration: "once",
      name: "Recuperação de carrinho — 10%",
    });
  }
  return ABANDONED_CART_COUPON_ID;
}
