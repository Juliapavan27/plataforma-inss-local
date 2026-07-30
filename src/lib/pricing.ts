/**
 * Preço do recurso.
 *
 * São DOIS valores porque a InfinitePay repassa a taxa do cartão ao comprador,
 * por cima do valor configurado (~6,35% em 1x). Se cobrássemos R$ 299 de base,
 * o cliente veria R$ 318 no cartão — mais caro que o anunciado, o que viola o
 * art. 30 do CDC (a publicidade vincula).
 *
 * Então configuramos a base em R$ 281 (preço do Pix) e anunciamos R$ 299 como
 * preço do cartão. Na prática o cartão sai por ~R$ 298,86: o cliente sempre
 * paga igual ou menos que o anunciado, nunca mais.
 *
 * Cobrar preço diferente por meio de pagamento é permitido (Lei 13.455/2017),
 * desde que informado com clareza — por isso os dois valores aparecem juntos
 * em todo lugar onde falamos de preço.
 *
 * ATENÇÃO: se a taxa da InfinitePay mudar, PRICE_CARD_CENTS deixa de bater com
 * a cobrança real. Conferir periodicamente, ou ao trocar de provedor.
 */

/** Valor efetivamente cobrado (base enviada ao provedor). É o preço no Pix. */
export const PRICE_PIX_CENTS = Number(process.env.PRICE_RECURSO_CENTS ?? 28100);

/** Valor anunciado para cartão à vista, já considerando o repasse da taxa. */
export const PRICE_CARD_CENTS = Number(process.env.PRICE_CARD_CENTS ?? 29900);

/** Desconto do Pix em relação ao cartão, arredondado para exibição. */
export const PIX_DISCOUNT_PERCENT = Math.round(
  ((PRICE_CARD_CENTS - PRICE_PIX_CENTS) / PRICE_CARD_CENTS) * 100,
);
