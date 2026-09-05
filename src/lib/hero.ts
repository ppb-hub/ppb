import type { SettingsMap } from "@/types/api";

/** Slide tal como é armazenado na chave `hero_slides` das settings. */
export interface HeroSlide {
  url: string;
  alt_pt: string | null;
  alt_en: string | null;
}

/** Slide pronto para renderizar (URL já resolvido, alt já escolhido por idioma). */
export interface HeroSlideView {
  url: string;
  alt: string;
}

/**
 * Aceita os formatos possíveis do valor de settings:
 *  - JSON string: '[{"url": "...", "alt_pt": "...", "alt_en": "..."}]'
 *  - array já parseado
 *  - { value_pt: "<json>" } / { value_en: "<json>" }
 * Linhas sem `url` são ignoradas; ordem do array = ordem dos slides.
 */
export function parseHeroSlides(raw: unknown): HeroSlide[] {
  let value: unknown = raw;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      value = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const localized = value as { value_pt?: unknown; value_en?: unknown };
    const inner =
      typeof localized.value_pt === "string" && localized.value_pt.trim()
        ? localized.value_pt
        : typeof localized.value_en === "string"
          ? localized.value_en
          : null;
    return inner ? parseHeroSlides(inner) : [];
  }

  if (!Array.isArray(value)) return [];

  const out: HeroSlide[] = [];
  for (const row of value as Array<Record<string, unknown>>) {
    if (!row || typeof row !== "object") continue;
    const url = typeof row.url === "string" ? row.url.trim() : "";
    if (!url) continue;
    const altPt = typeof row.alt_pt === "string" && row.alt_pt.trim() ? row.alt_pt.trim() : null;
    const altEn = typeof row.alt_en === "string" && row.alt_en.trim() ? row.alt_en.trim() : null;
    out.push({ url, alt_pt: altPt, alt_en: altEn });
  }
  return out;
}

/** Lê `hero_slides` das settings públicas (pode ser null quando a API falha). */
export function heroSlidesFromSettings(settings: SettingsMap | Record<string, unknown> | null): HeroSlide[] {
  if (!settings) return [];
  return parseHeroSlides((settings as Record<string, unknown>)["hero_slides"]);
}
