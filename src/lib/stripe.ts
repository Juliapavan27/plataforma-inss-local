import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, {
      apiVersion: "2024-09-30.acacia",
      typescript: true,
    })
  : (null as any as Stripe);

export const PRICE_RECURSO_CENTS = Number(
  process.env.PRICE_RECURSO_CENTS ?? 29900,
);

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
