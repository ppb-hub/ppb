import type { Metadata } from "next";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import ProjectsExplorer from "@/components/public/ProjectsExplorer";
import { ApiErrorBox } from "@/components/public/ApiErrorBox";
import { safe, pickSetting } from "@/lib/api/public";
import { localizedHref, LOCALES, DEFAULT_LOCALE, getUi, t, type Locale } from "@/lib/i18n";

import Link from "next/link";
import { ArrowRight, Download, Phone } from "lucide-react";
import ApiImage from "@/components/public/ApiImage";
import OpportunitiesGrid from "@/components/public/OpportunitiesGrid";
import { ApiIcon } from "@/lib/icons";
import { resolveAssetUrl } from "@/lib/api/config";
import { bi } from "@/lib/fields";
import { formatSizeKb, cx } from "@/lib/format";
import type { TestimonialOut } from "@/types/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);
  const title = ui.projects.title;
  return {
    title,
    description:
      locale === "pt"
        ? "Explore todos os projectos públicos da Província de Benguela: mapa, filtros por município, setor e estado de execução."
        : "Explore all public projects of Benguela Province: filters by municipality, sector and execution status.",
    alternates: {
      canonical: localizedHref(locale, "projects"),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizedHref(l, "projects")])),
    },
  };
}

interface Search {
  sector?: string;
  municipality?: string;
  status?: string;
  q?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function TestimonialPhoto({ t, locale }: { t: TestimonialOut; locale: Locale }) {
  const url = resolveAssetUrl(t.photo);
  if (!url) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#850b0b] dark:bg-white/10 flex items-center justify-center text-[#D4A843] text-xs font-bold shrink-0" aria-hidden="true">
        {initials(t.name)}
      </div>
    );
  }
  return (
    <span className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 block shrink-0">
      <ApiImage src={t.photo} alt={t.name} sizes="40px" />
    </span>
  );
}

export default async function InvestPage({
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

  const [projectsRes, sectorsRes, munisRes, statusesRes, oppsRes, indsRes, testsRes, docsRes, settingsRes] = await Promise.all([
    safe.projects({ sector: sp.sector, municipality: sp.municipality, status: sp.status }),
    safe.sectors(),
    safe.municipalities(),
    safe.statuses(),

    safe.investorOpportunities(),
    safe.investorIndicators(),
    safe.investorTestimonials(),
    safe.investorDocuments(),
    safe.settings(),
  ]);

  const settings = settingsRes.ok ? settingsRes.data : null;
  const phone = pickSetting(settings ?? {}, "contact_phone", locale) ?? "+244 272 222 000";

  const opportunities = oppsRes.ok ? oppsRes.data : [];
  const filteredOpportunities = projectsRes.ok ? projectsRes.data.filter((project) => project.is_opportunity) : [];
  const indicators = indsRes.ok ? indsRes.data : [];
  const testimonials = testsRes.ok ? testsRes.data : [];
  const docs = docsRes.ok ? docsRes.data : [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628]">
      <div className="bg-[#850b0b] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs locale={locale} ui={ui} items={[{ label: ui.investor.title }]} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl font-bold text-white font-['Montserrat']">{ui.investor.opportunitiesTitle}</h1>
            {projectsRes.ok ? (
              <span className="bg-[#D4A843] text-[#850b0b] text-sm font-bold px-3 py-1 rounded-full self-start sm:self-auto">
                {t(ui.common.projectsCount, { n: filteredOpportunities.length })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {!projectsRes.ok ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <ApiErrorBox locale={locale} ui={ui} />
        </div>
      ) : (
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Indicadores macro */}
            {indicators.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat'] mb-6">{ui.investor.indicatorsTitle}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {indicators.map((ind) => (
                    <div key={ind.id} className="bg-[#F8F9FA] dark:bg-[#850b0b]/30 rounded-xl p-5 border border-gray-100 dark:border-white/10">
                      <div className="mb-3">
                        <ApiIcon name={ind.icon} size={20} className={ind.color ? "" : "text-[#D4A843]"} />
                      </div>
                      <div className="text-xl font-bold text-[#850b0b] dark:text-white font-['Montserrat']">{ind.value}</div>
                      <div className="text-xs text-gray-500 dark:text-white/60 mt-1">{bi(ind, "label", locale)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <ProjectsExplorer
            locale={locale}
            ui={ui}
            projects={filteredOpportunities}
            showOpportunities={true}
            sectors={sectorsRes.ok ? sectorsRes.data : []}
            municipalities={munisRes.ok ? munisRes.data : []}
            statuses={statusesRes.ok ? statusesRes.data : []}
            initialQuery={sp.q ?? ""}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
            {/* Depoimentos - removido por enquanto */}
            {testimonials.length == -1 && (
              <section>
                <h2 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat'] mb-6">{ui.investor.testimonialsTitle}</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {testimonials.map((t) => (
                    <div key={t.id} className="bg-[#F8F9FA] dark:bg-[#850b0b]/30 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                      <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed mb-5 italic">“{bi(t, "text", locale)}”</p>
                      <div className="flex items-center gap-3">
                        <TestimonialPhoto t={t} locale={locale} />
                        <div>
                          <div className="font-semibold text-[#850b0b] dark:text-white text-sm">{t.name}</div>
                          <div className="text-xs text-[#E8821A]">{t.company}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Documentos */}
            {docs.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat'] my-6">{ui.investor.documentsTitle}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {docs.map((d) => (
                    <a
                      key={d.id}
                      href={resolveAssetUrl(d.file_url) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border border-gray-100 dark:border-white/10 rounded-xl hover:border-[#E8821A] hover:bg-[#E8821A]/5 transition-all group bg-white dark:bg-[#850b0b]/20"
                    >
                      <Download size={18} className="text-[#E8821A] shrink-0" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#850b0b] dark:text-white truncate">{bi(d, "name", locale)}</div>
                        <div className="text-xs text-gray-400 dark:text-white/40">{formatSizeKb(d.size_kb) || "PDF"}</div>
                      </div>
                      <ArrowRight size={14} className="text-[#E8821A] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
