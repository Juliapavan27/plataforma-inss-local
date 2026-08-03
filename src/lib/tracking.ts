/**
 * Eventos de conversão.
 *
 * O Google Ads importa conversões do GA4 **pelo nome do evento**, e trata os
 * nomes padrão (`generate_lead`, `begin_checkout`, `purchase`) de forma
 * diferente dos personalizados. Por isso cada evento é traduzido para o nome
 * padrão do GA4, mesmo que internamente a gente use a nomenclatura do Meta.
 *
 * `transaction_id` na compra não é enfeite: é como o GA4 descarta duplicata.
 * Sem ele, reabrir a página de confirmação contaria a venda de novo e a
 * campanha passaria a otimizar em cima de número inflado.
 */

type EventName =
  | "Lead"
  | "InitiateCheckout"
  | "Purchase"
  | "ViewContent"
  | "AddToCart"
  | "CompleteRegistration";

/** Nome do Meta → nome padrão do GA4. */
const GA4_EVENTO: Partial<Record<EventName, string>> = {
  Lead: "generate_lead",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
  ViewContent: "view_item",
  AddToCart: "add_to_cart",
  CompleteRegistration: "sign_up",
};

type EventParams = {
  value?: number;
  currency?: string;
  /** Obrigatório na compra — é a chave de deduplicação do GA4. */
  transaction_id?: string;
  content_name?: string;
  content_ids?: string[];
  [key: string]: unknown;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: EventName, params: EventParams = {}) {
  if (typeof window === "undefined") return;

  const currency = params.currency ?? "BRL";

  window.fbq?.("track", event, { ...params, currency });
  window.dataLayer?.push({ event, ...params, currency });

  const nomeGa4 = GA4_EVENTO[event];
  if (nomeGa4) {
    window.gtag?.("event", nomeGa4, {
      currency,
      value: params.value,
      ...(params.transaction_id ? { transaction_id: params.transaction_id } : {}),
      ...(params.content_name ? { item_name: params.content_name } : {}),
    });
  }
}

/**
 * Dispara uma vez por chave, mesmo se a página recarregar.
 *
 * A confirmação de pagamento é uma URL com token que a pessoa pode reabrir
 * pelo e-mail dias depois — sem essa trava, cada abertura viraria uma venda
 * nova no relatório.
 */
export function trackOnce(chave: string, fn: () => void) {
  if (typeof window === "undefined") return;
  try {
    const marca = `rf_evt_${chave}`;
    if (window.sessionStorage.getItem(marca)) return;
    window.sessionStorage.setItem(marca, "1");
  } catch {
    // Navegador com storage bloqueado: dispara mesmo assim. Perder a trava de
    // duplicata é pior que perder a conversão inteira? Não — mas contar zero
    // venda é pior que contar duas, então na dúvida a gente dispara.
  }
  fn();
}
