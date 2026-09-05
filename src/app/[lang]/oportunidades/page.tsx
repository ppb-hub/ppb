import type { Metadata } from "next";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import OpportunitiesExplorer from "@/components/public/OpportunitiesExplorer";
import { ApiErrorBox } from "@/components/public/ApiErrorBox";
import { safe } from "@/lib/api/public";
import { localizedHref, LOCALES, DEFAULT_LOCALE, getUi, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);
  return {
    title: ui.investor.opportunitiesTitle,
    description:
      locale === "pt"
        ? "Explore todas as oportunidades de investimento na Província de Benguela"
        : "Explore all investment opportunities in Benguela Province",
    alternates: {
      canonical: localizedHref(locale, "opportunities"),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizedHref(l, "opportunities")])),
    },
  };
}

interface Search {
  sector?: string;
  type?: string;
  q?: string;
}

export default async function OpportunitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Search>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);

  const [oppsRes] = await Promise.all([
    safe.investorOpportunities(),
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628]">
      <div className="bg-[#0F2B5B] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            locale={locale}
            ui={ui}
            items={[{ label: ui.investor.opportunitiesTitle }]}
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl font-bold text-white font-['Montserrat']">
              {ui.investor.opportunitiesTitle}
            </h1>
            {oppsRes.ok && (
              <span className="bg-[#D4A843] text-[#0F2B5B] text-sm font-bold px-3 py-1 rounded-full self-start sm:self-auto">
                {oppsRes.data.length} {locale === "pt" ? "oportunidades" : "opportunities"}
              </span>
            )}
          </div>
        </div>
      </div>

      {!oppsRes.ok ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <ApiErrorBox locale={locale} ui={ui} />
        </div>
      ) : (
        <OpportunitiesExplorer
          locale={locale}
          ui={ui}
          opportunities={oppsRes.data}
          initialQuery={sp.q ?? ""}
        />
      )}
    </div>
  );
}