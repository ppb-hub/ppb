import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { UiStrings } from "@/lib/i18n/ui";
import { localizedHref } from "@/lib/i18n/config";

/**
 * Estado de erro de dados — mensagem curta e ação de retry.
 * Nunca mostra stack, código HTTP interno nem detalhes técnicos do backend.
 */
export function ApiErrorBox({
  title,
  text,
  locale,
  ui,
  compact,
}: {
  title?: string;
  text?: string;
  locale: Locale;
  ui: UiStrings;
  compact?: boolean;
}) {
  return (
    <div
      role="alert"
      className={`bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-center ${compact ? "p-5" : "p-10"}`}
    >
      <AlertTriangle size={compact ? 22 : 32} className="mx-auto mb-3 text-red-500" aria-hidden="true" />
      <p className={`font-semibold text-[#850b0b] dark:text-white ${compact ? "text-sm" : "text-lg"}`}>
        {title ?? ui.common.apiErrorTitle}
      </p>
      <p className="text-gray-500 dark:text-white/60 text-sm mt-1 max-w-md mx-auto">
        {text ?? ui.common.apiErrorText}
      </p>
      <Link
        href={localizedHref(locale, "home")}
        className="no-print inline-flex items-center gap-2 mt-4 text-sm text-[#E8821A] hover:underline"
      >
        <RefreshCw size={14} aria-hidden="true" />
        {ui.common.retry}
      </Link>
    </div>
  );
}

export function EmptyState({ text, cta }: { text: string; cta?: React.ReactNode }) {
  return (
    <div className="text-center py-20 text-gray-400 dark:text-white/40">
      <p className="text-lg">{text}</p>
      {cta ? <div className="mt-3">{cta}</div> : null}
    </div>
  );
}
