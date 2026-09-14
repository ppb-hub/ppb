import type { Metadata } from "next";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import ProjectsExplorer from "@/components/public/ProjectsExplorer";
import { ApiErrorBox } from "@/components/public/ApiErrorBox";
import { safe } from "@/lib/api/public";
import { localizedHref, LOCALES, DEFAULT_LOCALE, getUi, t, type Locale } from "@/lib/i18n";

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

export default async function ProjectsPage({
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

  // Filtros suportados pela rota GET /api/projects vão para a API (query params reais).
  const [projectsRes, sectorsRes, munisRes, statusesRes] = await Promise.all([
    safe.projects({ sector: sp.sector, municipality: sp.municipality, status: sp.status }),
    safe.sectors(),
    safe.municipalities(),
    safe.statuses(),
  ]);

const visibleProjects = projectsRes.ok ? projectsRes.data.filter((project) => !project.is_opportunity) : [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628]">
      <div className="bg-[#850b0b] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs locale={locale} ui={ui} items={[{ label: ui.projects.title }]} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl font-bold text-white font-['Montserrat']">{ui.projects.title}</h1>
            {projectsRes.ok ? (
              <span className="bg-[#D4A843] text-[#850b0b] text-sm font-bold px-3 py-1 rounded-full self-start sm:self-auto">
                {t(ui.common.projectsCount, { n: visibleProjects.length })}
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
        <ProjectsExplorer
          locale={locale}
          ui={ui}
          projects={visibleProjects}
          sectors={sectorsRes.ok ? sectorsRes.data : []}
          municipalities={munisRes.ok ? munisRes.data : []}
          statuses={statusesRes.ok ? statusesRes.data : []}
          initialQuery={sp.q ?? ""}
          showOpportunities={false}
        />
      )}
    </div>
  );
}
