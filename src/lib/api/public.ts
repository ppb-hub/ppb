import { apiFetch, apiGetSafe, qs, type SafeResult } from "./server-fetch";
import type {
  AboutContentOut,
  ContactCreate,
  ContactResponse,
  HomeStatOut,
  InvestorDocumentOut,
  InvestorIndicatorOut,
  InvestorOpportunityOut,
  MilestoneOut,
  MunicipalityOut,
  OrgMemberOut,
  ProjectDetailOut,
  ProjectListOut,
  ProjectStatusOut,
  SectorOut,
  SettingsMap,
  TestimonialOut,
  UpdateOut,
  HeroImageOut
} from "@/types/api";
import type { Locale } from "@/lib/i18n/config";

/**
 * Operações PÚBLICAS — 1:1 com as rotas documentadas em FRONTEND_API.md.
 * O idioma é resolvido no frontend a partir dos campos *_pt/*_en devolvidos
 * (a API não aceita query param `lang`).
 */

export const getProjects = (filters: {
  sector?: string;
  municipality?: string;
  status?: string;
  limit?: number;
  show_inactive?: boolean;
} = {}) => apiFetch<ProjectListOut[]>(`/api/projects${qs(filters)}`);

export const getProject = (slug: string) =>
  apiFetch<ProjectDetailOut>(`/api/projects/${encodeURIComponent(slug)}`);

export const getSectors = () => apiFetch<SectorOut[]>("/api/catalog/sectors");
export const getMunicipalities = () => apiFetch<MunicipalityOut[]>("/api/catalog/municipalities");
export const getStatuses = () => apiFetch<ProjectStatusOut[]>("/api/catalog/statuses");

export const getStats = () => apiFetch<HomeStatOut[]>("/api/stats");
export const getUpdates = () => apiFetch<UpdateOut[]>("/api/updates");
export const getAbout = () => apiFetch<AboutContentOut>("/api/about");
export const getOrg = () => apiFetch<OrgMemberOut[]>("/api/about/org");
export const getMilestones = () => apiFetch<MilestoneOut[]>("/api/about/milestones");

export const getInvestorOpportunities = () => apiFetch<InvestorOpportunityOut[]>("/api/investor/opportunities");
export const getInvestorIndicators = () => apiFetch<InvestorIndicatorOut[]>("/api/investor/indicators");
export const getInvestorTestimonials = () => apiFetch<TestimonialOut[]>("/api/investor/testimonials");
export const getInvestorDocuments = () => apiFetch<InvestorDocumentOut[]>("/api/investor/documents");

/** POST do formulário de contacto (o backend trata do envio de e-mail). */
export const sendContact = (data: ContactCreate) =>
  apiFetch<ContactResponse>("/api/contact", { method: "POST", body: data, mutation: true });

export const getHealth = () => apiFetch<unknown>("/health", { ttlMs: 0 });

/* ---------- Variantes "safe" para Server Components ---------- */
export const safe = {
  projects: (filters?: Parameters<typeof getProjects>[0]) =>
    apiGetSafe<ProjectListOut[]>(`/api/projects${qs(filters ?? {})}`),
  project: (slug: string) => apiGetSafe<ProjectDetailOut>(`/api/projects/${encodeURIComponent(slug)}`),
  sectors: () => apiGetSafe<SectorOut[]>("/api/catalog/sectors"),
  municipalities: () => apiGetSafe<MunicipalityOut[]>("/api/catalog/municipalities"),
  statuses: () => apiGetSafe<ProjectStatusOut[]>("/api/catalog/statuses"),
  settings: () => apiGetSafe<SettingsMap>("/api/settings"),
  stats: () => apiGetSafe<HomeStatOut[]>("/api/stats"),
  updates: () => apiGetSafe<UpdateOut[]>("/api/updates"),
  about: () => apiGetSafe<AboutContentOut>("/api/about"),
  org: () => apiGetSafe<OrgMemberOut[]>("/api/about/org"),
  milestones: () => apiGetSafe<MilestoneOut[]>("/api/about/milestones"),
  investorOpportunities: () => apiGetSafe<InvestorOpportunityOut[]>("/api/investor/opportunities"),
  investorIndicators: () => apiGetSafe<InvestorIndicatorOut[]>("/api/investor/indicators"),
  investorTestimonials: () => apiGetSafe<TestimonialOut[]>("/api/investor/testimonials"),
  investorDocuments: () => apiGetSafe<InvestorDocumentOut[]>("/api/investor/documents"),  heroImages: () => apiGetSafe<HeroImageOut[]>('/api/hero-images'),};

export type { SafeResult };

/* ---------- Settings: normalização defensiva do objeto devolvido ---------- */
/**
 * GET /api/settings devolve "object". O OpenAPI não fixa o shape interno;
 * suportamos defensively: { key: "valor" } e { key: { value_pt, value_en } }
 * (SiteSettingOut). Nunca inventamos chaves — apenas lemos as existentes.
 */
export function pickSetting(settings: SettingsMap | null, key: string, lang: Locale): string | null {
  if (!settings) return null;
  const value = settings[key];
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value || null;
  const localized = lang === "pt" ? value.value_pt : value.value_en;
  const fallback = lang === "pt" ? value.value_en : value.value_pt;
  return (localized && localized.trim()) || (fallback && fallback.trim()) || null;
}

export function catalogName(
  item: { name_pt?: string | null; name_en?: string | null } | null | undefined,
  lang: Locale
): string {
  if (!item) return "";
  const primary = lang === "pt" ? item.name_pt : item.name_en;
  const fallback = lang === "pt" ? item.name_en : item.name_pt;
  return (primary && primary.trim()) || (fallback && fallback.trim()) || "";
}


import { browserFetch } from "./server-fetch";

const callPublic = <T>(path: string) => browserFetch<T>(path);

export const getHeroImages = () => callPublic<HeroImageOut[]>("/api/hero-images");