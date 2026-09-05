"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a1628] px-4 text-center">
      <div className="text-6xl font-bold text-[#0F2B5B] dark:text-[#D4A843] font-['Montserrat'] mb-4">500</div>
      <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-3">Erro inesperado</h1>
      <p className="text-gray-500 dark:text-white/60 max-w-md mb-8">Não foi possível carregar esta página.</p>
      <div className="flex gap-3">
        <button onClick={() => reset()} className="px-6 py-3 bg-[#E8821A] hover:bg-[#c96d10] text-white font-semibold rounded-xl transition-colors">
          Tentar novamente
        </button>
        <Link href="/pt" className="px-6 py-3 border border-gray-300 dark:border-white/20 text-[#0F2B5B] dark:text-white rounded-xl">
          Início
        </Link>
      </div>
    </div>
  );
}
