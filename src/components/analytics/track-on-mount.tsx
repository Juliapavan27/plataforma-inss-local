"use client";

import { useEffect } from "react";
import { trackEvent, trackOnce } from "@/lib/tracking";

/**
 * Dispara um evento quando a página abre.
 *
 * Existe porque as páginas de pagamento e confirmação são componentes de
 * servidor e não podem chamar o `gtag`, que só existe no navegador. Este
 * componente é o pedaço de cliente mínimo para fazer a ponte.
 *
 * `chaveUnica` liga a trava de duplicata: use nas conversões que a pessoa pode
 * reabrir (a confirmação chega por e-mail e é revisitada).
 */
export function TrackOnMount({
  event,
  value,
  transactionId,
  contentName,
  chaveUnica,
}: {
  event: "Lead" | "InitiateCheckout" | "Purchase" | "ViewContent";
  value?: number;
  transactionId?: string;
  contentName?: string;
  chaveUnica?: string;
}) {
  useEffect(() => {
    const disparar = () =>
      trackEvent(event, {
        value,
        transaction_id: transactionId,
        content_name: contentName,
      });

    if (chaveUnica) trackOnce(chaveUnica, disparar);
    else disparar();
  }, [event, value, transactionId, contentName, chaveUnica]);

  return null;
}
