import type { ResourceConfig } from "./ResourcePage";
import {
  createIndicator,
  createInvestorDoc,
  createMilestone,
  createOpportunity,
  createOrg,
  createTestimonial,
  createUpdate,
  deleteIndicator,
  deleteInvestorDoc,
  deleteMilestone,
  deleteOpportunity,
  deleteOrg,
  deleteTestimonial,
  deleteUpdate,
  listIndicators,
  listInvestorDocs,
  listMilestones,
  listOpportunities,
  listOrg,
  listTestimonials,
  listUpdates,
  updateIndicator,
  updateInvestorDoc,
  updateMilestone,
  updateOpportunity,
  updateOrg,
  updateTestimonial,
  updateUpdate,
} from "@/lib/api/admin";
import type {
  InvestorDocumentOut,
  InvestorIndicatorOut,
  InvestorOpportunityOut,
  MilestoneOut,
  OrgMemberOut,
  TestimonialOut,
  UpdateOut,
} from "@/types/api";

/* adapters: os hooks do CRUD genérico trabalham com Record<string, unknown>;
   estes wrappers ligam-nos aos endpoints tipados do backend */
const asCreate =
  <TIn extends object>(fn: (data: TIn) => Promise<unknown>) =>
  (data: Record<string, unknown>) =>
    fn(data as unknown as TIn);
const asUpdate =
  <TIn extends object>(fn: (id: number, data: TIn) => Promise<unknown>) =>
  (id: number, data: Record<string, unknown>) =>
    fn(id, data as unknown as TIn);

/*
 * Configuração por recurso — exatamente os campos dos schemas *In do
 * backend (FRONTEND_API.md). Não há endpoints de upload: imagens/ficheiros
 * são referenciados por URL.
 */

const ordemAtivo = [
  { key: "ordem", label: "Ordem", type: "number" as const, half: true },
  { key: "ativo", label: "Ativo", type: "boolean" as const, half: true },
];

export const updatesConfig: ResourceConfig<UpdateOut> = {
  name: "Atualizações",
  singular: "Atualização",
  list: listUpdates,
  create: asCreate(createUpdate),
  update: asUpdate(updateUpdate),
  remove: deleteUpdate,
  columns: ["title_pt", "date", "category_pt", "ativo"],
  fields: [
    { key: "title_pt", label: "Título (PT)", required: true },
    { key: "title_en", label: "Título (EN)", required: true },
    { key: "date", label: "Data", type: "date", required: true, half: true },
    { key: "url", label: "URL (opcional)", half: true },
    { key: "category_pt", label: "Categoria (PT)", half: true },
    { key: "category_en", label: "Categoria (EN)", half: true },
    ...ordemAtivo,
  ],
  defaults: { ativo: true } as Partial<UpdateOut>,
};

export const orgConfig: ResourceConfig<OrgMemberOut> = {
  name: "Estrutura Orgânica",
  singular: "Membro",
  list: listOrg,
  create: asCreate(createOrg),
  update: asUpdate(updateOrg),
  remove: deleteOrg,
  columns: ["name", "role_pt", "ativo"],
  fields: [
    { key: "name", label: "Nome", required: true },
    { key: "ordem", label: "Ordem", type: "number", half: true },
    { key: "ativo", label: "Ativo", type: "boolean", half: true },
    { key: "role_pt", label: "Cargo (PT)", required: true },
    { key: "role_en", label: "Cargo (EN)" },
  ],
  defaults: { ativo: true } as Partial<OrgMemberOut>,
};

export const milestonesConfig: ResourceConfig<MilestoneOut> = {
  name: "Realizações (Timeline)",
  singular: "Marco",
  list: listMilestones,
  create: asCreate(createMilestone),
  update: asUpdate(updateMilestone),
  remove: deleteMilestone,
  columns: ["year", "title_pt", "ativo"],
  fields: [
    { key: "year", label: "Ano", required: true, half: true },
    { key: "ordem", label: "Ordem", type: "number", half: true },
    { key: "title_pt", label: "Título (PT)", required: true },
    { key: "title_en", label: "Título (EN)", required: true },
    { key: "description_pt", label: "Descrição (PT)", type: "textarea" },
    { key: "description_en", label: "Descrição (EN)", type: "textarea" },
    { key: "ativo", label: "Ativo", type: "boolean" },
  ],
  defaults: { ativo: true } as Partial<MilestoneOut>,
};

