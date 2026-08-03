/**
 * Controle das notas fiscais de serviço (NFS-e).
 *
 * A emissão é MANUAL: a fundadora emite no portal da prefeitura de Ribeirão
 * Preto, onde já tem o hábito e o certificado. O que o sistema faz é garantir
 * que nenhuma venda passe sem nota — o risco de um controle manual não é
 * errar a nota, é esquecer dela.
 *
 * Por isso toda venda paga nasce como PENDENTE e só sai da lista quando
 * alguém disser o que aconteceu com ela.
 */

export type NfStatus = "PENDENTE" | "EMITIDA" | "CANCELAR" | "CANCELADA" | "DISPENSADA";

export const NF_LABELS: Record<NfStatus, string> = {
  PENDENTE: "Pendente",
  EMITIDA: "Emitida",
  CANCELAR: "Cancelar na prefeitura",
  CANCELADA: "Cancelada",
  DISPENSADA: "Dispensada",
};

/**
 * Prazo interno para emitir, em dias corridos depois do pagamento.
 *
 * Não é o prazo legal — esse depende da legislação municipal e do regime, e
 * quem define é o contador. É um alerta operacional para a nota não envelhecer
 * esquecida na lista.
 */
export const PRAZO_ALERTA_DIAS = 5;

export function diasDesde(data: Date, hoje: Date = new Date()) {
  const MS_DIA = 24 * 60 * 60_000;
  const a = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const b = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((b.getTime() - a.getTime()) / MS_DIA);
}

export interface DadosParaNota {
  nome: string;
  cpf: string | null;
  email: string;
  endereco: string;
  cep: string | null;
  valorCents: number;
  pagoEm: Date | null;
  descricaoServico: string;
}

/** Endereço em uma linha, como se digita no portal. */
export function montarEndereco(u: {
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}) {
  const partes = [
    [u.street, u.number].filter(Boolean).join(", "),
    u.complement,
    u.neighborhood,
    [u.city, u.state].filter(Boolean).join("/"),
  ].filter((p) => p && String(p).trim().length > 0);
  return partes.join(" — ");
}

export function formatarCpf(cpf: string | null | undefined) {
  if (!cpf) return "";
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Bloco de texto pronto para conferir ao preencher o portal.
 *
 * A emissão é digitada à mão num sistema de terceiro; ter tudo num bloco só,
 * copiável de uma vez, evita ir e voltar entre abas e trocar dígito de CPF.
 */
export function blocoParaCopiar(d: DadosParaNota) {
  const valor = (d.valorCents / 100).toFixed(2).replace(".", ",");
  return [
    `Tomador: ${d.nome}`,
    `CPF: ${formatarCpf(d.cpf)}`,
    `E-mail: ${d.email}`,
    d.cep ? `CEP: ${d.cep}` : null,
    d.endereco ? `Endereço: ${d.endereco}` : null,
    `Valor: R$ ${valor}`,
    `Descrição: ${d.descricaoServico}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const DESCRICAO_SERVICO_PADRAO =
  "Elaboração de recurso administrativo previdenciário (peça técnica em PDF e Word).";
