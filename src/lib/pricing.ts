/**
 * Preço do recurso pronto (plano Diamante).
 *
 * No Mercado Pago o valor cobrado é EXATAMENTE o que enviamos — a taxa sai do
 * que a gente recebe, não é somada ao cliente. Por isso Pix e cartão têm o
 * mesmo preço (R$ 197). O cartão ainda permite parcelar em até 12x (as parcelas
 * aparecem no checkout depois que o cliente digita o número do cartão).
 *
 * ATENÇÃO (Railway): se as variáveis PRICE_RECURSO_CENTS e PRICE_CARD_CENTS
 * estiverem definidas no serviço, o valor abaixo NÃO tem efeito — atualize-as
 * lá (ou apague-as para o padrão do código valer).
 */

/** Valor cobrado no Pix (base enviada ao provedor). */
export const PRICE_PIX_CENTS = Number(process.env.PRICE_RECURSO_CENTS ?? 19700);

/** Valor no cartão à vista — igual ao Pix; parcelável em até 12x. */
export const PRICE_CARD_CENTS = Number(process.env.PRICE_CARD_CENTS ?? 19700);

/** Desconto do Pix em relação ao cartão, arredondado para exibição. */
export const PIX_DISCOUNT_PERCENT = Math.round(
  ((PRICE_CARD_CENTS - PRICE_PIX_CENTS) / PRICE_CARD_CENTS) * 100,
);

/**
 * Só anunciamos o desconto do Pix quando ele existe de fato. Se as duas envs
 * ficarem com o mesmo valor (o que acontece enquanto a variável não é
 * atualizada no servidor), o selo diria "0% de desconto".
 */
export const HAS_PIX_DISCOUNT = PIX_DISCOUNT_PERCENT > 0;

/** Número máximo de parcelas no cartão (Diamante). */
export const MAX_INSTALLMENTS = 12;

/**
 * Valor da parcela no máximo de vezes, em centavos (total ÷ 12).
 *
 * É a referência "sem juros" para a vitrine — só é exata na fatura se o
 * Mercado Pago estiver com "parcelamento sem juros até 12x" ativado. Sem isso,
 * o comprador paga juros e a parcela real fica maior; nesse caso, trocar o
 * rótulo por "em até 12x" para não anunciar um número que não se cumpre.
 */
export const INSTALLMENT_CENTS = Math.round(PRICE_CARD_CENTS / MAX_INSTALLMENTS);
