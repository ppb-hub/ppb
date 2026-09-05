import type { Locale } from "@/lib/i18n/config";

/**
 * Helpers para dados bilíngues do backend (campos `foo_pt` / `foo_en`).
 * O idioma do URL é o que decide qual campo usar — com fallback para o
 * outro idioma quando o campo pedido vem vazio.
 */
export function bi(obj: object | null | undefined, base: string, lang: Locale): string {
  if (!obj) return "";
  const rec = obj as Record<string, unknown>;
  const other: Locale = lang === "pt" ? "en" : "pt";
  const primary = rec[`${base}_${lang}`];
  if (typeof primary === "string" && primary.trim()) return primary;
  const fallback = rec[`${base}_${other}`];
  if (typeof fallback === "string" && fallback.trim()) return fallback;
  return "";
}

export function biOrNull(obj: object | null | undefined, base: string, lang: Locale): string | null {
  const v = bi(obj, base, lang);
  return v || null;
}

/** Divisão em parágrafos de textos longos da API (aceita \n\n ou \n). */
export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => {
      // listas simples "1. ...\n2. ..." dentro do mesmo bloco → manter junto
      return p.includes("\n") ? [p] : [p];
    });
}

/** Linhas (para "Valores" com um valor por linha). */
export function lines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}
