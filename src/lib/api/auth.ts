import { browserFetch } from "./server-fetch";
import type { AdminCreate, LoginIn, PasswordChangeIn, TokenOut, UserOut } from "@/types/api";

/**
 * Autenticação conforme o backend:
 * - POST /api/auth/login → JSON { username, password } → TokenOut
 *   { access_token, token_type, user }.
 * - Os endpoints protegidos aceitam `Authorization` (Bearer) e/ou o cookie
 *   `portal_token`. Não há refresh token documentado.
 * Estratégia frontend: guardar o token em localStorage, enviar sempre o
 * header Bearer e espelhar o valor no cookie `portal_token` (SameSite=Lax)
 * para cobrir ambos os mecanismos documentados, sem alterar o backend.
 */
const TOKEN_KEY = "gpba_token";
export const PORTAL_COOKIE = "portal_token";

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}
export function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  // espelha no cookie portal_token (24h) — mecanismos aceites pelo backend
  setCookie(PORTAL_COOKIE, token, 60 * 60 * 24);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  setCookie(PORTAL_COOKIE, "", 0);
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(data: LoginIn): Promise<TokenOut> {
  const res = await fetch(`/backend/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const { parseErrorBody } = await import("./errors");
    const { detail } = await parseErrorBody(res);
    throw new Error(detail || "Credenciais inválidas.");
  }
  const json = (await res.json()) as TokenOut;
  if (!json?.access_token) throw new Error("Resposta inesperada do servidor de autenticação.");
  storeToken(json.access_token);
  return json;
}

export async function logout(): Promise<void> {
  try {
    await browserFetch<void>("/api/auth/logout", { method: "POST", token: getToken() });
  } finally {
    clearToken();
  }
}

export function me(): Promise<UserOut> {
  return browserFetch<UserOut>("/api/auth/me", { token: getToken() });
}

export function changePassword(data: PasswordChangeIn): Promise<UserOut> {
  return browserFetch<UserOut>("/api/auth/password", { method: "POST", body: data, token: getToken() });
}

export function createAdmin(data: AdminCreate): Promise<UserOut> {
  return browserFetch<UserOut>("/api/auth/admin", { method: "POST", body: data, token: getToken() });
}
