import Image from "next/image";
import { resolveAssetUrl } from "@/lib/api/config";

/**
 * Imagem "segura para a API":
 * - resolve URLs relativas (uploads do backend) via proxy /backend;
 * - mantém aspect ratio + lazy loading + alt;
 * - quando a API não tem imagem, mostra um placeholder com gradiente
 *   (nunca uma imagem partida).
 */
export default function ApiImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className,
  sizes,
  priority,
  fallbackLabel,
}: {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackLabel?: string;
}) {
  const url = resolveAssetUrl(src);

  if (!url) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`h-full w-full bg-gradient-to-br from-[#0F2B5B]/15 via-[#D4A843]/10 to-[#E8821A]/15 dark:from-white/10 dark:via-white/5 dark:to-white/10 flex items-center justify-center ${className ?? ""}`}
      >
        {fallbackLabel ? (
          <span className="text-xs text-gray-400 dark:text-white/40 px-4 text-center">{fallbackLabel}</span>
        ) : null}
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes ?? "100vw"}
        className={`object-cover ${className ?? ""}`}
        loading={priority ? undefined : "lazy"}
      />
    );
  }
  return (
    <Image
      src={url}
      alt={alt}
      width={width ?? 800}
      height={height ?? 450}
      className={`object-cover ${className ?? ""}`}
      loading={priority ? undefined : "lazy"}
    />
  );
}
