"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  MapPin,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import ApiImage from "./ApiImage";
import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";
import { bi } from "@/lib/fields";
import { catalogName } from "@/lib/api/public";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import { t, type UiStrings } from "@/lib/i18n/ui";
import { formatMoneyKz, cx } from "@/lib/format";
import type { MunicipalityOut, ProjectListOut, ProjectStatusOut, SectorOut } from "@/types/api";

const PER_PAGE_OPTIONS = [12, 24, 48];
const FAVS_KEY = "gpba_favs";

/**
 * Listagem do template, ligada a dados reais.
 * - Filtros suportados pela API (sector/municipality/status) vivem no URL e
 *   são aplicados no pedido GET /api/projects;
 * - busca de texto, ordenação, paginação e vista são refinamentos locais
 *   (a API não expõe esses parâmetros);
 * - favoritos são uma preferência local do browser (sem endpoint na API).
 */
export default function ProjectsExplorer({
  locale,
  ui,
  projects,
  sectors,
  municipalities,
  statuses,
  initialQuery,
}: {
  locale: Locale;
  ui: UiStrings;
  projects: ProjectListOut[];
  sectors: SectorOut[];
  municipalities: MunicipalityOut[];
  statuses: ProjectStatusOut[];
  initialQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toastMsg, setToastMsg] = useState("");

  const activeSector = searchParams.get("sector") ?? "";
  const activeMunicipality = searchParams.get("municipality") ?? "";
  const activeStatus = searchParams.get("status") ?? "";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVS_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value) sp.set(key, value);
      else sp.delete(key);
      setPage(1);
      router.replace(`${localizedHref(locale, "projects")}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
    },
    [router, searchParams, locale]
  );

  const setQueryUrl = (value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value.trim()) sp.set("q", value.trim());
    else sp.delete("q");
    router.replace(`${localizedHref(locale, "projects")}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const added = !prev.includes(id);
      const nextFavs = added ? [...prev, id] : prev.filter((f) => f !== id);
      try {
        localStorage.setItem(FAVS_KEY, JSON.stringify(nextFavs));
      } catch {
        /* noop */
      }
      setToastMsg(added ? ui.projects.favoritesToastAdd : ui.projects.favoritesToastRemove);
      window.setTimeout(() => setToastMsg(""), 2500);
      return nextFavs;
    });
  };

  const facetCount = [activeSector, activeMunicipality, activeStatus].filter(Boolean).length;

  const clearFilters = () => {
    setQuery("");
    setPage(1);
    router.replace(localizedHref(locale, "projects"), { scroll: false });
  };

  const textOf = (p: ProjectListOut) =>
    `${bi(p, "title", locale)} ${catalogName(p.municipality, locale)} ${catalogName(p.sector, locale)}`.toLowerCase();

  const moneyValue = (p: ProjectListOut) => {
    const raw = (p.value_kz ?? "").toString().replace(/[^\d,\.]/g, "").replace(/\./g, "").replace(",", ".");
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const filtered = useMemo(() => {
    let result = projects;
    const q = query.trim().toLowerCase();
    if (q) result = result.filter((p) => textOf(p).includes(q));
    if (sortBy === "value") result = [...result].sort((a, b) => moneyValue(b) - moneyValue(a));
    else if (sortBy === "progress") result = [...result].sort((a, b) => b.progress - a.progress);
    else if (sortBy === "name")
      result = [...result].sort((a, b) => bi(a, "title", locale).localeCompare(bi(b, "title", locale)));
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, query, sortBy, locale]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const facetChip = (label: string, onRemove: () => void, tone: string) => (
    <span className={cx("inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full", tone)}>
      {label}
      <button onClick={onRemove} aria-label={`${ui.common.clearFilters}: ${label}`} className="hover:text-red-500">
        <X size={12} />
      </button>
    </span>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            onBlur={() => setQueryUrl(query)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setQueryUrl(query);
              }
            }}
            placeholder={ui.projects.searchPlaceholder}
            aria-label={ui.projects.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 text-[#1a2332] dark:text-white rounded-xl focus:outline-none focus:border-[#E8821A] transition-colors text-sm"
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 dark:border-white/20 rounded-xl text-sm font-medium text-[#0F2B5B] dark:text-white hover:border-[#0F2B5B] dark:hover:border-white transition-colors bg-white dark:bg-white/5"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          {ui.projects.filter}
          {facetCount > 0 && (
            <span className="bg-[#E8821A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{facetCount}</span>
          )}
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label={ui.projects.sortBy}
          className="px-4 py-3 border border-gray-200 dark:border-white/20 bg-white dark:bg-[#0F2B5B]/30 text-[#1a2332] dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#E8821A]"
        >
          <option value="recent">{ui.projects.sortRecent}</option>
          <option value="value">{ui.projects.sortValue}</option>
          <option value="progress">{ui.projects.sortProgress}</option>
          <option value="name">{ui.projects.sortName}</option>
        </select>
        <div className="flex border border-gray-200 dark:border-white/20 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={cx("px-3 py-3 transition-colors", viewMode === "grid" ? "bg-[#0F2B5B] text-white" : "bg-white dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-50")}
            aria-label={ui.projects.gridAria}
            aria-pressed={viewMode === "grid"}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cx("px-3 py-3 transition-colors", viewMode === "list" ? "bg-[#0F2B5B] text-white" : "bg-white dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-50")}
            aria-label={ui.projects.listAria}
            aria-pressed={viewMode === "list"}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Active facets (aplicados via API) */}
      {facetCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeMunicipality &&
            facetChip(catalogName(municipalities.find((m) => m.slug === activeMunicipality), locale) || activeMunicipality, () => setParam("municipality", ""), "bg-[#0F2B5B]/10 dark:bg-white/10 text-[#0F2B5B] dark:text-white")}
          {activeSector &&
            facetChip(catalogName(sectors.find((s) => s.slug === activeSector), locale) || activeSector, () => setParam("sector", ""), "bg-[#E8821A]/10 text-[#E8821A]")}
          {activeStatus &&
            facetChip(catalogName(statuses.find((s) => s.slug === activeStatus), locale) || activeStatus, () => setParam("status", ""), "bg-[#D4A843]/10 text-[#D4A843]")}
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 underline ml-1">
            {ui.common.clearFilters}
          </button>
        </div>
      )}

      {/* Results */}
      {paginated.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-white/40">
          <p className="text-lg">{ui.projects.empty}</p>
          <button onClick={clearFilters} className="mt-3 text-[#E8821A] underline text-sm">
            {ui.common.clearFilters}
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((p) => (
            <div
              key={p.id}
              className="group bg-white dark:bg-[#0F2B5B]/30 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 bg-gray-100">
                <ApiImage src={p.cover_image} alt={bi(p, "title", locale)} sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" fallbackLabel={ui.detail.noImage} />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={p.status} locale={locale} />
                </div>
                <button
                  onClick={() => toggleFavorite(p.id)}
                  aria-label={favorites.includes(p.id) ? ui.projects.favoritesRemove : ui.projects.favoritesAdd}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart size={14} className={favorites.includes(p.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                </button>
              </div>
              <div className="p-5">
                <span className="text-xs bg-[#0F2B5B]/8 dark:bg-white/10 text-[#0F2B5B] dark:text-white/70 px-2.5 py-1 rounded-full mb-2 inline-block">
                  {catalogName(p.sector, locale)}
                </span>
                <h3 className="font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] text-sm leading-snug mb-2 line-clamp-2">
                  {bi(p, "title", locale)}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-white/50 text-xs mb-3">
                  <MapPin size={11} aria-hidden="true" /> {catalogName(p.municipality, locale)}
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 dark:text-white/50">{ui.projects.execLabel}</span>
                    <span className="font-semibold text-[#0F2B5B] dark:text-white">{p.progress}%</span>
                  </div>
                  <ProgressBar progress={p.progress} />
                </div>
                {p.value_kz ? <div className="text-xs text-[#E8821A] font-semibold mb-4">{formatMoneyKz(p.value_kz)}</div> : null}
                <Link
                  href={localizedHref(locale, "projects", p.slug)}
                  className="flex items-center justify-center gap-2 w-full bg-[#0F2B5B] hover:bg-[#E8821A] text-white text-sm font-medium py-2.5 rounded-xl transition-colors duration-200"
                >
                  {ui.common.seeDetails} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((p) => (
            <div key={p.id} className="bg-white dark:bg-[#0F2B5B]/30 border border-gray-100 dark:border-white/10 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <ApiImage src={p.cover_image} alt={bi(p, "title", locale)} sizes="80px" fallbackLabel="" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={p.status} locale={locale} />
                  <span className="text-xs text-gray-400 dark:text-white/50">{catalogName(p.sector, locale)}</span>
                </div>
                <h3 className="font-semibold text-[#0F2B5B] dark:text-white text-sm truncate">{bi(p, "title", locale)}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-white/50">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} aria-hidden="true" />
                    {catalogName(p.municipality, locale)}
                  </span>
                  {p.value_kz ? <span className="text-[#E8821A] font-medium">{formatMoneyKz(p.value_kz)}</span> : null}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 shrink-0">
                <div className="w-24">
                  <div className="text-xs text-right mb-1 font-medium text-[#0F2B5B] dark:text-white">{p.progress}%</div>
                  <ProgressBar progress={p.progress} />
                </div>
                <Link
                  href={localizedHref(locale, "projects", p.slug)}
                  className="px-4 py-2 bg-[#0F2B5B] hover:bg-[#E8821A] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {locale === "pt" ? "Ver" : "View"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > perPage && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-white/50">
            {t(ui.projects.showing, { from: (safePage - 1) * perPage + 1, to: Math.min(safePage * perPage, filtered.length), total: filtered.length })}
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => setPage((pg) => Math.max(1, pg - 1))}
              disabled={safePage === 1}
              aria-label={ui.home.prevSlide}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/20 disabled:opacity-40 hover:border-[#0F2B5B] dark:hover:border-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 12).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={cx(
                  "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                  n === safePage ? "bg-[#0F2B5B] text-white" : "border border-gray-200 dark:border-white/20 text-gray-600 dark:text-white/60 hover:border-[#0F2B5B]"
                )}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((pg) => Math.min(totalPages, pg + 1))}
              disabled={safePage === totalPages}
              aria-label={ui.home.nextSlide}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/20 disabled:opacity-40 hover:border-[#0F2B5B] dark:hover:border-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              aria-label={ui.projects.perPage.replace("{n}", "")}
              className="ml-2 px-3 py-2 border border-gray-200 dark:border-white/20 bg-white dark:bg-[#0a1628] text-sm rounded-lg focus:outline-none"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {t(ui.projects.perPage, { n })}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filter drawer — facetes single-select porque a API aceita um valor por parâmetro */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={ui.projects.filters}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white dark:bg-[#0F2B5B] shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
              <h2 className="font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">{ui.projects.filters}</h2>
              <button onClick={() => setFilterOpen(false)} aria-label={ui.menu.close} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-6">
              <FacetGroup title={ui.projects.byMunicipality}>
                {municipalities.map((m) => (
                  <FacetRadio name="muni" key={m.id} label={catalogName(m, locale) || m.slug} checked={activeMunicipality === m.slug} onChange={() => setParam("municipality", activeMunicipality === m.slug ? "" : m.slug)} />
                ))}
              </FacetGroup>
              <FacetGroup title={ui.projects.bySector}>
                {sectors.map((s) => (
                  <FacetRadio name="sector" key={s.id} label={catalogName(s, locale) || s.slug} checked={activeSector === s.slug} onChange={() => setParam("sector", activeSector === s.slug ? "" : s.slug)} />
                ))}
              </FacetGroup>
              <FacetGroup title={ui.projects.byStatus}>
                <FacetRadio name="status" label={ui.projects.all} checked={!activeStatus} onChange={() => setParam("status", "")} />
                {statuses.map((s) => (
                  <FacetRadio name="status" key={s.id} label={catalogName(s, locale) || s.slug} checked={activeStatus === s.slug} onChange={() => setParam("status", activeStatus === s.slug ? "" : s.slug)} />
                ))}
              </FacetGroup>
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-white/10 flex gap-3">
              <button onClick={clearFilters} className="flex-1 py-2.5 border border-gray-200 dark:border-white/20 rounded-xl text-sm font-medium text-gray-600 dark:text-white hover:border-gray-400 transition-colors">
                {ui.projects.clear}
              </button>
              <button onClick={() => setFilterOpen(false)} className="flex-1 py-2.5 bg-[#E8821A] text-white rounded-xl text-sm font-medium hover:bg-[#c96d10] transition-colors">
                {ui.projects.apply}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast (favoritos locais) */}
      {toastMsg && (
        <div role="status" className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#0F2B5B] text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <Heart size={14} className="fill-red-400 text-red-400" />
          {toastMsg}
        </div>
      )}

      {/* FAB — o formulário de contacto completo está em /contacto (API real) */}
      <Link
        href={`${localizedHref(locale, "contact")}`}
        aria-label={ui.projects.fabAria}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#E8821A] hover:bg-[#c96d10] text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
      >
        <MessageSquare size={22} />
      </Link>
    </div>
  );
}

function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-sm text-[#0F2B5B] dark:text-white mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FacetRadio({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-white/70">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-[#E8821A]" />
      {label}
    </label>
  );
}
