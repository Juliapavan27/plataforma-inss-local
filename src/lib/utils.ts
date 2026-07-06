import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatDateBR(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTimeBR(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function onlyDigits(s: string) {
  return s.replace(/\D+/g, "");
}

export function maskCPF(s: string) {
  const d = onlyDigits(s).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2");
}

export function maskPhone(s: string) {
  const d = onlyDigits(s).slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}
