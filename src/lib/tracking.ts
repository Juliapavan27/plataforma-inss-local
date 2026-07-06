type EventName =
  | "Lead"
  | "InitiateCheckout"
  | "Purchase"
  | "ViewContent"
  | "AddToCart"
  | "CompleteRegistration";

type EventParams = {
  value?: number;
  currency?: string;
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

  window.fbq?.("track", event, params);

  window.dataLayer?.push({ event, ...params });

  if (event === "Purchase" || event === "InitiateCheckout") {
    window.gtag?.("event", event.toLowerCase(), {
      currency: params.currency ?? "BRL",
      value: params.value,
    });
  }
}
