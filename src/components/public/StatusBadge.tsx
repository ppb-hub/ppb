import type { ProjectStatusOut } from "@/types/api";
import type { Locale } from "@/lib/i18n/config";
import { catalogName } from "@/lib/api/public";

/**
 * Badge de status como no template, mas a cor/nome vêm do catálogo da API
 * (ProjectStatusOut.color + name_pt/name_en) em vez de strings hardcoded.
 */
export default function StatusBadge({ status, locale }: { status: ProjectStatusOut; locale: Locale }) {
  const color = /^#[0-9a-fA-F]{3,8}$/.test(status.color ?? "") ? status.color : "#9CA3AF";
  const label = catalogName(status, locale) || status.slug;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
