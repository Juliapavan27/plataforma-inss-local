/**
 * Union types que substituem os enums do Prisma (SQLite não suporta enums nativos).
 * Mantenha em sincronia com os comentários do schema.prisma.
 */

export type Role = "USER" | "ADMIN";

export type BenefitType =
  | "APOSENTADORIA_IDADE"
  | "APOSENTADORIA_TEMPO"
  | "APOSENTADORIA_INVALIDEZ"
  | "APOSENTADORIA_ESPECIAL"
  | "AUXILIO_DOENCA"
  | "AUXILIO_ACIDENTE"
  | "BPC_LOAS"
  | "PENSAO_MORTE"
  | "SALARIO_MATERNIDADE"
  | "OUTRO";

export type DenialReason =
  | "NAO_CUMPRIMENTO_CARENCIA"
  | "FALTA_QUALIDADE_SEGURADO"
  | "AUSENCIA_INCAPACIDADE"
  | "TEMPO_CONTRIBUICAO_INSUFICIENTE"
  | "RENDA_FAMILIAR_SUPERIOR"
  | "VINCULO_NAO_COMPROVADO"
  | "DOC_INSUFICIENTE"
  | "OUTRO";

export type AppealStatus =
  | "DRAFT"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "GENERATING"
  | "READY"
  | "FAILED"
  | "CANCELED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type KnowledgeKind =
  | "JURISPRUDENCIA"
  | "DOUTRINA"
  | "LEGISLACAO"
  | "MODELO_RECURSO"
  | "OUTRO";
