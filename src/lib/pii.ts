/**
 * Utilitários para evitar vazamento de PII (LGPD) em logs, mensagens de erro
 * e telemetria. Toda mensagem que vai para console/DB/Sentry deve passar por
 * `redactPii()` antes.
 */

const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const RG_RE = /\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx]\b/g;
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /\b(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}-?\d{4}\b/g;
const BENEFICIO_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d\b/g;

export function maskCpf(cpf: string | null | undefined): string {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 11) return "***";
  return `***.***.***-${digits.slice(-2)}`;
}

export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Remove/oculta PII de uma string arbitrária (mensagens de erro, payloads).
 */
export function redactPii(input: unknown): string {
  const s = input instanceof Error ? input.message : String(input ?? "");
  return s
    .replace(CPF_RE, "[CPF]")
    .replace(BENEFICIO_RE, "[NB]")
    .replace(RG_RE, "[RG]")
    .replace(EMAIL_RE, "[EMAIL]")
    .replace(PHONE_RE, "[FONE]");
}
