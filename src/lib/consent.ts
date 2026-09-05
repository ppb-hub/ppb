"use client";

/**
 * Consentimento de cookies (localStorage — o site não define cookies de
 * terceiros sem consentimento; "necessários" = tema/idioma e sessão admin).
 */
export type Consent = { necessary: true; analytics: boolean; updatedAt: string };
const KEY = "gpba_consent";
export const CONSENT_EVENT = "gpba-consent-change";

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (parsed && typeof parsed.analytics === "boolean") return { ...parsed, necessary: true };
    return null;
  } catch {
    return null;
  }
}

export function saveConsent(c: Omit<Consent, "necessary" | "updatedAt">): void {
  const value: Consent = { necessary: true, analytics: c.analytics, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function hasConsent(): boolean {
  return readConsent() !== null;
}
