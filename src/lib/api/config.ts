/**
 * Configuração central de acesso à API.
 * - No SERVIDOR (Server Components): chama API_ORIGIN diretamente.
 * - No NAVEGADOR: usa o prefixo relativo NEXT_PUBLIC_API_PREFIX (ex.: /backend),
 *   que o next.config.ts reescreve para o backend — sem CORS, sem URLs hardcoded
 *   e sem expor a porta do backend.
 */
export const API_ORIGIN = process.env.API_ORIGIN || "http://localhost:8000";

/** Prefixo relativo visto pelo browser (default "/backend"). */
export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/backend";

/** Base absoluta para chamadas feitas dentro do processo Next (servidor). */
export function serverBase(): string {
  return API_ORIGIN.replace(/\/+$/, "");
}

/** URL absoluta de um asset devolvido pela API (ex.: /uploads/foo.jpg). */
export function assetOriginUrl(url: string): string {
  return `${serverBase()}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** URL de asset resolvida para o NAVEGADOR (via proxy /backend). */
export function browserAssetUrl(url: string | null | undefined): string | undefined {
  return resolveAssetUrl(url, "browser");
}

/**
 * Resolve caminhos devolvidos pela API para uma URL utilizável por <img>/href.
 * - http(s)://... → tal e qual
 * - /media/... ou /images/... → ficheiros locais do próprio frontend
 * - //host/... → https:
 * - /uploads/... ou outro caminho → passa pelo proxy /backend (browser) ou API_ORIGIN (servidor)
 */
export function resolveAssetUrl(
  url: string | null | undefined,
  mode: "browser" | "server" = "browser"
): string | undefined {
  if (!url) return undefined;
  const u = url.trim();
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/media/") || u.startsWith("/images/")) return u;
  const path = u.startsWith("/") ? u : `/${u}`;
  return mode === "browser" ? `${API_PREFIX}${path}` : `${serverBase()}${path}`;
}

/** Site URL pública (canonical, sitemap, OG). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
