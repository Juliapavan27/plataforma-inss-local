/**
 * Efeitos do cancelamento/reembolso sobre a nota fiscal.
 *
 * Nota já emitida de venda desfeita precisa ser cancelada na prefeitura, senão
 * fica imposto pago sobre receita que não existe. Nota ainda não emitida de
 * venda desfeita simplesmente não deve ser emitida.
 *
 * Nenhum dos dois pode derrubar o cancelamento em si: para o cliente, o pedido
 * cancelou. O acerto fiscal é problema nosso, e vira pendência no painel.
 */
import { db } from "./db";
import { logger } from "./logger";

export async function marcarNotaAposCancelamento(appealId: string) {
  try {
    const pagamento = await db.payment.findUnique({ where: { appealId } });
    if (!pagamento) return;

    if (pagamento.nfStatus === "EMITIDA") {
      await db.payment.update({
        where: { id: pagamento.id },
        data: {
          nfStatus: "CANCELAR",
          nfObservacao: "Pedido cancelado/reembolsado após a emissão da nota.",
        },
      });
      return;
    }

    // Ainda não emitida: sai da fila para não gerar nota de venda desfeita.
    if (pagamento.nfStatus === "PENDENTE") {
      await db.payment.update({
        where: { id: pagamento.id },
        data: {
          nfStatus: "DISPENSADA",
          nfObservacao: "Pedido cancelado antes da emissão.",
        },
      });
    }
  } catch (e) {
    logger.error("notaFiscal.aposCancelamento falhou", e, { appealId });
  }
}
