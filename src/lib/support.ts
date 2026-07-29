/** Canal de suporte ao cliente — usado na página de contato, no rodapé e pela Sofia. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "contato@recursofacil.com";

/**
 * Prazo de resposta a DÚVIDAS ENVIADAS POR E-MAIL. Alterar aqui reflete em todo o site.
 *
 * Deliberadamente diferente do prazo de entrega do recurso (24h/8 dias): são coisas
 * distintas e o texto do site precisa deixar isso explícito, senão o cliente entende
 * que o recurso demora 48h.
 */
export const SUPPORT_SLA_HOURS = 48;
