import { browserFetch } from "./server-fetch";
import { getToken } from "./auth";
import type {
  AboutContentIn,
  AboutContentOut,
  HomeStatIn,
  HomeStatOut,
  InvestorDocumentIn,
  InvestorDocumentOut,
  InvestorIndicatorIn,
  InvestorIndicatorOut,
  InvestorOpportunityIn,
  InvestorOpportunityOut,
  MessageDetailOut,
  MessageListItem,
  MilestoneIn,
  MilestoneOut,
  OrgMemberIn,
  OrgMemberOut,
  ProjectCreate,
  ProjectDetailOut,
  ProjectListOut,
  ProjectUpdate,
  SettingsMap,
  TestimonialIn,
  TestimonialOut,
  UpdateIn,
  UpdateOut,
  HeroImageOut,
  HeroImageIn,
  HeroImageUpdate
} from "@/types/api";

/**
 * Operações ADMINISTRATIVAS via browser (proxy /backend + Bearer + cookie).
 * 1:1 com os endpoints documentados; nada além disto é chamado pelo painel.
 */
const call = <T>(path: string, init?: { method?: string; body?: unknown }) =>
  browserFetch<T>(path, { ...init, token: getToken() });

/* ---------- Projetos ---------- */
export const listProjects = () => call<ProjectListOut[]>("/api/admin/projects");
export const getProject = (id: number) => call<ProjectDetailOut>(`/api/admin/projects/${id}`);
export const createProject = (data: ProjectCreate) =>
  call<ProjectDetailOut>("/api/admin/projects", { method: "POST", body: data });
export const updateProject = (id: number, data: ProjectUpdate) =>
  call<ProjectDetailOut>(`/api/admin/projects/${id}`, { method: "PUT", body: data });
export const deleteProject = (id: number) => call<void>(`/api/admin/projects/${id}`, { method: "DELETE" });
export const setProjectActive = (id: number, ativo: boolean) =>
  call<ProjectListOut>(`/api/admin/projects/${id}/active`, { method: "PATCH", body: { ativo } });

/* ---------- Settings da homepage / site ---------- */
export const getSettings = () => call<SettingsMap>("/api/admin/settings");
export const putSettings = (map: Record<string, unknown>) =>
  call<SettingsMap>("/api/admin/settings", { method: "PUT", body: map });

/* ---------- Números (apenas editar — sem create/delete documentados) ---------- */
export const listStats = () => call<HomeStatOut[]>("/api/admin/stats");
export const updateStat = (id: number, data: HomeStatIn) =>
  call<HomeStatOut>(`/api/admin/stats/${id}`, { method: "PUT", body: data });

/* ---------- Atualizações ---------- */
export const listUpdates = () => call<UpdateOut[]>("/api/admin/updates");
export const createUpdate = (data: UpdateIn) => call<UpdateOut>("/api/admin/updates", { method: "POST", body: data });
export const updateUpdate = (id: number, data: UpdateIn) =>
  call<UpdateOut>(`/api/admin/updates/${id}`, { method: "PUT", body: data });
export const deleteUpdate = (id: number) => call<void>(`/api/admin/updates/${id}`, { method: "DELETE" });

/* ---------- Conteúdo institucional (About) ---------- */
export const getAbout = () => call<AboutContentOut>("/api/admin/about");
export const putAbout = (data: AboutContentIn) =>
  call<AboutContentOut>("/api/admin/about", { method: "PUT", body: data });

export const listOrg = () => call<OrgMemberOut[]>("/api/admin/org");
export const createOrg = (data: OrgMemberIn) => call<OrgMemberOut>("/api/admin/org", { method: "POST", body: data });
export const updateOrg = (id: number, data: OrgMemberIn) =>
  call<OrgMemberOut>(`/api/admin/org/${id}`, { method: "PUT", body: data });
export const deleteOrg = (id: number) => call<void>(`/api/admin/org/${id}`, { method: "DELETE" });

export const listMilestones = () => call<MilestoneOut[]>("/api/admin/milestones");
export const createMilestone = (data: MilestoneIn) =>
  call<MilestoneOut>("/api/admin/milestones", { method: "POST", body: data });
export const updateMilestone = (id: number, data: MilestoneIn) =>
  call<MilestoneOut>(`/api/admin/milestones/${id}`, { method: "PUT", body: data });
export const deleteMilestone = (id: number) => call<void>(`/api/admin/milestones/${id}`, { method: "DELETE" });

/* ---------- Investidor ---------- */
export const listOpportunities = () => call<InvestorOpportunityOut[]>("/api/admin/opportunities");
export const createOpportunity = (data: InvestorOpportunityIn) =>
  call<InvestorOpportunityOut>("/api/admin/opportunities", { method: "POST", body: data });
