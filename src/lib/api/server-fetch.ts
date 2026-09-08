import { API_PREFIX, serverBase } from "./config";
import { ApiError, parseErrorBody } from "./errors";

/**
 * Camada de fetch partilhada:
 * - apiFetch/apiGetSafe → SERVIDOR (Server Components). Cache em memória com
 *   TTL curto: evita pedidos repetidos à API entre seções da mesma página e
 *   navegações rápidas, mantendo os dados do portal frescos;
 * - browserFetch → NAVEGADOR (formulários/admin), via proxy /backend com
 *   Bearer + credentials (cookie portal_token).
 * Páginas públicas são force-dynamic: uma mutação do admin propaga-se no
 * espaço de um refresh (TTL da microcache), sem precisar de revalidatePath.
 */

const DEFAULT_TTL_MS = 20_000;

interface CacheEntry {
  expires: number;
  value: unknown;
}
const microCache = new Map<string, CacheEntry>();

export interface ServerFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** token admin (Authorization: Bearer) para mutações chamadas do servidor */
  token?: string;
  /** ttl da microcache (ms). 0 = sem cache */
  ttlMs?: number;
  /** não lança e não usa cache (mutações) */
  mutation?: boolean;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, opts: ServerFetchOptions = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const useCache = method === "GET" && !opts.mutation && (opts.ttlMs ?? DEFAULT_TTL_MS) > 0;
  const cacheKey = `${method}:${path}`;

  if (useCache) {
    const hit = microCache.get(cacheKey);
    if (hit && hit.expires > Date.now()) return hit.value as T;
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let res: Response;
  try {
    res = await fetch(`${serverBase()}${path}`, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
      signal: opts.signal ?? AbortSignal.timeout(12_000),
    });
  } catch (e) {
    if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) {
      throw new ApiError(504, "Tempo de espera esgotado ao contactar o servidor de dados.", "network");
    }
    throw new ApiError(0, "Sem ligação ao servidor de dados.", "network");
  }

  if (!res.ok) {
    const { detail, fieldErrors } = await parseErrorBody(res);
    throw new ApiError(res.status, detail, res.status === 422 ? "validation" : "http", fieldErrors);
  }

  let data: T;
  const status = res.status;
  if (status === 204 || res.headers.get("content-length") === "0") {
    data = undefined as T;
  } else {
    try {
      data = (await res.json()) as T;
    } catch {
      throw new ApiError(status, "Resposta inválida do servidor.", "parse");
    }
  }

  if (useCache) {
    microCache.set(cacheKey, { expires: Date.now() + (opts.ttlMs ?? DEFAULT_TTL_MS), value: data });
  } else if (opts.mutation) {
    microCache.clear();
  }
  return data;
}

export type SafeResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

/** GET seguro para Server Components: nunca rebenta a página; devolve erro para UI. */
export async function apiGetSafe<T>(path: string, ttlMs?: number): Promise<SafeResult<T>> {
  try {
    return { ok: true, data: await apiFetch<T>(path, { ttlMs }) };
  } catch (e) {
    const error = e instanceof ApiError ? e : new ApiError(500, "Erro inesperado ao obter dados.", "http");
    return { ok: false, error };
  }
}

export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/**
 * Camada CLIENT (fetch a partir do browser) — usada por formulários e admin.
 * Passa pelo proxy /backend (API_PREFIX) e envia o token Bearer guardado no
 * storage do admin. `credentials: include` cobre o cenário portal_token cookie.
 */
export async function browserFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (init.body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (init.token) headers.Authorization = `Bearer ${init.token}`;

  let res: Response;
  const requestBody = init.body !== undefined
    ? (isFormData ? (init.body as BodyInit) : JSON.stringify(init.body))
    : undefined;

  try {
    res = await fetch(`${API_PREFIX}${path}`, {
      method: init.method ?? "GET",
      headers,
      credentials: "include",
      body: requestBody,
    });
  } catch {
    throw new ApiError(0, "Sem ligação ao servidor. Verifique a sua rede.", "network");
  }
  if (!res.ok) {
    const { detail, fieldErrors } = await parseErrorBody(res);
    throw new ApiError(res.status, detail, res.status === 422 ? "validation" : "http", fieldErrors);
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("json")) return undefined as T;
  return (await res.json()) as T;
}
