"use client";

import { useState } from "react";
import { Printer, Share2, X, Check } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { UiStrings } from "@/lib/i18n/ui";

/** Imprimir + partilhar (ações nativas/reais — Facebook, LinkedIn, WhatsApp, copiar link). */
export default function ProjectActions({ locale, ui, title }: { locale: Locale; ui: UiStrings; title: string }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const links = shareUrl
    ? [
        { label: "Facebook", color: "bg-[#1877F2]", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
        { label: "LinkedIn", color: "bg-[#0A66C2]", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
        { label: "WhatsApp", color: "bg-[#25D366]", href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}` },
      ]
    : [];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <>
      <div className="flex gap-2 shrink-0 no-print">
        <button onClick={() => window.print()} aria-label={ui.common.print} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
          <Printer size={18} />
        </button>
        <button onClick={() => setShareOpen(true)} aria-label={ui.common.share} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
          <Share2 size={18} />
        </button>
      </div>

      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={ui.common.share}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setShareOpen(false)} />
          <div className="relative bg-white dark:bg-[#850b0b] rounded-2xl p-6 w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#850b0b] dark:text-white font-['Montserrat']">{ui.common.share}</h3>
              <button onClick={() => setShareOpen(false)} aria-label={ui.menu.close}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {links.map(({ label, color, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${color} text-white rounded-xl py-3 flex flex-col items-center gap-1.5 text-xs font-medium hover:opacity-90 transition-opacity`}
                >
                  <Share2 size={20} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
            <button onClick={copy} className="mt-3 w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-white/20 rounded-xl py-2.5 text-sm font-medium text-[#850b0b] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              {copied ? <Check size={15} className="text-[#27AE60]" aria-hidden="true" /> : <Share2 size={15} aria-hidden="true" />}
              {copied ? ui.common.linkCopied : ui.common.copyLink}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
