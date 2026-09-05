import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  User,
  Phone,
  Mail,
  CheckCircle2,
  FileText,
  ArrowRight,
} from "lucide-react";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import ApiImage from "@/components/public/ApiImage";
import StatusBadge from "@/components/public/StatusBadge";
import ProgressBar from "@/components/public/ProgressBar";
import ProjectGallery from "@/components/public/ProjectGallery";
import ProjectActions from "@/components/public/ProjectActions";
import { ApiErrorBox } from "@/components/public/ApiErrorBox";
import { safe, catalogName } from "@/lib/api/public";
import { resolveAssetUrl } from "@/lib/api/config";
import { bi } from "@/lib/fields";
import { formatMoneyKz, formatMoneyUsd, formatDate, formatSizeKb, cx } from "@/lib/format";
import { localizedHref, LOCALES, DEFAULT_LOCALE, getUi, type Locale } from "@/lib/i18n";
import type { ProjectDetailOut, ProjectListOut } from "@/types/api";

export const dynamic = "force-dynamic";

async function loadProject(slug: string): Promise<ProjectDetailOut | "error" | "notfound"> {
  const res = await safe.project(slug);
  if (res.ok) return res.data;
  if (res.error.isNotFound) return "notfound";
  return "error";
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const project = await loadProject(slug);
  if (project === "error" || project === "notfound") {
    return { title: locale === "pt" ? "Projeto não encontrado" : "Project not found", robots: { index: false, follow: false } };
  }
  const title = bi(project, "title", locale);
  const summary = bi(project, "summary", locale);
  const ogImage = resolveAssetUrl(project.cover_image) ?? "/media/hero-benguela.jpg";
  return {
    title,
    description: summary || title,
    alternates: {
      canonical: localizedHref(locale, "projects", slug),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizedHref(l, "projects", slug)])),
    },
    openGraph: {
      title,
      description: summary || title,
      url: localizedHref(locale, "projects", slug),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);

  const project = await loadProject(slug);
  if (project === "notfound") notFound();
  if (project === "error") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <ApiErrorBox locale={locale} ui={ui} />
      </div>
    );
  }

  const related = await getRelated(project);

  const title = bi(project, "title", locale);
  const images = [
    { url: project.cover_image, alt: bi(project, "cover_alt", locale) || title },
    ...(project.images ?? []).map((img) => ({ url: img.url, alt: bi(img, "alt", locale) || title })),
  ].filter((img, i, arr) => arr.findIndex((x) => x.url === img.url) === i);

  const timeline = buildTimeline(project, ui, locale);
  const docs = project.documents ?? [];
  const objectives = project.objectives ?? [];
  const desc = bi(project, "description", locale) || bi(project, "summary", locale);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628]">
      {/* Header */}
      <div className="bg-[#0F2B5B] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            locale={locale}
            ui={ui}
            items={[
              { label: ui.nav.projects, href: localizedHref(locale, "projects") },
              { label: title },
            ]}
          />
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge status={project.status} locale={locale} />
                <span className="bg-white/15 text-white text-xs px-2.5 py-1 rounded-full">{catalogName(project.sector, locale)}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Montserrat'] leading-tight">{title}</h1>
            </div>
            <ProjectActions locale={locale} ui={ui} title={title} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* LEFT */}
          <div className="min-w-0">
            {images.length > 0 && <ProjectGallery images={images} title={title} locale={locale} ui={ui} />}

            {desc ? (
              <section className="mb-8" aria-labelledby="descricao">
                <h2 id="descricao" className="text-xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-4">{ui.detail.description}</h2>
                <div className="text-gray-600 dark:text-white/70 leading-relaxed space-y-3">
                  {desc.split(/\r?\n\r?\n/).map((para, i) => (
                    <p key={i} className="whitespace-pre-line">{para}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {objectives.length > 0 && (
              <section className="mb-8" aria-labelledby="objetivos">
                <h2 id="objetivos" className="text-xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-4">{ui.detail.objectives}</h2>
                <ul className="space-y-2">
                  {objectives.map((obj) => (
                    <li key={obj.id} className="flex items-start gap-2.5 text-gray-600 dark:text-white/70">
                      <CheckCircle2 size={17} className="text-[#27AE60] mt-0.5 shrink-0" aria-hidden="true" />
                      {bi(obj, "text", locale)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mb-8" aria-labelledby="timeline">
              <h2 id="timeline" className="text-xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-4">{ui.detail.timeline}</h2>
              <div className="space-y-0">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <div
                        className={cx(
                          "w-4 h-4 rounded-full border-2 mt-1",
                          t.done ? "bg-[#27AE60] border-[#27AE60]" : "bg-white dark:bg-[#0a1628] border-gray-300 dark:border-white/30"
                        )}
                      />
                      {i < timeline.length - 1 && (
                        <div className={cx("w-0.5 h-8", t.done ? "bg-[#27AE60]" : "bg-gray-200 dark:bg-white/10")} />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="font-medium text-[#0F2B5B] dark:text-white text-sm">{t.label}</div>
                      {t.date ? <div className="text-xs text-gray-400 dark:text-white/50">{t.date}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {docs.length > 0 && (
              <section className="mb-8" aria-labelledby="docs">
                <h2 id="docs" className="text-xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-4">{ui.detail.documents}</h2>
                <div className="space-y-2">
                  {docs.map((d) => (
                    <a
                      key={d.id}
                      href={resolveAssetUrl(d.file_url) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/10 rounded-xl hover:border-[#E8821A] hover:bg-[#E8821A]/5 transition-all group"
                    >
                      <FileText size={18} className="text-[#E8821A] shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-sm font-medium text-[#0F2B5B] dark:text-white">{bi(d, "name", locale)}</span>
                      {d.size_kb ? <span className="text-xs text-gray-400 dark:text-white/40">{formatSizeKb(d.size_kb)}</span> : null}
                      <span className="text-xs text-[#E8821A] opacity-0 group-hover:opacity-100 transition-opacity">PDF ↓</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Localização — sem mapa embed (API não serve tiles); link externo quando há coordenadas */}
            <section className="mb-8" aria-labelledby="local">
              <h2 id="local" className="text-xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-4">{ui.detail.location}</h2>
              <div className="rounded-2xl overflow-hidden h-56 bg-[#0F2B5B]/10 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10">
                <div className="text-center text-gray-400 dark:text-white/40">
                  <MapPin size={32} className="mx-auto mb-2 text-[#E8821A]" aria-hidden="true" />
                  {project.location ? <p className="text-sm">{project.location}</p> : null}
                  {project.lat != null && project.lng != null ? (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${project.lat}&mlon=${project.lng}#map=15/${project.lat}/${project.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm text-[#E8821A] hover:underline mt-1"
                    >
                      {ui.detail.mapLink}
                    </a>
                  ) : (
                    <p className="text-xs mt-1">{ui.detail.mapNote}</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar — Resumo Executivo com dados reais */}
          <aside>
            <div className="sticky top-20 bg-white dark:bg-[#0F2B5B]/40 rounded-2xl border border-gray-100 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden no-print">
              <div className="bg-[#0F2B5B] px-5 py-4">
                <h3 className="font-bold text-white font-['Montserrat'] text-sm">{ui.detail.summary}</h3>
              </div>
              <div className="p-5 space-y-4">
                {project.value_kz ? <SidebarRow icon={<DollarSign size={15} />} label={ui.detail.totalValue} value={formatMoneyKz(project.value_kz)} /> : null}
                {project.value_usd ? <SidebarRow icon={<DollarSign size={15} />} label={ui.detail.valueUsd} value={formatMoneyUsd(project.value_usd)} /> : null}
                {project.financing_source ? <SidebarRow icon={<Building2 size={15} />} label={ui.detail.financing} value={project.financing_source} /> : null}
                <SidebarRow icon={<MapPin size={15} />} label={ui.detail.municipality} value={catalogName(project.municipality, locale)} />
                {project.executor ? <SidebarRow icon={<User size={15} />} label={ui.detail.executor} value={project.executor} /> : null}
                {project.supervisor ? <SidebarRow icon={<User size={15} />} label={ui.detail.supervisor} value={project.supervisor} /> : null}
                {project.start_date ? <SidebarRow icon={<Calendar size={15} />} label={ui.detail.startDate} value={formatDate(project.start_date, locale)} /> : null}
                {project.end_date ? <SidebarRow icon={<Calendar size={15} />} label={ui.detail.endDate} value={formatDate(project.end_date, locale)} /> : null}

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-white/60">{ui.detail.progressLabel}</span>
                    <span className="font-bold text-[#0F2B5B] dark:text-white">{project.progress}%</span>
                  </div>
                  <ProgressBar progress={project.progress} />
                </div>

                {project.manager_phone || project.manager_email ? (
                  <div className="pt-2 space-y-1.5">
                    <div className="text-xs text-gray-400 dark:text-white/50">{ui.detail.managerContact}</div>
                    {project.manager_name ? (
                      <div className="text-sm text-[#0F2B5B] dark:text-white font-medium">{project.manager_name}</div>
                    ) : null}
                    {project.manager_phone ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/80">
                        <Phone size={13} className="text-[#D4A843]" aria-hidden="true" /> {project.manager_phone}
                      </div>
                    ) : null}
                    {project.manager_email ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/80">
                        <Mail size={13} className="text-[#D4A843]" aria-hidden="true" /> {project.manager_email}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="px-5 pb-5">
                <Link
                  href={`${localizedHref(locale, "contact")}?projeto=${project.id}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#E8821A] hover:bg-[#c96d10] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  {ui.detail.requestInfo} <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-6">{ui.detail.related}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={localizedHref(locale, "projects", p.slug)}
                  className="group bg-white dark:bg-[#0F2B5B]/30 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="relative h-32 bg-gray-100 overflow-hidden">
                    <ApiImageFill src={p.cover_image} alt={bi(p, "title", locale)} />
                  </div>
                  <div className="p-3">
                    <div className="mb-1"><StatusBadge status={p.status} locale={locale} /></div>
                    <h4 className="font-semibold text-xs text-[#0F2B5B] dark:text-white line-clamp-2 leading-snug">{bi(p, "title", locale)}</h4>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-white/50">
                      <MapPin size={9} aria-hidden="true" /> {catalogName(p.municipality, locale)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ApiImageFill({ src, alt }: { src: string | null; alt: string }) {
  return <ApiImage src={src} alt={alt} sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw" fallbackLabel="" />;
}

async function getRelated(project: ProjectDetailOut): Promise<ProjectListOut[]> {
  const res = await safe.projects();
  if (!res.ok) return [];
  return res.data
    .filter(
      (p) =>
        p.id !== project.id &&
        (p.municipality?.id === project.municipality?.id || p.sector?.id === project.sector?.id)
    )
    .slice(0, 4);
}

function buildTimeline(project: ProjectDetailOut, ui: ReturnType<typeof getUi>, locale: Locale) {
  const labels = project.progress >= 100 ? [true, true, true] : [project.progress >= 30, project.progress >= 60, project.progress >= 90];
  return [
    { label: ui.detail.stageStart, date: formatDate(project.start_date, locale) || null, done: true },
    { label: ui.detail.stages[0], date: null, done: labels[0] },
    { label: ui.detail.stages[1], date: null, done: labels[1] },
    { label: ui.detail.stages[2], date: null, done: labels[2] },
    { label: ui.detail.stageEnd, date: formatDate(project.end_date, locale) || null, done: project.progress >= 100 },
  ];
}

function SidebarRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400 dark:text-white/50 mb-0.5 flex items-center gap-1">
        <span className="text-[#D4A843]" aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-medium text-[#0F2B5B] dark:text-white">{value}</div>
    </div>
  );
}
