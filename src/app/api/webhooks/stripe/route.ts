import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { db } from "@/lib/db";
import { markPaidAndNotifyAdmin } from "@/lib/appeal-service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 501 });
  }
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret)
    return NextResponse.json({ error: "invalid" }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "invalid sig" },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const appealId = s.metadata?.appealId;
      if (!appealId) break;
      await db.payment.updateMany({
        where: { stripeSessionId: s.id },
        data: {
          status: "PAID",
          stripePaymentIntent: (s.payment_intent as string) ?? undefined,
          paidAt: new Date(),
        },
      });
      // Marca como pago, define prazo de entrega e avisa o admin — geração é manual.
      await markPaidAndNotifyAdmin(appealId).catch(async (e) => {
        const { logger } = await import("@/lib/logger");
        logger.error("markPaidAndNotifyAdmin falhou", e, { appealId });
      });
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const s = event.data.object as Stripe.Checkout.Session;
      await db.payment.updateMany({
        where: { stripeSessionId: s.id },
        data: { status: "FAILED" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
