/**
 * Configuração de i18n do portal.
 * Para adicionar um idioma: 1) acrescentar ao array LOCALES,
 * 2) adicionar o dicionário em ui.ts e as chaves _xx que a API suportar.
 */
export const LOCALES = ["pt", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALE_COOKIE = "gpba_locale";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Slugs de rota do template. Mantêm-se iguais nos dois idiomas
 * (o backend/admin são PT e o caminho vem do template original).
 * Se um dia se quiser /en/projects basta preencher ROUTES["en"] — o
 * helper localizedHref já usa esta tabela.
 */
export const ROUTE_KEYS = ["home", "projects", "about", "investor", "contact", "privacy", "opportunities"] as const;
export type RouteKey = (typeof ROUTE_KEYS)[number];

export const ROUTES: Record<Locale, Record<RouteKey, string>> = {
  pt: {
    home: "",
    projects: "projetos",
    about: "sobre",
    investor: "investidor",
    contact: "contacto",
    privacy: "privacidade",
    opportunities: "oportunidades"
  },
  en: {
    home: "",
    projects: "projetos",
    about: "sobre",
    investor: "investidor",
    contact: "contacto",
    privacy: "privacidade",
    opportunities: "opportunities"
  },
};


/** /pt/projetos, /en/projetos, ... */
export function localizedHref(locale: Locale, route: RouteKey, rest = ""): string {
  const slug = ROUTES[locale][route];
  const base = `/${locale}${slug ? `/${slug}` : ""}`;
  return rest ? `${base}${rest.startsWith("/") ? rest : `/${rest}`}` : base;
}

/** Troca o idioma mantendo o resto do caminho atual. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/");
  const first = parts[1] ?? "";
  if ((LOCALES as readonly string[]).includes(first)) {
    parts[1] = target;
  } else {
    parts.splice(1, 0, target);
  }
  const rebuilt = parts.join("/") || `/${target}`;
  return rebuilt;
}

export function htmlLang(locale: Locale): string {
  return locale === "pt" ? "pt-AO" : "en";
}

export function intlLocale(locale: Locale): string {
  return locale === "pt" ? "pt-AO" : "en-GB";
}
