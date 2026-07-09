import { z } from "zod";

export const benefitTypes = [
  "APOSENTADORIA_IDADE",
  "APOSENTADORIA_TEMPO",
  "APOSENTADORIA_INVALIDEZ",
  "APOSENTADORIA_ESPECIAL",
  "AUXILIO_DOENCA",
  "AUXILIO_ACIDENTE",
  "BPC_LOAS",
  "PENSAO_MORTE",
  "SALARIO_MATERNIDADE",
  "OUTRO",
] as const;

export const denialReasons = [
  "NAO_CUMPRIMENTO_CARENCIA",
  "FALTA_QUALIDADE_SEGURADO",
  "AUSENCIA_INCAPACIDADE",
  "TEMPO_CONTRIBUICAO_INSUFICIENTE",
  "RENDA_FAMILIAR_SUPERIOR",
  "VINCULO_NAO_COMPROVADO",
  "DOC_INSUFICIENTE",
  "OUTRO",
] as const;

export const benefitLabels: Record<(typeof benefitTypes)[number], string> = {
  APOSENTADORIA_IDADE: "Aposentadoria por Idade",
  APOSENTADORIA_TEMPO: "Aposentadoria por Tempo de Contribuição",
  APOSENTADORIA_INVALIDEZ: "Aposentadoria por Invalidez (Incapacidade Permanente)",
  APOSENTADORIA_ESPECIAL: "Aposentadoria Especial",
  AUXILIO_DOENCA: "Auxílio por Incapacidade Temporária (Auxílio-Doença)",
  AUXILIO_ACIDENTE: "Auxílio-Acidente",
  BPC_LOAS: "BPC/LOAS",
  PENSAO_MORTE: "Pensão por Morte",
  SALARIO_MATERNIDADE: "Salário-Maternidade",
  OUTRO: "Outro benefício",
};

export const denialLabels: Record<(typeof denialReasons)[number], string> = {
  NAO_CUMPRIMENTO_CARENCIA: "Não cumprimento da carência",
  FALTA_QUALIDADE_SEGURADO: "Perda da qualidade de segurado",
  AUSENCIA_INCAPACIDADE: "Não reconhecimento de incapacidade",
  TEMPO_CONTRIBUICAO_INSUFICIENTE: "Tempo de contribuição insuficiente",
  RENDA_FAMILIAR_SUPERIOR: "Renda familiar per capita superior ao permitido",
  VINCULO_NAO_COMPROVADO: "Vínculo/União estável não comprovado",
  DOC_INSUFICIENTE: "Documentação insuficiente",
  OUTRO: "Outro motivo",
};

// ========== Schemas ==========

export const registerSchema = z.object({
  name: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const appealCreateSchema = z.object({
  // dados pessoais
  fullName: z.string().min(3),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  phone: z.string().min(10),
  email: z.string().email(),

  // caso
  benefitType: z.enum(benefitTypes),
  denialReason: z.enum(denialReasons),
  denialDate: z.string().optional(),
  beneficioNumero: z.string().optional(),
  inssProtocolo: z.string().optional(),
  caseSummary: z
    .string()
    .min(50, "Descreva seu caso em pelo menos 50 caracteres"),

  // CDC art. 49 — direito de arrependimento (7 dias) em compra fora do estabelecimento.
  // true = abre mão do prazo de 7 dias e recebe em até 24h; false = mantém o direito e recebe em até 8 dias.
  withdrawalWaived: z.boolean(),

  // campos condicionais
  hasMedicalReport: z.boolean().optional(),
  medicalCondition: z.string().optional(),
  medicalLimitations: z.string().optional(),
  workHistory: z.string().optional(),
  insuredCategory: z.string().optional(),
  gracePeriodContext: z.string().optional(),
  familyIncome: z.string().optional(),
  householdExpenses: z.string().optional(),
  relationship: z.string().optional(),
  dependencyProof: z.string().optional(),
  missingDocuments: z.string().optional(),
  inssIgnoredDetails: z.string().optional(),
});

export type AppealCreateInput = z.infer<typeof appealCreateSchema>;
