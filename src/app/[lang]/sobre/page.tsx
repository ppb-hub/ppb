import type { Metadata } from "next";
import Link from "next/link";
import { Target, Eye, Heart, ChevronRight, Play } from "lucide-react";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import ApiImage from "@/components/public/ApiImage";
import VideoEmbed from "@/components/public/VideoEmbed";
import { ApiErrorBox } from "@/components/public/ApiErrorBox";
import { safe } from "@/lib/api/public";
import { resolveAssetUrl } from "@/lib/api/config";
import { bi, paragraphs, lines } from "@/lib/fields";
import { localizedHref, LOCALES, DEFAULT_LOCALE, getUi, type Locale } from "@/lib/i18n";
import { catalogName } from "@/lib/api/public";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);
  return {
    title: ui.nav.about,
    description: ui.about.subtitle,
    alternates: {
      canonical: localizedHref(locale, "about"),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizedHref(l, "about")])),
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);

  const [aboutRes, orgRes, milestonesRes] = await Promise.all([safe.about(), safe.org(), safe.milestones()]);

  // Falha total (API down) → estado de erro com retry, sem conteúdo inventado.
  if (!aboutRes.ok && !orgRes.ok && !milestonesRes.ok) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-32">
        <ApiErrorBox locale={locale} ui={ui} />
      </div>
    );
  }

  const about = aboutRes.ok ? aboutRes.data : null;
  const org = orgRes.ok ? orgRes.data : [];
  const milestones = milestonesRes.ok ? milestonesRes.data : [];

  const governorPhoto = resolveAssetUrl(about?.governor_photo);
  const videoThumb = resolveAssetUrl(about?.video_thumbnail);

  const mission = about ? bi(about, "mission", locale) : "";
  const vision = about ? bi(about, "vision", locale) : "";
  const values = lines(about ? bi(about, "values", locale) : "");
  const messageParas = paragraphs(about ? bi(about, "message", locale) : "");

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628]">
      {/* Header */}
      <div className="bg-[#0F2B5B] py-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Breadcrumbs locale={locale} ui={ui} items={[{ label: ui.nav.about }]} centered />
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-['Montserrat'] mb-3">
            {about ? bi(about, "hero_title", locale) || ui.about.title : ui.about.title}
          </h1>
          <p className="text-white/70 text-lg">
            {about?.hero_subtitle_pt || about?.hero_subtitle_en ? bi(about, "hero_subtitle", locale) : ui.about.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16">
        {/* Mensagem do Governador — /api/about */}
        {about ? (
          <section className="grid md:grid-cols-[280px_1fr] gap-10 items-start" aria-labelledby="msg-governador">
            {(governorPhoto || about.governor_name) && (
              <div>
                <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 aspect-[3/4] relative">
                  {governorPhoto ? (
                    <ApiImage src={about.governor_photo} alt={about.governor_name ?? ""} sizes="280px" />
                  ) : (
                    <div className="w-full h-full flex items-end justify-center p-4 bg-gradient-to-b from-[#0F2B5B]/80 to-[#091d3f]">
                      <span className="text-[#D4A843] font-bold text-5xl font-['Montserrat']">
                        {(about.governor_name ?? "GP").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <p className="font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">{about.governor_name}</p>
                  {about.governor_role ? <p className="text-sm text-gray-500 dark:text-white/60">{about.governor_role}</p> : null}
                  {about.governor_motto ? <div className="mt-2 text-[#D4A843] text-sm italic">“{about.governor_motto}”</div> : null}
                </div>
              </div>
            )}
            <div>
              <span className="text-[#E8821A] text-sm font-semibold uppercase tracking-widest">{ui.about.messageLabel}</span>
              <h2 id="msg-governador" className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mt-2 mb-5">
                {bi(about, "message_title", locale)}
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-white/70 leading-relaxed">
                {messageParas.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <ApiErrorBox compact title={ui.about.fallbackTitle} text={ui.about.fallbackSubtitle} locale={locale} ui={ui} />
        )}

        {/* Missão, Visão, Valores */}
        {(mission || vision || values.length > 0) && (
          <section>
            <h2 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-8 text-center">{ui.about.missionVisionValues}</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: <Target size={28} className="text-[#E8821A]" aria-hidden="true" />, title: ui.about.mission, body: <p>{mission}</p>, show: !!mission },
                { icon: <Eye size={28} className="text-[#D4A843]" aria-hidden="true" />, title: ui.about.vision, body: <p>{vision}</p>, show: !!vision },
                {
                  icon: <Heart size={28} className="text-[#27AE60]" aria-hidden="true" />,
                  title: ui.about.values,
                  body: (
                    <ul className="space-y-1.5">
                      {values.map((v, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] mt-2 shrink-0" aria-hidden="true" />
                          {v}
                        </li>
                      ))}
                    </ul>
                  ),
                  show: values.length > 0,
                },
              ]
                .filter((c) => c.show)
                .map((item) => (
                  <div key={item.title} className="bg-[#F8F9FA] dark:bg-[#0F2B5B]/30 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center mb-4 shadow-sm">{item.icon}</div>
                    <h3 className="font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-3">{item.title}</h3>
                    <div className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">{item.body}</div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Estrutura Organizacional — /api/about/org */}
        {org.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-8 text-center">{ui.about.orgTitle}</h2>
            <div className="flex flex-col items-center gap-3">
              {org.map((o, i) => (
                <div key={o.id} className="flex flex-col items-center">
                  <div
                    className={`rounded-xl px-6 py-3 text-center border ${
                      i === 0
                        ? "bg-[#0F2B5B] text-white border-[#0F2B5B] min-w-[260px]"
                        : "bg-white dark:bg-[#0F2B5B]/30 border-gray-200 dark:border-white/10 min-w-[240px]"
                    }`}
                  >
                    <div className={`text-xs font-medium mb-0.5 ${i === 0 ? "text-[#D4A843]" : "text-[#E8821A]"}`}>{bi(o, "role", locale)}</div>
                    <div className={`font-semibold text-sm font-['Montserrat'] ${i === 0 ? "text-white" : "text-[#0F2B5B] dark:text-white"}`}>{o.name}</div>
                  </div>
                  {i < org.length - 1 && <div className="w-0.5 h-4 bg-gray-300 dark:bg-white/20" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Realizações — /api/about/milestones */}
        {milestones.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-8">{ui.about.timelineTitle}</h2>
            <div className="space-y-0">
              {milestones.map((m, i) => (
                <div key={m.id} className="flex gap-6">
                  <div className="flex flex-col items-center" aria-hidden="true">
                    <div className="w-12 h-12 rounded-xl bg-[#0F2B5B] flex items-center justify-center text-[#D4A843] font-bold text-xs font-['Montserrat'] shrink-0">
                      {m.year}
                    </div>
                    {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-white/10 my-1" />}
                  </div>
                  <div className="pb-8">
                    <h3 className="font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-1">{bi(m, "title", locale)}</h3>
                    <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">{bi(m, "description", locale)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vídeo institucional (se configurado no backend) */}
        {about?.video_url ? (
          <section>
            <h2 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-6 text-center">{ui.about.videoTitle}</h2>
            <VideoEmbed
              url={about.video_url}
              thumbnail={videoThumb}
              posterFallback={about.video_thumbnail}
              title={bi(about, "video_title", locale) || ui.about.videoTitle}
              ui={ui}
            />
          </section>
        ) : null}

        {/* CTA */}
        <div className="text-center bg-[#F8F9FA] dark:bg-[#0F2B5B]/20 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-3">{ui.about.ctaTitle}</h3>
          <p className="text-gray-600 dark:text-white/70 mb-5">{ui.about.ctaText}</p>
          <Link
            href={localizedHref(locale, "projects")}
            className="inline-flex items-center gap-2 bg-[#E8821A] hover:bg-[#c96d10] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            {ui.about.ctaButton} <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