export const updateOpportunity = (id: number, data: InvestorOpportunityIn) =>
  call<InvestorOpportunityOut>(`/api/admin/opportunities/${id}`, { method: "PUT", body: data });
export const deleteOpportunity = (id: number) => call<void>(`/api/admin/opportunities/${id}`, { method: "DELETE" });

export const listIndicators = () => call<InvestorIndicatorOut[]>("/api/admin/indicators");
export const createIndicator = (data: InvestorIndicatorIn) =>
  call<InvestorIndicatorOut>("/api/admin/indicators", { method: "POST", body: data });
export const updateIndicator = (id: number, data: InvestorIndicatorIn) =>
  call<InvestorIndicatorOut>(`/api/admin/indicators/${id}`, { method: "PUT", body: data });
export const deleteIndicator = (id: number) => call<void>(`/api/admin/indicators/${id}`, { method: "DELETE" });

export const listTestimonials = () => call<TestimonialOut[]>("/api/admin/testimonials");
export const createTestimonial = (data: TestimonialIn) =>
  call<TestimonialOut>("/api/admin/testimonials", { method: "POST", body: data });
export const updateTestimonial = (id: number, data: TestimonialIn) =>
  call<TestimonialOut>(`/api/admin/testimonials/${id}`, { method: "PUT", body: data });
export const deleteTestimonial = (id: number) => call<void>(`/api/admin/testimonials/${id}`, { method: "DELETE" });

export const listInvestorDocs = () => call<InvestorDocumentOut[]>("/api/admin/documents");
export const createInvestorDoc = (data: InvestorDocumentIn) =>
  call<InvestorDocumentOut>("/api/admin/documents", { method: "POST", body: data });
export const updateInvestorDoc = (id: number, data: InvestorDocumentIn) =>
  call<InvestorDocumentOut>(`/api/admin/documents/${id}`, { method: "PUT", body: data });
export const deleteInvestorDoc = (id: number) => call<void>(`/api/admin/documents/${id}`, { method: "DELETE" });

/* ---------- Catálogos (sectors | municipalities | statuses) ---------- */
export type CatalogName = "sectors" | "municipalities" | "statuses";
export interface CatalogRow {
  id: number;
  slug: string;
  name_pt?: string | null;
  name_en?: string | null;
  color?: string;
  ordem?: number;
  ativo?: boolean;
  [key: string]: unknown;
}
export const listCatalog = (name: CatalogName) => call<CatalogRow[]>(`/api/admin/catalog/${name}`);
export const createCatalogRow = (name: CatalogName, data: Record<string, unknown>) =>
  call<void>(`/api/admin/catalog/${name}`, { method: "POST", body: data });
export const updateCatalogRow = (name: CatalogName, id: number, data: Record<string, unknown>) =>
  call<void>(`/api/admin/catalog/${name}/${id}`, { method: "PUT", body: data });
export const deleteCatalogRow = (name: CatalogName, id: number) =>
  call<void>(`/api/admin/catalog/${name}/${id}`, { method: "DELETE" });

/* ---------- Mensagens de contacto ---------- */
export interface MessagesQuery {
  only_unread?: boolean;
  spam?: boolean;
}
export const listMessages = (q: MessagesQuery = {}) => {
  const search = new URLSearchParams();
  if (q.only_unread) search.set("only_unread", "true");
  if (q.spam !== undefined) search.set("spam", String(q.spam));
  const s = search.toString();
  return call<MessageListItem[]>(`/api/admin/messages${s ? `?${s}` : ""}`);
};
export const getMessage = (id: number) => call<MessageDetailOut>(`/api/admin/messages/${id}`);
export const deleteMessage = (id: number) => call<void>(`/api/admin/messages/${id}`, { method: "DELETE" });
export const markMessage = (id: number, kind: "read" | "spam", value: boolean) =>
  call<MessageListItem>(`/api/admin/messages/${id}/${kind}`, {
    method: "PATCH",
    // o body é um objeto solto; enviamos os dois nomes de campo plausíveis,
    // o backend lê o que reconhecer (ver docs/API_NOTES.md)
    body: { value, [kind === "read" ? "is_read" : "is_spam"]: value },
  });


export const listHeroImages = () => call<HeroImageOut[]>("/api/admin/hero-images");
export const createHeroImage = (data: FormData) =>
  call<HeroImageOut>("/api/admin/hero-images", { method: "POST", body: data });
export const updateHeroImage = (id: number, data: HeroImageUpdate) =>
  call<HeroImageOut>(`/api/admin/hero-images/${id}`, { method: "PUT", body: data });
export const deleteHeroImage = (id: number) =>
  call<void>(`/api/admin/hero-images/${id}`, { method: "DELETE" });
export const reorderHeroImages = (imageIds: number[]) =>
  call<void>("/api/admin/hero-images/reorder", { method: "POST", body: imageIds });