import Link from "next/link";
import { ArrowRight, Calendar, Zap, ChevronRight, Bell } from "lucide-react";
import type { Metadata } from "next";
import StatCard from "@/components/public/StatCard";
import FeaturedCarousel from "@/components/public/FeaturedCarousel";
import { ApiErrorBox } from "@/components/public/ApiErrorBox";
import { safe, pickSetting } from "@/lib/api/public";
import { resolveAssetUrl } from "@/lib/api/config";
import { bi } from "@/lib/fields";
import { localizedHref, LOCALES, DEFAULT_LOCALE, getUi, t, type Locale } from "@/lib/i18n";
import HeroSection from "@/components/public/HeroSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);
  return {
    title: {
      absolute:
        locale === "pt"
          ? "Portal de Projectos — Governo Provincial de Benguela"
          : "Projects Portal — Provincial Government of Benguela",
    },
    description: ui.home.heroSubtitle,
    alternates: {
      canonical: localizedHref(locale, "home"),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizedHref(l, "home")])),
    },
    openGraph: {
      title: "Portal de Projectos de Benguela",
      description: ui.home.heroSubtitle,
      images: [{ url: "/media/hero-benguela.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);

  const [statsRes, projectsRes, updatesRes, settingsRes, heroImagesRes] = await Promise.all([
    safe.stats(),
    safe.projects({ limit: 5 }),
    safe.updates(),
    safe.settings(),
    safe.heroImages(),
  ]);

  const settings = settingsRes.ok ? settingsRes.data : null;
  const activeCount = projectsRes.ok ? projectsRes.data.length : undefined;
  const heroBadge =
    pickSetting(settings ?? {}, "hero_badge", locale) ??
    t(ui.home.heroBadge, { n: activeCount ?? "" });

  const heroImage =
    resolveAssetUrl(pickSetting(settings ?? {}, "hero_image", locale)) ?? "/media/hero-benguela.jpg";

  const heroImages =
    heroImagesRes.ok && heroImagesRes.data.length > 0
      ? heroImagesRes.data.map((image) => resolveAssetUrl(image.url) ?? image.url)
      : [heroImage];

  const projectsUrl = localizedHref(locale, "projects");
  const contactUrl = localizedHref(locale, "contact");

  return (
    <>
      <HeroSection
        locale={locale}
        heroBadge={heroBadge}
        heroImage={heroImage}
        heroImages={heroImages}
        ui={ui}
        projectsUrl={projectsUrl}
        contactUrl={contactUrl}
      />

      {/* NÚMEROS */}
      <section className="bg-[#F8F9FA] dark:bg-[#850b0b]/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#850b0b] dark:text-white font-['Montserrat']">{ui.home.statsTitle}</h2>
            <p className="text-gray-500 dark:text-white/60 mt-2">{ui.home.statsSubtitle}</p>
          </div>
          {!statsRes.ok ? (
            <ApiErrorBox compact locale={locale} ui={ui} />
          ) : statsRes.data.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-white/40 text-sm py-8">{ui.common.empty}</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {statsRes.data.map((stat) => (
                <StatCard key={stat.id} stat={stat} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROJETOS EM DESTAQUE */}
      <section className="py-16 bg-white dark:bg-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#850b0b] dark:text-white font-['Montserrat']">{ui.home.featuredTitle}</h2>
              <p className="text-gray-500 dark:text-white/60 mt-1">{ui.home.featuredSubtitle}</p>
            </div>
            <Link href={projectsUrl} className="inline-flex items-center gap-2 text-[#E8821A] font-medium hover:gap-3 transition-all">
              {ui.common.viewAll} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {!projectsRes.ok ? (
            <ApiErrorBox locale={locale} ui={ui} />
          ) : projectsRes.data.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-white/40 text-sm py-8">{ui.common.empty}</p>
          ) : (
            <FeaturedCarousel projects={projectsRes.data} locale={locale} ui={ui} />
          )}
        </div>
      </section>

      {/* INVESTIDORES — secção institucional do template */}
      <section className="py-20 bg-[#850b0b] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/invest-port.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D4A843] text-sm font-semibold uppercase tracking-widest mb-4 block">{ui.home.investorBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-['Montserrat'] mb-5">{ui.home.investorTitle}</h2>
          <p className="text-white/75 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">{ui.home.investorText}</p>
          <Link
            href={localizedHref(locale, "investor")}
            className="inline-flex items-center gap-2 bg-[#E8821A] hover:bg-[#c96d10] text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            {ui.home.investorCta} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-[#0a1628]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-[#E8821A]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Bell size={28} className="text-[#E8821A]" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat'] mb-2">{ui.home.alertTitle}</h2>
          <p className="text-gray-500 dark:text-white/60 mb-8">{ui.home.alertText}</p>
          <Link
            href={contactUrl}
            className="inline-flex items-center gap-2 bg-[#E8821A] hover:bg-[#c96d10] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            {ui.home.alertCta} <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}