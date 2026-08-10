/**
 * Número de WhatsApp em um lugar só.
 *
 * Aparece no botão flutuante, dentro dos manuais e nas páginas de CTA. Ter uma
 * fonte única evita o número divergir entre os pontos — e, quando a autora
 * migrar do número pessoal para um profissional, muda aqui e reflete em tudo.
 */

// País (55) + DDD (16) + número. wa.me exige só dígitos, sem "+".
export const WHATSAPP_NUMERO = "5516996282137";

/** Número formatado para leitura humana (rodapé do PDF, textos). */
export const WHATSAPP_DISPLAY = "(16) 99628-2137";

export const WHATSAPP_MENSAGEM_PADRAO =
  "Olá! Vim pelo site da Recurso Fácil e gostaria de tirar uma dúvida.";

export function whatsappHref(mensagem: string = WHATSAPP_MENSAGEM_PADRAO): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
}

/** Link pronto com a mensagem padrão — o caso mais comum. */
export const WHATSAPP_HREF = whatsappHref();
