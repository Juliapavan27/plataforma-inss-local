import { NextResponse } from "next/server";
import { z } from "zod";
import { createManualOrder } from "@/lib/manuais-service";
import { isMercadoPagoConfigured, PixUnavailableError } from "@/lib/mercadopago";
import { getManual } from "@/content/manuais";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  slug: z.string().min(1),
  nome: z.string().min(3, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
});

/** Inicia a compra do manual: cria o pedido e devolve o Pix. */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`manuais:comprar:${ip}`, { max: 15, windowMs: 60 * 60_000 });
  if (!rl.ok) return tooManyRequests(rl);

  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: "Pagamento indisponível no momento." }, { status: 503 });
  }

  try {
    const data = schema.parse(await req.json());
    if (!getManual(data.slug)) {
      return NextResponse.json({ error: "Manual não encontrado." }, { status: 404 });
    }
    const result = await createManualOrder(data);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }
    if (err instanceof PixUnavailableError) {
      logger.error("manuais.comprar pix indisponivel", err);
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    logger.error("manuais.comprar falhou", err);
    return NextResponse.json(
      { error: "Não foi possível iniciar a compra. Tente novamente." },
      { status: 400 },
    );
  }
}
