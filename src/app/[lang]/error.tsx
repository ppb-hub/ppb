"use client";

import { useEffect } from "react";
import Link from "next/link";
import { localizedHref, DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Error boundary de rota para as páginas públicas.
 * Mostra apenas uma mensagem limpa; o detalhe fica só no console (dev),
 * nunca na UI — nada de stack traces para o utilizador.
 */
export default function LangError({
  error,
  reset,
  params,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  params?: Promise<{ lang: string }>;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  const resolvedLocale: Locale = isLocale((params as unknown as { lang?: string })?.lang)
    ? ((params as unknown as { lang: Locale }).lang)
    : DEFAULT_LOCALE;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center py-24">
      <div className="text-6xl font-bold text-[#850b0b] dark:text-[#D4A843] font-['Montserrat'] mb-4">500</div>
      <h1 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat'] mb-3">
        {resolvedLocale === "pt" ? "Ocorreu um erro inesperado" : "Something went wrong"}
      </h1>
      <p className="text-gray-500 dark:text-white/60 max-w-md mb-8">
        {resolvedLocale === "pt"
          ? "Não foi possível carregar esta página neste momento. Tente novamente."
          : "This page could not be loaded right now. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#E8821A] hover:bg-[#c96d10] text-white font-semibold rounded-xl transition-colors"
        >
          {resolvedLocale === "pt" ? "Tentar novamente" : "Try again"}
        </button>
        <Link
          href={localizedHref(resolvedLocale, "home")}
          className="px-6 py-3 border border-gray-300 dark:border-white/20 text-[#850b0b] dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          {resolvedLocale === "pt" ? "Voltar ao Início" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}
