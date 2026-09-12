"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { hasConsent, readConsent, saveConsent } from "@/lib/consent";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import type { UiStrings } from "@/lib/i18n/ui";

/**
 * Banner/modal de consentimento (Necessários sempre ativos; Analytics opt-in).
 * Aceitar / Só necessários / personalizar. Persistido em localStorage.
 */
export default function CookieBar({ locale, ui }: { locale: Locale; ui: UiStrings }) {
  const [show, setShow] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!hasConsent()) setShow(true);
  }, []);

  const respond = (opts: { analytics: boolean }) => {
    saveConsent(opts);
    setShow(false);
    setSettingsOpen(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label={ui.cookies.text}
      className="no-print fixed bottom-0 left-0 right-0 z-50 bg-[#850b0b] border-t border-[#D4A843]/30 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center gap-3">
        <p className="text-white/80 text-sm text-center sm:text-left flex-1">
          {ui.cookies.text}{" "}
          <Link href={localizedHref(locale, "privacy")} className="text-[#D4A843] underline">
            {ui.cookies.policy}
          </Link>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <button
            onClick={() => {
              setSettingsOpen((v) => !v);
              setAnalytics(readConsent()?.analytics ?? false);
            }}
            className="px-4 py-2 text-sm text-white/80 hover:text-white underline-offset-2 hover:underline"
          >
            {ui.cookies.settings}
          </button>
          <button
            onClick={() => respond({ analytics: false })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-md transition-colors"
          >
            {ui.cookies.reject}
          </button>
          <button
            onClick={() => respond({ analytics: true })}
            className="px-5 py-2 bg-[#E8821A] hover:bg-[#c96d10] text-white text-sm font-medium rounded-md transition-colors"
          >
            {ui.cookies.accept}
          </button>
        </div>
      </div>

      {settingsOpen && (
        <div className="border-t border-white/10 bg-[#850b0b] px-4 sm:px-6 py-5">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm font-['Montserrat']">{ui.cookies.settings}</h2>
              <button onClick={() => setSettingsOpen(false)} aria-label={ui.menu.close} className="text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{ui.cookies.necessary}</p>
                  <p className="text-white/50 text-xs mt-0.5">{ui.cookies.necessaryDesc}</p>
                </div>
                <span className="text-[#27AE60] text-xs font-semibold mt-1">ON</span>
              </div>
              <label className="flex items-start gap-3 bg-white/5 rounded-xl p-4 cursor-pointer">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{ui.cookies.analytics}</p>
                  <p className="text-white/50 text-xs mt-0.5">{ui.cookies.analyticsDesc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="accent-[#E8821A] w-4 h-4 mt-1"
                />
              </label>
            </div>
            <button
              onClick={() => respond({ analytics })}
              className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-[#E8821A] hover:bg-[#c96d10] text-white text-sm font-medium rounded-xl transition-colors"
            >
              {ui.cookies.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
