"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  benefitTypes,
  denialReasons,
  benefitLabels,
  denialLabels,
} from "@/lib/validations";
import { maskCPF, maskPhone, onlyDigits } from "@/lib/utils";
import { buscarCep, maskCep } from "@/lib/cep";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

interface FormState {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  benefitType: (typeof benefitTypes)[number] | "";
  denialReason: (typeof denialReasons)[number] | "";
  denialDate: string;
  beneficioNumero: string;
  inssProtocolo: string;
  caseSummary: string;
  hasMedicalReport: boolean;
  medicalCondition: string;
  medicalLimitations: string;
  workHistory: string;
  insuredCategory: string;
  gracePeriodContext: string;
  familyIncome: string;
  householdExpenses: string;
  relationship: string;
  dependencyProof: string;
  missingDocuments: string;
  inssIgnoredDetails: string;
  withdrawalWaived: boolean | null;
  acceptTerms: boolean;
}

const initialState: FormState = {
  fullName: "",
  cpf: "",
  phone: "",
  email: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  benefitType: "",
  denialReason: "",
  denialDate: "",
  beneficioNumero: "",
  inssProtocolo: "",
  caseSummary: "",
  hasMedicalReport: false,
  medicalCondition: "",
  medicalLimitations: "",
  workHistory: "",
  insuredCategory: "",
  gracePeriodContext: "",
  familyIncome: "",
  householdExpenses: "",
  relationship: "",
  dependencyProof: "",
  missingDocuments: "",
  inssIgnoredDetails: "",
  withdrawalWaived: null,
  acceptTerms: false,
};

