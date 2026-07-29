/**
 * Política de cancelamento e reembolso.
 *
 * Base legal e comercial:
 * - CDC art. 49: direito de arrependimento de 7 dias corridos em compra fora do
 *   estabelecimento (online), contados do recebimento do serviço.
 * - CDC art. 30: a publicidade vincula. O site anuncia "Garantia de 7 dias ou
 *   dinheiro de volta", então essa garantia comercial vale para todos os pedidos,
 *   inclusive para quem escolheu a entrega em 24h (que abre mão apenas do prazo
 *   de arrependimento do art. 49 para permitir a execução imediata do serviço).
 * - Antes da entrega, nada foi executado: o cancelamento é integral e imediato.
 */

export const REFUND_WINDOW_DAYS = 7;

export type RefundEligibility = {
  /** Cancelamento simples, sem pagamento envolvido. */
  canCancel: boolean;
  /** Pode pedir reembolso (há pagamento a devolver). */
  canRequestRefund: boolean;
  /** Explicação em linguagem do cliente. */
  message: string;
  /** Prazo final da garantia, quando aplicável. */
  deadline: Date | null;
};

interface EligibilityInput {
  status: string;
  paidAt: Date | null;
  hasRefundRequest: boolean;
  now?: Date;
}

export function computeRefundEligibility(input: EligibilityInput): RefundEligibility {
  const now = input.now ?? new Date();

  if (input.status === "CANCELED") {
    return {
      canCancel: false,
      canRequestRefund: false,
      message: "Este pedido já foi cancelado.",
      deadline: null,
    };
  }

  if (input.hasRefundRequest) {
    return {
      canCancel: false,
      canRequestRefund: false,
      message: "Você já tem uma solicitação de reembolso em análise para este pedido.",
      deadline: null,
    };
  }

  // Sem pagamento confirmado: cancelamento livre e imediato.
  if (input.status === "AWAITING_PAYMENT" || input.status === "DRAFT") {
    return {
      canCancel: true,
      canRequestRefund: false,
      message: "Como o pagamento ainda não foi confirmado, você pode cancelar agora mesmo, sem custo.",
      deadline: null,
    };
  }

  const deadline = input.paidAt
    ? new Date(input.paidAt.getTime() + REFUND_WINDOW_DAYS * 24 * 60 * 60_000)
    : null;

  // Pago mas ainda não entregue: nada foi executado, reembolso integral.
  if (input.status === "PAID" || input.status === "GENERATING" || input.status === "FAILED") {
    return {
      canCancel: false,
      canRequestRefund: true,
      message: "Seu recurso ainda não foi entregue — você pode cancelar e pedir o reembolso integral.",
      deadline,
    };
  }

  // Entregue: vale a garantia anunciada de 7 dias, contada do pagamento.
  if (input.status === "READY") {
    const withinWindow = deadline ? now <= deadline : false;
    if (withinWindow) {
      return {
        canCancel: false,
        canRequestRefund: true,
        message: `Você está dentro da garantia de ${REFUND_WINDOW_DAYS} dias e pode solicitar o reembolso integral.`,
        deadline,
      };
    }
    return {
      canCancel: false,
      canRequestRefund: false,
      message: `O prazo de garantia de ${REFUND_WINDOW_DAYS} dias já passou. Se houve algum problema com seu recurso, escreva para contato@recursofacil.com — analisamos caso a caso.`,
      deadline,
    };
  }

  return {
    canCancel: false,
    canRequestRefund: false,
    message: "Este pedido não está elegível para cancelamento automático. Escreva para contato@recursofacil.com.",
    deadline: null,
  };
}
