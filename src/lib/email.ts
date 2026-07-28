/**
 * Envio de e-mail via Resend. Sem RESEND_API_KEY, todas as funções são no-op
 * (apenas logam) — mesmo padrão de "recurso opcional" usado em stripe.ts/storage.ts.
 */
import { Resend } from "resend";
import { logger } from "./logger";
import { formatCurrencyBRL, formatDateBR } from "./utils";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = process.env.EMAIL_FROM ?? "Recurso Fácil <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export function isEmailConfigured() {
  return resend !== null;
}

interface Attachment {
  filename: string;
  content: Buffer;
}

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}) {
  if (!resend) {
    logger.warn("email.skip (RESEND_API_KEY não configurado)", {
      to: opts.to,
      subject: opts.subject,
    });
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments,
    });
    // O SDK do Resend não lança exceção em erro de API — vem como { error } no retorno.
    // error é um objeto plano (não Error), então passa como ctx pra não virar "[object Object]" no log.
    if (error) {
      logger.error("email.send falhou", undefined, {
        to: opts.to,
        subject: opts.subject,
        resendError: { name: error.name, message: error.message },
      });
    }
  } catch (err) {
    logger.error("email.send falhou", err, { to: opts.to, subject: opts.subject });
  }
}

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="pt-BR"><body style="font-family:system-ui,sans-serif;background:#faf9f7;padding:24px;color:#171717">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e5e5">
<h1 style="font-size:18px;margin:0 0 16px">${title}</h1>
${bodyHtml}
<p style="margin-top:32px;font-size:12px;color:#a3a3a3">Recurso Fácil — plataforma privada e independente, sem vínculo com o INSS.</p>
</div></body></html>`;
}

/** Avisa o admin (ADMIN_EMAIL) que um pedido pago está aguardando geração manual. */
export async function sendAdminNewOrderEmail(appeal: {
  id: string;
  userName: string;
  dueAt: Date | null;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  await send({
    to: adminEmail,
    subject: `Novo pedido pago — ${appeal.userName}`,
    html: layout(
      "Novo pedido pago",
      `<p>${appeal.userName} pagou e está aguardando a geração do recurso.</p>
       <p><strong>Prazo de entrega:</strong> ${appeal.dueAt ? formatDateBR(appeal.dueAt) : "não definido"}</p>
       <p><a href="${APP_URL}/admin/pedidos" style="color:#2d43e0">Abrir painel admin</a></p>`,
    ),
  });
}

/** Avisa o cliente que o recurso ficou pronto, anexando o PDF e o DOCX. */
export async function sendAppealReadyEmail(opts: {
  to: string;
  appealId: string;
  pdfBuffer: Buffer;
  docxBuffer: Buffer;
}) {
  await send({
    to: opts.to,
    subject: "Seu recurso está pronto",
    html: layout(
      "Seu recurso está pronto!",
      `<p>Seu recurso administrativo está em anexo, em PDF e Word — e também disponível na sua área do cliente.</p>
       <p><a href="${APP_URL}/dashboard/recursos/${opts.appealId}" style="color:#2d43e0">Abrir minha área do cliente</a></p>`,
    ),
    attachments: [
      { filename: "recurso.pdf", content: opts.pdfBuffer },
      { filename: "recurso.docx", content: opts.docxBuffer },
    ],
  });
}

/** Avisa o admin que um cliente pediu reembolso. */
export async function sendAdminRefundRequestEmail(opts: {
  appealId: string;
  userName: string;
  reason: string;
  amountCents: number;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  await send({
    to: adminEmail,
    subject: `Pedido de reembolso — ${opts.userName}`,
    html: layout(
      "Novo pedido de reembolso",
      `<p><strong>${opts.userName}</strong> solicitou reembolso de ${formatCurrencyBRL(opts.amountCents)}.</p>
       <p><strong>Motivo informado:</strong><br>${opts.reason}</p>
       <p><a href="${APP_URL}/dashboard/recursos/${opts.appealId}" style="color:#2d43e0">Analisar solicitação</a></p>`,
    ),
  });
}

/** Comunica ao cliente a decisão sobre o reembolso. */
export async function sendRefundDecisionEmail(opts: {
  to: string;
  name: string;
  approved: boolean;
  note: string | null;
}) {
  await send({
    to: opts.to,
    subject: opts.approved
      ? "Seu reembolso foi aprovado"
      : "Sobre sua solicitação de reembolso",
    html: layout(
      opts.approved ? "Reembolso aprovado" : "Sobre sua solicitação",
      opts.approved
        ? `<p>Olá, ${opts.name}. Seu pedido de reembolso foi aprovado e o pedido foi cancelado.</p>
           <p>O estorno será processado pelo meio de pagamento usado na compra. O prazo até o valor aparecer na sua fatura ou conta varia conforme o banco/operadora (normalmente até 2 faturas, no caso de cartão de crédito).</p>
           ${opts.note ? `<p><strong>Observação:</strong> ${opts.note}</p>` : ""}`
        : `<p>Olá, ${opts.name}. Analisamos sua solicitação de reembolso e, desta vez, não foi possível aprová-la.</p>
           ${opts.note ? `<p><strong>Motivo:</strong> ${opts.note}</p>` : ""}
           <p>Se você discorda dessa análise ou quer conversar sobre o caso, é só responder este e-mail ou falar com a gente pelo WhatsApp.</p>`,
    ),
  });
}

/** E-mail de recuperação de carrinho abandonado, com cupom de 10%. */
export async function sendAbandonedCartEmail(opts: {
  to: string;
  name: string;
  checkoutUrl: string;
  amountCents: number;
  discountedCents: number;
}) {
  await send({
    to: opts.to,
    subject: "Você deixou seu recurso pela metade — 10% de desconto pra concluir",
    html: layout(
      "Notamos que você não finalizou",
      `<p>Olá, ${opts.name}. Você começou a gerar seu recurso administrativo mas não concluiu o pagamento.</p>
       <p>Preparamos um cupom exclusivo de <strong>10% de desconto</strong>: de ${formatCurrencyBRL(opts.amountCents)} por <strong>${formatCurrencyBRL(opts.discountedCents)}</strong>.</p>
       <p><a href="${opts.checkoutUrl}" style="color:#2d43e0">Concluir com desconto</a></p>
       <p style="font-size:12px;color:#a3a3a3">Lembre-se: o prazo para recorrer de uma decisão do INSS é de 30 dias corridos a partir da ciência da decisão.</p>`,
    ),
  });
}
