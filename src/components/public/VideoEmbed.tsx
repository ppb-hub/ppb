"use client";

import { useState } from "react";

import { readConsent, saveConsent, hasConsent } from "@/lib/consent";
import type { UiStrings } from "@/lib/i18n/ui";

/**
 * Vídeo institucional:
 * - ficheiro próprio (mp4/webm) → <video> nativo com poster (1ª parte, sem gate);
 * - YouTube/Vimeo → iframe de terceiro, carregado APÓS consentimento de cookies.
 */
export default function VideoEmbed({
  url,
  thumbnail,
  title,
  ui,
}: {
  url: string;
  thumbnail?: string | null;
  posterFallback?: string | null;
  title: string;
  ui: UiStrings;
}) {
  const [allowed, setAllowed] = useState(() => hasConsent());

  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  const external = yt ? { kind: "yt" as const, id: yt[1] } : vimeo ? { kind: "vimeo" as const, id: vimeo[1] } : null;

  const grantConsent = () => {
    const prev = readConsent();
    saveConsent({ analytics: prev?.analytics ?? false });
    setAllowed(true);
  };

  if (external && !allowed) {
    return (
      <div className="rounded-2xl overflow-hidden bg-[#0F2B5B]/10 dark:bg-white/5 aspect-video relative border border-gray-100 dark:border-white/10">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" aria-hidden="true" loading="lazy" />
        ) : null}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-white/80 text-sm max-w-md drop-shadow">{ui.about.videoConsent}</p>
          <button
            onClick={grantConsent}
            className="px-5 py-2.5 bg-[#E8821A] hover:bg-[#c96d10] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {ui.about.videoConsentBtn}
          </button>
        </div>
      </div>
    );
  }

  if (external) {
    return (
      <div className="rounded-2xl overflow-hidden bg-[#0F2B5B]/10 dark:bg-white/5 aspect-video relative border border-gray-100 dark:border-white/10">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={external.kind === "yt" ? `https://www.youtube-nocookie.com/embed/${external.id}?rel=0` : `https://player.vimeo.com/video/${external.id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  // Ficheiro de vídeo servido pelo próprio backend
  return (
    <div className="rounded-2xl overflow-hidden bg-[#0F2B5B]/10 dark:bg-white/5 aspect-video relative border border-gray-100 dark:border-white/10 group">
      <video src={url} poster={thumbnail ?? undefined} controls playsInline preload="metadata" className="absolute inset-0 w-full h-full" aria-label={title}>
        {title}
      </video>
      {!allowed ? <span className="sr-only">{ui.about.watchVideo}</span> : null}
    </div>
  );
}
