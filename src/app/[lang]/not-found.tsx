import Link from "next/link";
import { DEFAULT_LOCALE, isLocale, localizedHref, type Locale } from "@/lib/i18n/config";

/** 404 dentro de um idioma (inclui projeto inexistente via notFound()). */
export default async function LangNotFound({ params }: { params?: Promise<{ lang: string }> }) {
  const { lang } = (await params) ?? { lang: DEFAULT_LOCALE };
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const pt = locale === "pt";
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center py-24">
      <div className="text-7xl font-bold text-[#0F2B5B] dark:text-[#D4A843] font-['Montserrat'] mb-4">404</div>
      <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-3">
        {pt ? "Página não encontrada" : "Page not found"}
      </h1>
      <p className="text-gray-500 dark:text-white/60 max-w-md mb-8">
        {pt
          ? "O endereço acessado não existe ou o conteúdo foi movido."
          : "The address you accessed does not exist or the content was moved."}
      </p>
      <div className="flex gap-3">
        <Link href={localizedHref(locale, "home")} className="px-6 py-3 bg-[#E8821A] hover:bg-[#c96d10] text-white font-semibold rounded-xl transition-colors">
          {pt ? "Voltar ao Início" : "Back to Home"}
        </Link>
        <Link href={localizedHref(locale, "projects")} className="px-6 py-3 border border-gray-300 dark:border-white/20 text-[#0F2B5B] dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-white/5">
          {pt ? "Ver Projetos" : "View Projects"}
        </Link>
      </div>
    </div>
  );
}
