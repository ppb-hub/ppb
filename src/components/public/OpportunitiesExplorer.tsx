// src/components/public/OpportunitiesExplorer.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ArrowRight,
  Building2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { ApiIcon } from "@/lib/icons";
import { bi } from "@/lib/fields";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import { t, type UiStrings } from "@/lib/i18n/ui";
import { cx } from "@/lib/format";
import type { InvestorOpportunityOut } from "@/types/api";

const PER_PAGE_OPTIONS = [12, 24, 48];
const FAVS_KEY = "gpba_opp_favs";

interface OpportunitiesExplorerProps {
  locale: Locale;
  ui: UiStrings;
  opportunities: InvestorOpportunityOut[];
  initialQuery?: string;
}

export default function OpportunitiesExplorer({
  locale,
  ui,
  opportunities,
  initialQuery = "",
}: OpportunitiesExplorerProps) {
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

  // Filtros ativos (vindos da URL)
  const activeSector = searchParams.get("sector") ?? "";
  const activeType = searchParams.get("type") ?? "";

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
      router.replace(`${localizedHref(locale, "opportunities")}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
    },
    [router, searchParams, locale]
  );

  const setQueryUrl = (value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value.trim()) sp.set("q", value.trim());
    else sp.delete("q");
    router.replace(`${localizedHref(locale, "opportunities")}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
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

  const facetCount = [activeSector, activeType].filter(Boolean).length;

  const clearFilters = () => {
    setQuery("");
    setPage(1);
    router.replace(localizedHref(locale, "opportunities"), { scroll: false });
  };

  // Filtragem e ordenação local
  const filtered = useMemo(() => {
    let result = opportunities;

    // Busca por texto
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((op) => {
        const area = bi(op, "area", locale)?.toLowerCase() ?? "";
        const desc = bi(op, "description", locale)?.toLowerCase() ?? "";
        return area.includes(q) || desc.includes(q);
      });
    }

    // Ordenação
    if (sortBy === "recent") {
      result = [...result].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) => 
        bi(a, "area", locale).localeCompare(bi(b, "area", locale))
      );
    } else if (sortBy === "popular") {
      // Se tiver um campo de popularidade ou interesse
      result = [...result].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    return result;
  }, [opportunities, query, sortBy, locale]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  // Extrair tipos únicos para filtros (baseado em categorias ou tags)
  const opportunityTypes = useMemo(() => {
    const types = new Set<string>();
    opportunities.forEach((op) => {
      if (op.type) types.add(op.type);
      // Ou usar categorias baseadas em setor
      if (op.sector) types.add(op.sector);
    });
    return Array.from(types);
  }, [opportunities]);

  const facetChip = (label: string, onRemove: () => void, tone: string) => (
    <span className={cx("inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full", tone)}>
      {label}
      <button onClick={onRemove} aria-label={`${ui.common.clearFilters}: ${label}`} className="hover:text-red-500">
        <X size={12} />
      </button>
    </span>
  );

  // Função para extrair métricas para exibição
  const getOpportunityMetrics = (op: InvestorOpportunityOut) => {
    const metrics = [];
    if (op.estimated_value) {
      metrics.push({ icon: TrendingUp, label: op.estimated_value });
    }
    if (op.timeline) {
      metrics.push({ icon: Clock, label: op.timeline });
    }
    return metrics;
  };

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
            placeholder={ui.investor.searchPlaceholder || "Buscar oportunidades..."}
            aria-label={ui.investor.searchPlaceholder || "Buscar oportunidades..."}
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
            <span className="bg-[#E8821A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {facetCount}
            </span>
          )}
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label={ui.projects.sortBy}
          className="px-4 py-3 border border-gray-200 dark:border-white/20 bg-white dark:bg-[#0F2B5B]/30 text-[#1a2332] dark:text-white rounded-xl text-sm focus:outline-none focus:border-[#E8821A]"
        >
          <option value="recent">{ui.investor.sortRecent || "Mais recentes"}</option>
          <option value="name">{ui.investor.sortName || "Por nome"}</option>
          <option value="popular">{ui.investor.sortPopular || "Mais populares"}</option>
        </select>
        <div className="flex border border-gray-200 dark:border-white/20 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={cx(
              "px-3 py-3 transition-colors",
              viewMode === "grid"
                ? "bg-[#0F2B5B] text-white"
                : "bg-white dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-50"
            )}
            aria-label={ui.projects.gridAria}
            aria-pressed={viewMode === "grid"}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cx(
              "px-3 py-3 transition-colors",
              viewMode === "list"
                ? "bg-[#0F2B5B] text-white"
                : "bg-white dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-50"
            )}
            aria-label={ui.projects.listAria}
            aria-pressed={viewMode === "list"}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Active facets */}
      {facetCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeSector &&
            facetChip(
              activeSector,
              () => setParam("sector", ""),
              "bg-[#0F2B5B]/10 dark:bg-white/10 text-[#0F2B5B] dark:text-white"
            )}
          {activeType &&
            facetChip(
              activeType,
              () => setParam("type", ""),
              "bg-[#E8821A]/10 text-[#E8821A]"
            )}
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-red-500 underline ml-1"
          >
            {ui.common.clearFilters}
          </button>
        </div>
      )}

      {/* Results */}
      {paginated.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-white/40">
          <p className="text-lg">{ui.investor.noOpportunities || "Nenhuma oportunidade encontrada"}</p>
          <button onClick={clearFilters} className="mt-3 text-[#E8821A] underline text-sm">
            {ui.common.clearFilters}
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((op) => {
            const metrics = getOpportunityMetrics(op);
            return (
              <div
                key={op.id}
                className="group bg-white dark:bg-[#0F2B5B]/30 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: op.color ? `${op.color}55` : undefined }}
              >
                {/* Header com ícone */}
                <div className="relative h-40 bg-gradient-to-br from-[#0F2B5B] to-[#1a3d6e] flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <ApiIcon name={op.icon} size={36} className="text-[#D4A843]" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#D4A843] text-[#0F2B5B] text-xs font-bold px-2.5 py-1 rounded-full">
                      {ui.investor.opportunityBadge || "Oportunidade"}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFavorite(op.id)}
                    aria-label={favorites.includes(op.id) ? ui.projects.favoritesRemove : ui.projects.favoritesAdd}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart
                      size={14}
                      className={favorites.includes(op.id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                    />
                  </button>
                </div>

                {/* Conteúdo */}
                <div className="p-5">
                  {op.type && (
                    <span className="text-xs bg-[#0F2B5B]/8 dark:bg-white/10 text-[#0F2B5B] dark:text-white/70 px-2.5 py-1 rounded-full mb-2 inline-block">
                      {op.type}
                    </span>
                  )}
                  <h3 className="font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] text-base leading-snug mb-2 line-clamp-2">
                    {bi(op, "area", locale)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed mb-4 line-clamp-3">
                    {bi(op, "description", locale)}
                  </p>

                  {/* Métricas */}
                  {metrics.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {metrics.map((metric, idx) => {
                        const Icon = metric.icon;
                        return (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/50">
                            <Icon size={12} aria-hidden="true" />
                            <span>{metric.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Link
                    href={`${localizedHref(locale, "contact")}?interesse=investidor&oportunidade=${op.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-[#0F2B5B] hover:bg-[#E8821A] text-white text-sm font-medium py-2.5 rounded-xl transition-colors duration-200"
                  >
                    {ui.investor.requestStudy} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((op) => (
            <div
              key={op.id}
              className="bg-white dark:bg-[#0F2B5B]/30 border border-gray-100 dark:border-white/10 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="relative w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-[#0F2B5B] to-[#1a3d6e] flex items-center justify-center">
                <ApiIcon name={op.icon} size={24} className="text-[#D4A843]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#D4A843] text-[#0F2B5B] text-xs font-bold px-2 py-0.5 rounded-full">
                    {ui.investor.opportunityBadge || "Oportunidade"}
                  </span>
                  {op.type && (
                    <span className="text-xs text-gray-400 dark:text-white/50">{op.type}</span>
                  )}
                </div>
                <h3 className="font-semibold text-[#0F2B5B] dark:text-white text-sm truncate">
                  {bi(op, "area", locale)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-white/60 line-clamp-1 mt-0.5">
                  {bi(op, "description", locale)}
                </p>
              </div>
              <Link
                href={`${localizedHref(locale, "contact")}?interesse=investidor&oportunidade=${op.id}`}
                className="px-4 py-2 bg-[#0F2B5B] hover:bg-[#E8821A] text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                {ui.investor.requestStudy}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > perPage && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-white/50">
            {t(ui.projects.showing, {
              from: (safePage - 1) * perPage + 1,
              to: Math.min(safePage * perPage, filtered.length),
              total: filtered.length,
            })}
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
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 12)
              .map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cx(
                    "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                    n === safePage
                      ? "bg-[#0F2B5B] text-white"
                      : "border border-gray-200 dark:border-white/20 text-gray-600 dark:text-white/60 hover:border-[#0F2B5B]"
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

      {/* Filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={ui.projects.filters}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white dark:bg-[#0F2B5B] shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
              <h2 className="font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">
                {ui.projects.filters}
              </h2>
              <button
                onClick={() => setFilterOpen(false)}
                aria-label={ui.menu.close}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Filtro por tipo */}
              {opportunityTypes.length > 0 && (
                <FacetGroup title={ui.investor.filterByType || "Tipo de oportunidade"}>
                  <FacetRadio
                    name="type"
                    label={ui.projects.all || "Todos"}
                    checked={!activeType}
                    onChange={() => setParam("type", "")}
                  />
                  {opportunityTypes.map((type) => (
                    <FacetRadio
                      key={type}
                      name="type"
                      label={type}
                      checked={activeType === type}
                      onChange={() => setParam("type", activeType === type ? "" : type)}
                    />
                  ))}
                </FacetGroup>
              )}

              {/* Filtro por setor (exemplo) */}
              <FacetGroup title={ui.investor.filterBySector || "Setor"}>
                <FacetRadio
                  name="sector"
                  label={ui.projects.all || "Todos"}
                  checked={!activeSector}
                  onChange={() => setParam("sector", "")}
                />
                <FacetRadio
                  name="sector"
                  label="Infraestrutura"
                  checked={activeSector === "infraestrutura"}
                  onChange={() => setParam("sector", activeSector === "infraestrutura" ? "" : "infraestrutura")}
                />
                <FacetRadio
                  name="sector"
                  label="Energia"
                  checked={activeSector === "energia"}
                  onChange={() => setParam("sector", activeSector === "energia" ? "" : "energia")}
                />
                <FacetRadio
                  name="sector"
                  label="Turismo"
                  checked={activeSector === "turismo"}
                  onChange={() => setParam("sector", activeSector === "turismo" ? "" : "turismo")}
                />
                <FacetRadio
                  name="sector"
                  label="Agricultura"
                  checked={activeSector === "agricultura"}
                  onChange={() => setParam("sector", activeSector === "agricultura" ? "" : "agricultura")}
                />
              </FacetGroup>
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-white/10 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-2.5 border border-gray-200 dark:border-white/20 rounded-xl text-sm font-medium text-gray-600 dark:text-white hover:border-gray-400 transition-colors"
              >
                {ui.projects.clear}
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#E8821A] text-white rounded-xl text-sm font-medium hover:bg-[#c96d10] transition-colors"
              >
                {ui.projects.apply}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast (favoritos) */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#0F2B5B] text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in"
        >
          <Heart size={14} className="fill-red-400 text-red-400" />
          {toastMsg}
        </div>
      )}

      {/* FAB */}
      <Link
        href={localizedHref(locale, "contact")}
        aria-label={ui.projects.fabAria}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#E8821A] hover:bg-[#c96d10] text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
      >
        <MessageSquare size={22} />
      </Link>
    </div>
  );
}

// Componentes auxiliares
function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-sm text-[#0F2B5B] dark:text-white mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FacetRadio({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-white/70">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-[#E8821A]" />
      {label}
    </label>
  );
}