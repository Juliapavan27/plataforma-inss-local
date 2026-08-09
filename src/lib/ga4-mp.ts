/**
 * GA4 Measurement Protocol — conversões enviadas pelo SERVIDOR.
 *
 * O envio pelo navegador (gtag) depende de bloqueador, privacidade do browser,
 * CSP e consentimento — e, no nosso caso, não estava chegando ao Google. As
 * conversões que importam nascem no NOSSO servidor (o webhook do Mercado Pago
 * confirma a compra aqui), então mandamos direto daqui para a API do GA4: é
 * imune a tudo isso.
 *
 * Se as variáveis não estiverem configuradas, é no-op silencioso — nunca
 * derruba o fluxo de pagamento. Erros de envio são só logados: medir é
 * importante, mas jamais mais importante que confirmar a venda.
 *
 * Configuração (Railway, serviço web):
 *   GA4_API_SECRET      → o segredo criado no GA4 (Admin › Fluxos de dados ›
 *                         seu fluxo › Chaves secretas da API do Measurement
 *                         Protocol › Criar).
 *   GA4_MEASUREMENT_ID  → opcional; na falta, usa NEXT_PUBLIC_GA4_ID
 *                         (G-PS83745NBY), que já está configurado.
 */
import { logger } from "./logger";

const MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA4_ID;
const API_SECRET = process.env.GA4_API_SECRET;

export function isGa4ServerConfigured(): boolean {
  return Boolean(MEASUREMENT_ID && API_SECRET);
}

type Ga4Event = { name: string; params?: Record<string, unknown> };

/**
 * Envia eventos ao GA4 pela API do servidor.
 *
 * `client_id` liga o evento a um usuário do GA4. O ideal é reaproveitar o do
 * cookie `_ga` do visitante (atribuição perfeita no Google Ads); na falta dele,
 * um id gerado ainda registra a conversão corretamente. Passe `clientId` quando
 * tiver o do visitante.
 */
export async function sendGa4ServerEvent(opts: {
  clientId?: string | null;
  events: Ga4Event[];
}): Promise<void> {
  if (!isGa4ServerConfigured()) return;

  const clientId =
    opts.clientId ||
    `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ client_id: clientId, events: opts.events }),
        cache: "no-store",
      },
    );
    // A API responde 204 quando aceita. Não conseguimos ver erros de validação
    // aqui (só no endpoint /debug), então status != 2xx já é sinal para o log.
    if (!res.ok) logger.warn("ga4-mp: envio rejeitado", { status: res.status });
  } catch (e) {
    logger.warn("ga4-mp: falha ao enviar evento", e as any);
  }
}

/**
 * Conversão de compra — o número que o Google Ads importa do GA4.
 * `transaction_id` deduplica: reenvio do webhook não conta a venda de novo.
 */
export async function trackServerPurchase(opts: {
  transactionId: string;
  valueCents: number;
  clientId?: string | null;
  itemName?: string;
}): Promise<void> {
  await sendGa4ServerEvent({
    clientId: opts.clientId,
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: opts.transactionId,
          value: Math.round(opts.valueCents) / 100,
          currency: "BRL",
          items: [{ item_name: opts.itemName ?? "Recurso administrativo INSS" }],
        },
      },
    ],
  });
}