export function AppealForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const scenarioHint = getScenarioHint(state);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  /**
   * Ao completar 8 dígitos, busca o endereço e preenche os campos.
   * Se o CEP não for encontrado, deixa a pessoa digitar manualmente em vez de
   * bloquear — CEPs novos às vezes não estão na base.
   */
  async function onCepChange(value: string) {
    const digits = onlyDigits(value).slice(0, 8);
    set("cep", digits);
    if (digits.length !== 8) return;

    setBuscandoCep(true);
    const endereco = await buscarCep(digits);
    setBuscandoCep(false);
    if (!endereco) return;

    setState((s) => ({
      ...s,
      street: endereco.street || s.street,
      neighborhood: endereco.neighborhood || s.neighborhood,
      city: endereco.city || s.city,
      state: endereco.state || s.state,
    }));
  }

  function validateStep(s: Step) {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (state.fullName.trim().length < 3) e.fullName = "Informe o nome completo";
      if (onlyDigits(state.cpf).length !== 11) e.cpf = "CPF inválido";
      if (onlyDigits(state.phone).length < 10) e.phone = "Telefone inválido";
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(state.email)) e.email = "E-mail inválido";
      if (onlyDigits(state.cep).length !== 8) e.cep = "CEP deve ter 8 dígitos";
      if (state.street.trim().length < 2) e.street = "Informe a rua";
      if (state.number.trim().length < 1) e.number = "Informe o número";
      if (state.neighborhood.trim().length < 2) e.neighborhood = "Informe o bairro";
      if (state.city.trim().length < 2) e.city = "Informe a cidade";
      if (state.state.trim().length !== 2) e.state = "UF";
    }
    if (s === 2) {
      if (!state.benefitType) e.benefitType = "Selecione o benefício";
      if (!state.denialReason) e.denialReason = "Selecione o motivo";
    }
    if (s === 3) {
      if (state.caseSummary.trim().length < 50)
        e.caseSummary = "Descreva com mais detalhes (mín. 50 caracteres)";
    }
    if (s === 4) {
      if (state.withdrawalWaived === null)
        e.withdrawalWaived = "Escolha um dos prazos de entrega";
      if (!state.acceptTerms)
        e.acceptTerms = "Você precisa aceitar os termos para prosseguir";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1) as Step);
  }

  function back() {
    setStep((s) => Math.max(1, s - 1) as Step);
  }

  async function submit() {
    if (!validateStep(4)) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/recursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          cpf: onlyDigits(state.cpf),
          phone: onlyDigits(state.phone),
          cep: onlyDigits(state.cep),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Erro ao criar recurso");
      }
      const { appealId, checkoutUrl } = await res.json();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        router.push(`/dashboard/recursos/${appealId}`);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Stepper step={step} />

      <div className="card mt-6">
        <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Fluxo guiado
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-700">
            {scenarioHint}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="mt-6">
              <h2 className="font-display text-xl font-semibold text-ink-950">Seus dados</h2>
              <p className="mt-1 text-sm text-ink-600">
                Esses dados ajudam a montar a identificação correta do recurso e liberar sua área do cliente.
              </p>
            </div>
            <div>
              <Label>Nome completo</Label>
              <Input
                value={state.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Como consta no RG/CPF"
              />
              <FieldError>{errors.fullName}</FieldError>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>CPF</Label>
                <Input
                  value={maskCPF(state.cpf)}
                  onChange={(e) => set("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
                <FieldError>{errors.cpf}</FieldError>
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={maskPhone(state.phone)}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                />
                <FieldError>{errors.phone}</FieldError>
              </div>
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={state.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="voce@email.com"
              />
              <FieldError>{errors.email}</FieldError>
            </div>

            <div className="mt-8 border-t border-ink-100 pt-6">
              <h3 className="font-display text-lg font-semibold text-ink-950">Endereço</h3>
              <p className="mt-1 text-sm text-ink-600">
                Entra na qualificação do recorrente dentro da peça, como exige o recurso —
                e agiliza seu pagamento depois.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[200px_1fr]">
              <div>
                <Label>CEP</Label>
                <div className="relative">
                  <Input
                    value={maskCep(state.cep)}
                    onChange={(e) => onCepChange(e.target.value)}
                    placeholder="00000-000"
                    inputMode="numeric"
                  />
                  {buscandoCep && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-400" />
                  )}
                </div>
                <FieldError>{errors.cep}</FieldError>
              </div>
              <div className="flex items-end pb-1">
                <p className="text-xs text-ink-500">
                  Digite o CEP que o resto do endereço é preenchido sozinho.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_140px]">
              <div>
                <Label>Rua</Label>
                <Input
                  value={state.street}
                  onChange={(e) => set("street", e.target.value)}
                  placeholder="Nome da rua"
                />
                <FieldError>{errors.street}</FieldError>
              </div>
              <div>
                <Label>Número</Label>
                <Input
                  value={state.number}
                  onChange={(e) => set("number", e.target.value)}
                  placeholder="123"
                />
                <FieldError>{errors.number}</FieldError>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Complemento (opcional)</Label>
                <Input
                  value={state.complement}
                  onChange={(e) => set("complement", e.target.value)}
                  placeholder="Apto, bloco, fundos…"
                />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input
                  value={state.neighborhood}
                  onChange={(e) => set("neighborhood", e.target.value)}
                />
                <FieldError>{errors.neighborhood}</FieldError>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_120px]">
              <div>
                <Label>Cidade</Label>
                <Input
                  value={state.city}
                  onChange={(e) => set("city", e.target.value)}
                />
                <FieldError>{errors.city}</FieldError>
              </div>
              <div>
                <Label>UF</Label>
                <Input
                  value={state.state}
                  onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SP"
                  maxLength={2}
                />
                <FieldError>{errors.state}</FieldError>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="mt-6">
              <h2 className="font-display text-xl font-semibold text-ink-950">Sobre o benefício</h2>
              <p className="mt-1 text-sm text-ink-600">
                Aqui a plataforma entende qual tese jurídica precisa priorizar na construção do recurso.
              </p>
            </div>
            <div>
              <Label>Benefício pleiteado</Label>
              <select
                className="input"
                value={state.benefitType}
                onChange={(e) => set("benefitType", e.target.value as any)}
              >
                <option value="">Selecione…</option>
                {benefitTypes.map((b) => (
                  <option key={b} value={b}>{benefitLabels[b]}</option>
                ))}
              </select>
              <FieldError>{errors.benefitType}</FieldError>
            </div>
            <div>
              <Label>Motivo da negativa do INSS</Label>
              <select
                className="input"
                value={state.denialReason}
                onChange={(e) => set("denialReason", e.target.value as any)}
              >
                <option value="">Selecione…</option>
                {denialReasons.map((r) => (
                  <option key={r} value={r}>{denialLabels[r]}</option>
                ))}
              </select>
              <FieldError>{errors.denialReason}</FieldError>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Data do indeferimento</Label>
                <Input
                  type="date"
                  value={state.denialDate}
                  onChange={(e) => set("denialDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Nº do benefício (se houver)</Label>
                <Input
                  value={state.beneficioNumero}
                  onChange={(e) => set("beneficioNumero", e.target.value)}
                />
              </div>
              <div>
                <Label>Protocolo INSS</Label>
                <Input
                  value={state.inssProtocolo}
                  onChange={(e) => set("inssProtocolo", e.target.value)}
                />
              </div>
            </div>
            <ConditionalFields state={state} set={set} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="mt-6">
              <h2 className="font-display text-xl font-semibold text-ink-950">Conte seu caso</h2>
              <p className="mt-1 text-sm text-ink-600">
                Quanto mais concreto for seu relato, melhor a plataforma consegue organizar argumentos e pedidos.
              </p>
            </div>
            <p className="text-sm text-ink-600">
              Descreva livremente: histórico, provas que possui, quando começou,
              e tudo que considere relevante. Quanto mais contexto, melhor o recurso.
            </p>
            <div>
              <Label>Relato do caso</Label>
              <Textarea
                rows={10}
                value={state.caseSummary}
                onChange={(e) => set("caseSummary", e.target.value)}
                placeholder="Ex: Estou afastada desde junho/2024 por problemas na coluna, tenho laudos do ortopedista e..."
              />
              <div className="flex items-center justify-between">
                <FieldError>{errors.caseSummary}</FieldError>
                <span className="mt-1 text-xs text-ink-500">
                  {state.caseSummary.length} caracteres
                </span>
              </div>
            </div>
            <div>
              <Label>O que o INSS não analisou bem ou deixou de considerar?</Label>
              <Textarea
                rows={4}
                value={state.inssIgnoredDetails}
                onChange={(e) => set("inssIgnoredDetails", e.target.value)}
                placeholder="Ex: não considerou meu laudo mais recente, ignorou vínculos do CNIS, não explicou quais documentos faltavam..."
              />
            </div>
            <div className="rounded-xl border border-dashed border-ink-200 p-4 text-sm text-ink-600">
              <p className="font-semibold text-ink-800">📎 Documentos (opcional nesta etapa)</p>
              <p className="mt-1">
                Após criar o recurso você poderá anexar documentos (CNIS, laudos, decisão do INSS)
                na sua área do cliente. O ideal é ter ao menos a carta de indeferimento.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="mt-6">
              <h2 className="font-display text-xl font-semibold text-ink-950">Revisão e pagamento</h2>
              <p className="mt-1 text-sm text-ink-600">
                Confira os dados principais antes de seguir. O recurso será gerado com base nessas informações.
              </p>
            </div>
            <Review state={state} />

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>Atenção ao prazo do INSS:</strong> você tem 30 dias corridos a partir
              da ciência da decisão para apresentar o recurso administrativo. Escolha abaixo
              o prazo de entrega considerando essa janela.
            </div>

            <div>
              <Label>Prazo de entrega do recurso</Label>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-xl border p-4 text-sm transition ${
                    state.withdrawalWaived === true
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                      : "border-ink-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="withdrawalWaived"
                    className="sr-only"
                    checked={state.withdrawalWaived === true}
                    onChange={() => set("withdrawalWaived", true)}
                  />
                  <p className="font-semibold text-ink-900">Receber em até 24h</p>
                  <p className="mt-1 text-ink-600">
                    Abro mão do prazo de arrependimento de 7 dias (art. 49 do CDC) e quero
                    receber o recurso o quanto antes.
                  </p>
                </label>
                <label
                  className={`cursor-pointer rounded-xl border p-4 text-sm transition ${
                    state.withdrawalWaived === false
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                      : "border-ink-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="withdrawalWaived"
                    className="sr-only"
                    checked={state.withdrawalWaived === false}
                    onChange={() => set("withdrawalWaived", false)}
                  />
                  <p className="font-semibold text-ink-900">Receber em até 8 dias</p>
                  <p className="mt-1 text-ink-600">
                    Mantenho meu prazo de arrependimento de 7 dias (art. 49 do CDC) antes de
                    receber o recurso.
                  </p>
                </label>
              </div>
              <FieldError>{errors.withdrawalWaived}</FieldError>
            </div>

            <label className="flex items-start gap-3 rounded-xl bg-ink-50 p-4 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                checked={state.acceptTerms}
                onChange={(e) => set("acceptTerms", e.target.checked)}
              />
              <span className="text-ink-700">
                Declaro que as informações prestadas são verdadeiras e autorizo o
                tratamento dos meus dados conforme a <a href="/privacidade" className="text-brand-700 underline">Política de Privacidade</a>.
                Estou ciente de que o documento gerado deve ser revisado antes do protocolo.
              </span>
            </label>
            <FieldError>{errors.acceptTerms}</FieldError>
            {serverError && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 1 || submitting}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          {step < 4 ? (
            <Button onClick={next} type="button">
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} type="button" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processando…
                </>
              ) : (
                <>Ir para pagamento <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Dados", "Benefício", "Caso", "Revisão"];
  return (
    <ol className="flex items-center gap-2">
      {labels.map((label, idx) => {
        const s = (idx + 1) as Step;
        const active = step === s;
        const done = step > s;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold
                ${done ? "bg-brand-600 text-white" : active ? "bg-brand-100 text-brand-800" : "bg-ink-100 text-ink-500"}`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : s}
            </span>
            <span className={`text-xs ${active ? "font-semibold text-ink-950" : "text-ink-500"}`}>
              {label}
            </span>
            {idx < labels.length - 1 && (
              <div className={`ml-2 h-0.5 flex-1 ${done ? "bg-brand-400" : "bg-ink-100"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ConditionalFields({
  state,
  set,
}: {
  state: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const needsMedical =
    state.benefitType === "AUXILIO_DOENCA" ||
    state.benefitType === "AUXILIO_ACIDENTE" ||
    state.benefitType === "APOSENTADORIA_INVALIDEZ" ||
    state.denialReason === "AUSENCIA_INCAPACIDADE";

  const needsWorkHistory =
    state.benefitType === "APOSENTADORIA_TEMPO" ||
    state.benefitType === "APOSENTADORIA_ESPECIAL" ||
    state.denialReason === "TEMPO_CONTRIBUICAO_INSUFICIENTE" ||
    state.denialReason === "NAO_CUMPRIMENTO_CARENCIA" ||
    state.denialReason === "FALTA_QUALIDADE_SEGURADO";

  const needsIncome =
    state.benefitType === "BPC_LOAS" ||
    state.denialReason === "RENDA_FAMILIAR_SUPERIOR";

  const needsRelationship =
    state.benefitType === "PENSAO_MORTE" ||
    state.denialReason === "VINCULO_NAO_COMPROVADO";

  const needsDocumentGap =
    state.denialReason === "DOC_INSUFICIENTE";

  const needsGracePeriod =
    state.denialReason === "FALTA_QUALIDADE_SEGURADO";

  const needsInsuredCategory =
    state.denialReason === "NAO_CUMPRIMENTO_CARENCIA" ||
    state.denialReason === "FALTA_QUALIDADE_SEGURADO" ||
    state.benefitType === "SALARIO_MATERNIDADE";

  if (!needsMedical && !needsWorkHistory && !needsIncome && !needsRelationship && !needsDocumentGap && !needsGracePeriod && !needsInsuredCategory)
    return null;

  return (
    <div className="rounded-xl bg-ink-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-ink-900">Informações específicas do seu caso</p>
      <p className="text-sm leading-relaxed text-ink-600">
        Essas respostas ajudam a plataforma a sair do genérico e montar um recurso mais aderente ao seu cenário.
      </p>

      {needsMedical && (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.hasMedicalReport}
              onChange={(e) => set("hasMedicalReport", e.target.checked)}
            />
            Possuo laudos médicos que comprovam a condição
          </label>
          <div>
            <Label>CID / Condição médica principal</Label>
            <Input
              value={state.medicalCondition}
              onChange={(e) => set("medicalCondition", e.target.value)}
              placeholder="Ex: hérnia de disco lombar, ansiedade, CID se tiver em mãos..."
            />
          </div>
          <div>
            <Label>Quais limitações isso causa no trabalho ou na rotina?</Label>
            <Textarea
              rows={3}
              value={state.medicalLimitations}
              onChange={(e) => set("medicalLimitations", e.target.value)}
              placeholder="Ex: não consigo permanecer em pé, carregar peso, fazer movimentos repetitivos..."
            />
          </div>
        </>
      )}

      {needsWorkHistory && (
        <div>
          <Label>Histórico de contribuições / vínculos</Label>
          <Textarea
            rows={3}
            value={state.workHistory}
            onChange={(e) => set("workHistory", e.target.value)}
            placeholder="Ex: trabalhei com carteira assinada de 2018 a 2024, tive recolhimentos como MEI, fiquei desempregada por um período..."
          />
        </div>
      )}

      {needsInsuredCategory && (
        <div>
          <Label>Qual era sua categoria previdenciária na época do pedido?</Label>
          <Input
            value={state.insuredCategory}
            onChange={(e) => set("insuredCategory", e.target.value)}
            placeholder="Ex: CLT, contribuinte individual, MEI, segurada especial, desempregada em período de graça..."
          />
        </div>
      )}

      {needsGracePeriod && (
        <div>
          <Label>Explique por que você entende que ainda mantinha a qualidade de segurado</Label>
          <Textarea
            rows={3}
            value={state.gracePeriodContext}
            onChange={(e) => set("gracePeriodContext", e.target.value)}
            placeholder="Ex: tinha vínculos recentes, estava em período de graça, havia recolhimentos próximos ao requerimento..."
          />
        </div>
      )}

      {needsIncome && (
        <>
          <div>
            <Label>Composição e renda familiar</Label>
          <Input
            value={state.familyIncome}
            onChange={(e) => set("familyIncome", e.target.value)}
            placeholder="Ex: moro com minha mãe e um filho, renda informal média de R$ 1.200,00"
          />
        </div>
          <div>
            <Label>Quais despesas essenciais pesam mais no orçamento?</Label>
            <Textarea
              rows={3}
              value={state.householdExpenses}
              onChange={(e) => set("householdExpenses", e.target.value)}
              placeholder="Ex: aluguel, remédios, alimentação, fraldas, transporte para tratamento..."
            />
          </div>
        </>
      )}

      {needsRelationship && (
        <>
          <div>
            <Label>Relação com o(a) falecido(a) / convivência</Label>
          <Input
            value={state.relationship}
            onChange={(e) => set("relationship", e.target.value)}
            placeholder="Ex: união estável desde 2015, morávamos juntos e temos filhos em comum"
          />
        </div>
          <div>
            <Label>Quais provas dessa relação ou dependência você possui?</Label>
            <Textarea
              rows={3}
              value={state.dependencyProof}
              onChange={(e) => set("dependencyProof", e.target.value)}
              placeholder="Ex: contas no mesmo endereço, fotos, filhos em comum, declaração, certidões, comprovantes..."
            />
          </div>
        </>
      )}

      {needsDocumentGap && (
        <div>
          <Label>Quais documentos o INSS disse que faltavam, ou o que você acredita que ele desconsiderou?</Label>
          <Textarea
            rows={3}
            value={state.missingDocuments}
            onChange={(e) => set("missingDocuments", e.target.value)}
            placeholder="Ex: laudo atualizado, CNIS, certidão, comprovante de união estável, comprovantes de renda..."
          />
        </div>
      )}
    </div>
  );
}

function Review({ state }: { state: FormState }) {
  const row = (k: string, v: string | undefined | null) =>
    v ? (
      <div className="flex justify-between gap-4 py-2 text-sm">
        <span className="text-ink-500">{k}</span>
        <span className="text-right font-medium text-ink-900">{v}</span>
      </div>
    ) : null;

  return (
    <div className="rounded-xl border border-ink-100">
      <div className="divide-y divide-ink-100 px-4">
        {row("Nome", state.fullName)}
        {row("CPF", state.cpf ? maskCPF(state.cpf) : "")}
        {row("E-mail", state.email)}
        {row("Telefone", state.phone ? maskPhone(state.phone) : "")}
        {row("Benefício", state.benefitType ? benefitLabels[state.benefitType] : "")}
        {row("Motivo", state.denialReason ? denialLabels[state.denialReason] : "")}
        {row("Data do indeferimento", state.denialDate)}
        {row("Categoria previdenciária", state.insuredCategory)}
      </div>
      <div className="border-t border-ink-100 bg-ink-50/70 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
          Resumo do que vai entrar no recurso
        </p>
        <ul className="mt-3 space-y-2 text-sm text-ink-700">
          <li className="flex gap-2">
            <span className="text-brand-600">•</span>
            <span>Identificação do benefício e do motivo da negativa</span>
          </li>
          <li className="flex gap-2">
            <span className="text-brand-600">•</span>
            <span>Relato do caso e informações específicas preenchidas por você</span>
          </li>
          <li className="flex gap-2">
            <span className="text-brand-600">•</span>
            <span>Argumentação jurídica alinhada ao cenário informado</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function getScenarioHint(state: FormState) {
  if (state.benefitType === "BPC_LOAS" || state.denialReason === "RENDA_FAMILIAR_SUPERIOR") {
    return "Vamos entender a composição familiar, a renda real da casa e os gastos essenciais que podem mudar a leitura do caso.";
  }

  if (state.benefitType === "PENSAO_MORTE") {
    return "Vamos organizar a relação com o falecido, as provas de dependência e o que o INSS deixou de considerar na análise.";
  }

  if (state.benefitType === "SALARIO_MATERNIDADE") {
    return "Vamos identificar sua categoria previdenciária, histórico contributivo e o ponto exato em que a decisão do INSS pode estar falhando.";
  }

  if (state.denialReason === "FALTA_QUALIDADE_SEGURADO") {
    return "Vamos revisar vínculos, recolhimentos e período de graça para verificar se a perda da qualidade de segurado foi realmente bem analisada.";
  }

  if (state.denialReason === "NAO_CUMPRIMENTO_CARENCIA") {
    return "Vamos organizar o histórico contributivo e mostrar onde o cálculo de carência pode ter sido mal interpretado.";
  }

  if (state.denialReason === "AUSENCIA_INCAPACIDADE") {
    return "Vamos destacar a condição médica, as limitações funcionais e o impacto disso no trabalho habitual.";
  }

  if (state.denialReason === "DOC_INSUFICIENTE") {
    return "Vamos mapear o que foi apresentado, o que o INSS disse que faltava e quais pontos merecem reforço no recurso.";
  }

  return "Responda com calma. A plataforma usa essas informações para montar um recurso mais claro, organizado e aderente ao seu caso.";
}
