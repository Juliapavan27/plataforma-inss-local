import { NextResponse } from "next/server";
import { z } from "zod";
import { payManualWithCard } from "@/lib/manuais-service";
import { isMercadoPagoConfigured, CardDeclinedError } from "@/lib/mercadopago";
import { verifyPaymentToken } from "@/lib/payment-token";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * O corpo vem do Brick do Mercado Pago. `token` representa o cartão — os dados
 * reais nunca passam por aqui. O valor não vem do cliente: é o preço fixo do
 * manual gravado no pedido.
 */
const BodySchema = z.object({
  token: z.string().min(1),
  payment_method_id: z.string().min(1),
  installments: z.number().int().min(1).max(12),
  issuer_id: z.union([z.string(), z.number()]).optional(),
  payer: z
    .object({
      email: z.string().email().optional(),
      identification: z
        .object({ type: z.string().optional(), number: z.string().optional() })
        .optional(),
    })
    .optional(),
});

export async function POST(req: Request, { params }: { params: { orderId: string } }) {
  const ip = getClientIp(req);
  const rl = rateLimit(`manuais:cartao:${ip}`, {
    max: 10,
    windowMs: 60 * 60_000,
    blockMs: 30 * 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl);

  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: "Pagamento indisponível no momento." }, { status: 503 });
  }

  const token = new URL(req.url).searchParams.get("t");
  if (!verifyPaymentToken(params.orderId, token)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  try {
    const body = BodySchema.parse(await req.json());
    const result = await payManualWithCard(params.orderId, {
      token: body.token,
      paymentMethodId: body.payment_method_id,
      installments: body.installments,
      issuerId: body.issuer_id != null ? String(body.issuer_id) : undefined,
      payerEmail: body.payer?.email,
      cpf: body.payer?.identification?.number,
    });

    if (result.paid) return NextResponse.json({ paid: true });
    return NextResponse.json({ paid: false, pending: result.pending, status: result.status });
  } catch (err) {
    // Cartão recusado é o banco dizendo não, não erro de sistema: vai com o
    // motivo já traduzido para o cliente ver o que fazer.
    if (err instanceof CardDeclinedError) {
      logger.warn("manuais.cartao recusado", { orderId: params.orderId, motivo: err.reason });
      return NextResponse.json({ paid: false, declined: true, error: err.message }, { status: 200 });
    }
    logger.error("manuais.cartao falhou", err, { orderId: params.orderId });
    return NextResponse.json(
      { error: "Não foi possível processar o cartão. Confira os dados e tente novamente." },
      { status: 400 },
    );
  }
}
