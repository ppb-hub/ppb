import Link from "next/link";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import type { UiStrings } from "@/lib/i18n/ui";

export default function Breadcrumbs({
  locale,
  ui,
  items,
  centered,
}: {
  locale: Locale;
  ui: UiStrings;
  items: Array<{ label: string; href?: string }>;
  centered?: boolean;
}) {
  const home = { label: ui.common.home, href: localizedHref(locale, "home") };
  const all = [home, ...items];
  return (
    <nav aria-label="Breadcrumb" className={`text-white/50 text-sm mb-3 flex flex-wrap items-center gap-2 ${centered ? "justify-center" : ""}`}>
      {all.map((item, i) => {
        const last = i === all.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={last ? "text-white line-clamp-1" : ""} aria-current={last ? "page" : undefined}>
                {item.label}
              </span>
            )}
            {!last && <span aria-hidden="true">{ui.common.breadcrumbSep}</span>}
          </span>
        );
      })}
    </nav>
  );
}
