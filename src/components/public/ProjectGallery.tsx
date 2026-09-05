"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { resolveAssetUrl } from "@/lib/api/config";
import { cx } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { t, type UiStrings } from "@/lib/i18n/ui";

/** Galeria + lightbox — imagens vindas de ProjectDetailOut.cover_image / images[]. */
export default function ProjectGallery({
  images,
  title,
  locale,
  ui,
}: {
  images: Array<{ url: string | null; alt: string }>;
  title: string;
  locale: Locale;
  ui: UiStrings;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = images.length;
  const idx = count ? imgIdx % count : 0;
  const current = resolveAssetUrl(images[idx]?.url);

  if (count === 0) return null;

  const go = (delta: number) => setImgIdx((i) => (i + delta + count) % count);

  return (
    <div className="mb-8">
      <div
        className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 aspect-video cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt={t(ui.detail.imageAlt, { i: idx + 1, title })}
            className="w-full h-full object-cover"
            loading={idx === 0 ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-white/40 text-sm">
            {ui.detail.noImage}
          </div>
        )}
        {count > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label={ui.home.prevSlide}
              className="w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label={ui.home.nextSlide}
              className="w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 mt-2">
          {images.map((img, i) => {
            const url = resolveAssetUrl(img.url);
            return (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                aria-label={t(ui.detail.galleryOf, { i: i + 1, n: count })}
                aria-current={i === idx}
                className={cx(
                  "flex-1 rounded-lg overflow-hidden aspect-video bg-gray-100 dark:bg-white/10 border-2 transition-all",
                  i === idx ? "border-[#E8821A]" : "border-transparent opacity-60 hover:opacity-80"
                )}
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {lightboxOpen && current && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setLightboxOpen(false)} aria-label={ui.menu.close}>
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt={t(ui.detail.imageAlt, { i: idx + 1, title })} className="max-w-full max-h-full rounded-xl" onClick={(e) => e.stopPropagation()} />
          {count > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label={ui.home.prevSlide}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label={ui.home.nextSlide}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
