import type { Locale } from "@/lib/i18n/config";
import { intlLocale } from "@/lib/i18n/config";

/** Formata data ISO ("2025-07-22" ou datetime) para exibição. */
export function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return "";
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return value; // valor livre vindo do admin
  return new Intl.DateTimeFormat(intlLocale(locale), { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

/**
 * value_kz/value_usd chegam como string. Se for numérica, formata com
 * separadores pt-AO; caso contrário mostra como veio (ex.: "70 Mil Milhões Kz").
 */
export function formatMoneyKz(value: string | null | undefined): string {
  return formatMoney(value, "Kz");
}
export function formatMoneyUsd(value: string | null | undefined): string {
  return formatMoney(value, "USD");
}
function formatMoney(value: string | null | undefined, currency: "Kz" | "USD"): string {
  if (!value) return "";
  const trimmed = String(value).trim();
  const numeric = trimmed.replace(/[,\s]/g, "").match(/^\d+(\.\d+)?$/);
  if (!numeric) return trimmed;
  const num = parseFloat(trimmed.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(num)) return trimmed;
  const formatted = new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 }).format(num);
  return currency === "Kz" ? `${formatted} Kz` : `USD ${formatted}`;
}

/** "1.204" → 1204 | "70" → 70 | "4,2 Mil..." → NaN */
export function parseCount(value: string | null | undefined): number {
  if (value === null || value === undefined) return NaN;
  const cleaned = String(value).trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return NaN;
  return parseFloat(cleaned);
}

export function formatSizeKb(size_kb: number | null | undefined): string {
  if (!size_kb || size_kb <= 0) return "";
  if (size_kb < 1024) return `${new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 1 }).format(size_kb)} KB`;
  return `${new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 1 }).format(size_kb / 1024)} MB`;
}

/** Classe do separador da barra de progresso (regra visual do template). */
export function progressColorClass(progress: number): string {
  if (progress >= 100) return "bg-[#27AE60]";
  if (progress < 30) return "bg-[#E74C3C]";
  return "bg-[#E8821A]";
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
