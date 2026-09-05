"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import ApiImage from "./ApiImage";
import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";
import { bi } from "@/lib/fields";
import { catalogName } from "@/lib/api/public";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import { t, type UiStrings } from "@/lib/i18n/ui";
import type { ProjectListOut } from "@/types/api";

/** Carrossel de destaques da homepage — mesma estrutura do template. */
export default function FeaturedCarousel({
  projects,
  locale,
  ui,
}: {
  projects: ProjectListOut[];
  locale: Locale;
  ui: UiStrings;
}) {
  const [idx, setIdx] = useState(0);
  const count = projects.length;
  if (count === 0) return null;
  const clamped = idx % count;

  const prev = () => setIdx((i) => (i - 1 + count) % count);
  const next = () => setIdx((i) => (i + 1) % count);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${clamped * 100}%)` }}>
          {projects.map((p) => {
            const title = bi(p, "title", locale);
            const summary = bi(p, "summary", locale);
            const href = localizedHref(locale, "projects", p.slug);
            return (
              <div key={p.id} className="min-w-full">
                <div className="grid md:grid-cols-2 bg-white dark:bg-[#0F2B5B]/30 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-white/10">
                  <div className="relative h-64 md:h-auto bg-gray-200">
                    <ApiImage src={p.cover_image} alt={title} sizes="(max-width: 768px) 100vw, 50vw" fallbackLabel={ui.detail.noImage} />
                    <div className="absolute top-4 left-4">
                      <StatusBadge status={p.status} locale={locale} />
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <span className="inline-block bg-[#0F2B5B]/8 dark:bg-white/10 text-[#0F2B5B] dark:text-white/80 text-xs font-medium px-3 py-1 rounded-full mb-3">
                        {catalogName(p.sector, locale)}
                      </span>
                      <h3 className="text-xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-2 leading-tight">{title}</h3>
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-white/60 text-sm mb-4">
                        <MapPin size={13} aria-hidden="true" />
                        {t(ui.home.municipalitySuffix, { m: catalogName(p.municipality, locale) })}
                      </div>
                      {summary ? (
                        <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed mb-5 line-clamp-3">{summary}</p>
                      ) : null}
                      <div className="mb-5">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500 dark:text-white/60">{ui.home.executionLabel}</span>
                          <span className="font-semibold text-[#0F2B5B] dark:text-white">{p.progress}%</span>
                        </div>
                        <ProgressBar progress={p.progress} />
                      </div>
                    </div>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 bg-[#E8821A] hover:bg-[#c96d10] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 self-start"
                    >
                      {ui.common.seeDetails} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label={ui.home.prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-[#0F2B5B] shadow-lg rounded-full flex items-center justify-center text-[#0F2B5B] dark:text-white hover:bg-[#D4A843] hover:text-white dark:hover:bg-[#D4A843] transition-colors z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            aria-label={ui.home.nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-[#0F2B5B] shadow-lg rounded-full flex items-center justify-center text-[#0F2B5B] dark:text-white hover:bg-[#D4A843] hover:text-white dark:hover:bg-[#D4A843] transition-colors z-10"
          >
            <ChevronRight size={20} />
          </button>
          <div className="flex justify-center gap-2 mt-5">
            {projects.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setIdx(i)}
                aria-label={t(ui.home.goToSlide, { n: i + 1 })}
                aria-current={i === clamped}
                className={`h-2 rounded-full transition-all ${i === clamped ? "w-8 bg-[#E8821A]" : "w-2 bg-gray-300 dark:bg-white/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
