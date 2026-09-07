/**
 * Tipos espelho dos schemas devolvidos pela API FastAPI
 * (fonte: FRONTEND_API.md, gerada a partir do OpenAPI do backend).
 * Qualquer divergência deve ser corrigida AQUI, nunca no backend.
 */

/* ---------- Catálogos ---------- */
export interface SectorOut {
  id: number;
  slug: string;
  name_pt?: string | null;
  name_en?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface MunicipalityOut {
  id: number;
  slug: string;
  name_pt?: string | null;
  name_en?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface ProjectStatusOut {
  id: number;
  slug: string;
  name_pt?: string | null;
  name_en?: string | null;
  ordem?: number;
  ativo?: boolean;
  color: string;
}

/* ---------- Projetos ---------- */
export interface ObjectiveOut {
  id: number;
  text_pt: string;
  text_en: string;
  ordem: number;
}
export interface ObjectiveIn {
  text_pt?: string;
  text_en?: string;
  ordem?: number;
}

export interface ImageOut {
  id: number;
  url: string;
  alt_pt?: string | null;
  alt_en?: string | null;
  ordem: number;
}
export interface ImageIn {
  url?: string;
  alt_pt?: string | null;
  alt_en?: string | null;
  ordem?: number;
}

export interface DocumentOut {
  id: number;
  name_pt: string;
  name_en: string;
  file_url: string;
  size_kb?: number | null;
  ordem: number;
}
export interface DocumentIn {
  name_pt?: string;
  name_en?: string;
  file_url?: string;
  size_kb?: number | null;
  ordem?: number;
}

export interface ProjectListOut {
  id: number;
  slug: string;
  title_pt: string;
  title_en: string;
  summary_pt: string | null;
  summary_en: string | null;
  progress: number;
  value_kz: string | null;
  value_usd: string | null;
  cover_image: string | null;
  ativo: boolean;
  sector: SectorOut;
  municipality: MunicipalityOut;
  status: ProjectStatusOut;
  is_opportunity: boolean;
}

export interface ProjectDetailOut extends ProjectListOut {
  description_pt: string | null;
  description_en: string | null;
  executor: string | null;
  financing_source: string | null;
  supervisor: string | null;
  manager_name: string | null;
  manager_phone: string | null;
  manager_email: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  cover_alt_pt: string | null;
  cover_alt_en: string | null;
  objectives?: ObjectiveOut[];
  images?: ImageOut[];
  documents?: DocumentOut[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProjectCreate {
  slug: string;
  title_pt: string;
  title_en: string;
  summary_pt?: string | null;
  summary_en?: string | null;
  description_pt?: string | null;
  description_en?: string | null;
  sector_id: number;
  municipality_id: number;
  status_id: number;
  progress?: number;
  value_kz?: number | string | null;
  value_usd?: number | string | null;
  executor?: string | null;
  financing_source?: string | null;
  supervisor?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  manager_email?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  lat?: number | null;
  lng?: number | null;
  cover_image?: string | null;
  cover_alt_pt?: string | null;
  cover_alt_en?: string | null;
  ordem?: number;
  ativo?: boolean;
  objectives?: ObjectiveIn[];
  images?: ImageIn[];
  documents?: DocumentIn[];
}
export type ProjectUpdate = ProjectCreate;

/* ---------- Homepage / institucional ---------- */
export interface HomeStatOut {
  id: number;
  label_pt: string;
  label_en: string;
  value: string;
  suffix_pt: string | null;
  suffix_en: string | null;
  icon: string;
  color: string;
  ordem: number;
  ativo: boolean;
}
export interface HomeStatIn {
  label_pt: string;
  label_en: string;
  value: string;
  suffix_pt?: string | null;
  suffix_en?: string | null;
  icon?: string;
  color?: string;
  ordem?: number;
  ativo?: boolean;
}

export interface UpdateOut {
  id: number;
  title_pt: string;
  title_en: string;
  category_pt: string | null;
  category_en: string | null;
  date: string;
  url: string | null;
  ordem: number;
  ativo: boolean;
}
export interface UpdateIn {
  title_pt: string;
  title_en: string;
  category_pt?: string | null;
  category_en?: string | null;
  date: string;
  url?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface AboutContentOut {
  id?: number | null;
  governor_name: string | null;
  governor_role: string | null;
  governor_photo: string | null;
  governor_motto: string | null;
  hero_title_pt: string;
  hero_title_en: string;
  hero_subtitle_pt: string;
  hero_subtitle_en: string;
  message_title_pt: string;
  message_title_en: string;
  message_pt: string;
  message_en: string;
  mission_pt: string;
  mission_en: string;
  vision_pt: string;
  vision_en: string;
  values_pt: string;
  values_en: string;
  video_url: string | null;
  video_thumbnail: string | null;
  video_title_pt: string | null;
  video_title_en: string | null;
}
export type AboutContentIn = Partial<Omit<AboutContentOut, "id">>;

export interface OrgMemberOut {
  id: number;
  role_pt: string;
  role_en: string;
  name: string;
  ordem: number;
  ativo: boolean;
}
export interface OrgMemberIn {
  role_pt?: string;
  role_en?: string;
  name?: string;
  ordem?: number;
  ativo?: boolean;
}

export interface MilestoneOut {
  id: number;
  year: string;
  title_pt: string;
  title_en: string;
  description_pt: string;
  description_en: string;
  ordem: number;
  ativo: boolean;
}
export interface MilestoneIn {
  year?: string;
  title_pt?: string;
  title_en?: string;
  description_pt?: string;
  description_en?: string;
  ordem?: number;
  ativo?: boolean;
}

/* ---------- Investidor ---------- */
export interface InvestorOpportunityOut {
  id: number;
  area: string;
  area_en?: string;
  area_pt?: string;
  description: string;
  description_en?: string;
  description_pt?: string;
  icon: string;
  color?: string;
  type?: string;        
  sector?: string;      
  estimated_value?: string;
  timeline?: string;       
  popularity?: number;     
  created_at: string;
  updated_at: string;
}
export interface InvestorOpportunityIn {
  area_pt?: string;
  area_en?: string;
  description_pt?: string;
  description_en?: string;
  icon?: string;
  color?: string;
  ordem?: number;
  ativo?: boolean;
}

export interface InvestorIndicatorOut {
  id: number;
  label_pt: string;
  label_en: string;
  value: string;
  icon: string;
  color: string;
  ordem: number;
  ativo: boolean;
}
export interface InvestorIndicatorIn {
  label_pt?: string;
  label_en?: string;
  value?: string;
  icon?: string;
  color?: string;
  ordem?: number;
  ativo?: boolean;
}

export interface TestimonialOut {
  id: number;
  name: string;
  company: string;
  text_pt: string;
  text_en: string;
  photo: string | null;
  ordem: number;
  ativo: boolean;
}
export interface TestimonialIn {
  name?: string;
  company?: string;
  text_pt?: string;
  text_en?: string;
  photo?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface InvestorDocumentOut {
  id: number;
  name_pt: string;
  name_en: string;
  file_url: string;
  size_kb: number | null;
  ordem: number;
  ativo: boolean;
}
export interface InvestorDocumentIn {
  name_pt?: string;
  name_en?: string;
  file_url?: string;
  size_kb?: number | null;
  ordem?: number;
  ativo?: boolean;
}

/* ---------- Definições do site ---------- */
/** SiteSettingOut: { key, value_pt, value_en }. O GET /api/settings devolve
 *  "Tipo: object" — o shape exato (chave→objeto ou chave→string) é
 *  normalizado defensivamente em lib/api/normalize.ts. */
export interface SiteSettingOut {
  key: string;
  value_pt: string | null;
  value_en: string | null;
}
export type SettingsMap = Record<string, string | SiteSettingOut | null>;

/* ---------- Contacto ---------- */
export interface ContactCreate {
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  interest_type?: string | null;
  municipality?: string | null;
  project_id?: number | null;
  project_title?: string | null;
  message: string;
  website: string; // honeypot — sempre "" para humanos
  captcha_answer: number;
  captcha_expected: number;
  elapsed_seconds?: number;
}
export interface ContactResponse {
  success: boolean;
  detail: string;
}

/* ---------- Admin: mensagens ---------- */
export interface MessageListItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  interest_type: string | null;
  municipality: string | null;
  project_title: string | null;
  is_spam: boolean;
  is_read: boolean;
  created_at: string;
}
export interface MessageDetailOut extends Omit<MessageListItem, never> {
  message: string;
  company: string | null;
  ip_address: string | null;
}

/* ---------- Autenticação ---------- */
export interface LoginIn {
  username: string;
  password: string;
}
export interface UserOut {
  id: number;
  username: string;
  email: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}
export interface TokenOut {
  access_token: string;
  token_type?: string;
  user: UserOut;
}
export interface PasswordChangeIn {
  current_password: string;
  new_password: string;
}
export interface AdminCreate {
  username: string;
  email?: string | null;
  password: string;
}

/* ---------- Erro de validação FastAPI ---------- */
export interface HttpValidationError {
  detail?:
    | string
    | Array<{ loc?: (string | number)[]; msg?: string; type?: string }>;
}

export interface HeroImageOut {
  id: number;
  url: string;
  title_pt?: string | null;
  title_en?: string | null;
  alt_pt?: string | null;
  alt_en?: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface HeroImageIn {
  url: string;
  title_pt?: string | null;
  title_en?: string | null;
  alt_pt?: string | null;
  alt_en?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface HeroImageUpdate {
  url?: string;
  title_pt?: string | null;
  title_en?: string | null;
  alt_pt?: string | null;
  alt_en?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface HeroImageRow {
  id: number;
  url?: string;
  filename?: string;
  title_pt?: string | null;
  title_en?: string | null;
  alt_pt?: string | null;
  alt_en?: string | null;
  ordem?: number;
  ativo?: boolean;
  size_kb?: number;
}