export const opportunitiesConfig: ResourceConfig<InvestorOpportunityOut> = {
  name: "Oportunidades de Investimento",
  singular: "Oportunidade",
  list: listOpportunities,
  create: asCreate(createOpportunity),
  update: asUpdate(updateOpportunity),
  remove: deleteOpportunity,
  columns: ["area_pt", "icon", "ativo"],
  fields: [
    { key: "area_pt", label: "Área (PT)", required: true },
    { key: "area_en", label: "Área (EN)", required: true },
    { key: "description_pt", label: "Descrição (PT)", type: "textarea", required: true },
    { key: "description_en", label: "Descrição (EN)", type: "textarea", required: true },
    { key: "icon", label: "Ícone (nome)", placeholder: "wheat, truck, zap, leaf…", half: true },
    { key: "color", label: "Cor (hex)", placeholder: "#27AE60", half: true },
    { key: "ordem", label: "Ordem", type: "number", half: true },
    { key: "ativo", label: "Ativo", type: "boolean", half: true },
  ],
  defaults: { ativo: true } as Partial<InvestorOpportunityOut>,
};

export const indicatorsConfig: ResourceConfig<InvestorIndicatorOut> = {
  name: "Indicadores da Província",
  singular: "Indicador",
  list: listIndicators,
  create: asCreate(createIndicator),
  update: asUpdate(updateIndicator),
  remove: deleteIndicator,
  columns: ["label_pt", "value", "ativo"],
  fields: [
    { key: "label_pt", label: "Rótulo (PT)", required: true },
    { key: "label_en", label: "Rótulo (EN)", required: true },
    { key: "value", label: "Valor", required: true, half: true },
    { key: "icon", label: "Ícone (nome)", half: true },
    { key: "color", label: "Cor (hex)", half: true },
    { key: "ordem", label: "Ordem", type: "number", half: true },
    { key: "ativo", label: "Ativo", type: "boolean", half: true },
  ],
  defaults: { ativo: true } as Partial<InvestorIndicatorOut>,
};

export const testimonialsConfig: ResourceConfig<TestimonialOut> = {
  name: "Depoimentos de Investidores",
  singular: "Depoimento",
  list: listTestimonials,
  create: asCreate(createTestimonial),
  update: asUpdate(updateTestimonial),
  remove: deleteTestimonial,
  columns: ["name", "company", "ativo"],
  fields: [
    { key: "name", label: "Nome", required: true, half: true },
    { key: "company", label: "Empresa", required: true, half: true },
    { key: "text_pt", label: "Texto (PT)", type: "textarea", required: true },
    { key: "text_en", label: "Texto (EN)", type: "textarea", required: true },
    { key: "photo", label: "Foto (URL)", half: true },
    { key: "ordem", label: "Ordem", type: "number", half: true },
    { key: "ativo", label: "Ativo", type: "boolean", half: true },
  ],
  defaults: { ativo: true } as Partial<TestimonialOut>,
};

export const investorDocsConfig: ResourceConfig<InvestorDocumentOut> = {
  name: "Documentos para Investidores",
  singular: "Documento",
  list: listInvestorDocs,
  create: asCreate(createInvestorDoc),
  update: asUpdate(updateInvestorDoc),
  remove: deleteInvestorDoc,
  columns: ["name_pt", "size_kb", "ativo"],
  fields: [
    { key: "name_pt", label: "Nome (PT)", required: true },
    { key: "name_en", label: "Nome (EN)", required: true },
    { key: "file_url", label: "URL do ficheiro", required: true },
    { key: "size_kb", label: "Tamanho (KB)", type: "number", half: true },
    { key: "ordem", label: "Ordem", type: "number", half: true },
    { key: "ativo", label: "Ativo", type: "boolean", half: true },
  ],
  defaults: { ativo: true } as Partial<InvestorDocumentOut>,
};
