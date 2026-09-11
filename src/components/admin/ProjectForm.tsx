"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  createProject,
  getProject,
  listCatalog,
  updateProject,
  uploadImage,
  type CatalogName,
  type CatalogRow,
} from "@/lib/api/admin";
import { Btn, ErrorLine, inputCls, Label, toast } from "./ui";
import { slugify } from "@/lib/format";
import { normalizeAssetUrl, resolveAssetUrl } from "@/lib/api/config";
import type { ProjectCreate } from "@/types/api";

type Row = Record<string, unknown> & { _key: number };
interface FormState {
  slug: string;
  title_pt: string;
  title_en: string;
  summary_pt: string;
  summary_en: string;
  description_pt: string;
  description_en: string;
  sector_id: string;
  municipality_id: string;
  status_id: string;
  progress: number;
  value_kz: string;
  value_usd: string;
  executor: string;
  financing_source: string;
  supervisor: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  start_date: string;
  end_date: string;
  location: string;
  lat: string;
  lng: string;
  cover_image: string;
  cover_alt_pt: string;
  cover_alt_en: string;
  ordem: number;
  ativo: boolean;
  is_opportunity: boolean;
  objectives: Row[];
  images: Row[];
  documents: Row[];
}

const emptyForm = (): FormState => ({
  slug: "",
  title_pt: "",
  title_en: "",
  summary_pt: "",
  summary_en: "",
  description_pt: "",
  description_en: "",
  sector_id: "",
  municipality_id: "",
  status_id: "",
  progress: 0,
  value_kz: "",
  value_usd: "",
  executor: "",
  financing_source: "",
  supervisor: "",
  manager_name: "",
  manager_phone: "",
  manager_email: "",
  start_date: "",
  end_date: "",
  location: "",
  lat: "",
  lng: "",
  cover_image: "",
  cover_alt_pt: "",
  cover_alt_en: "",
  ordem: 0,
  ativo: true,
  is_opportunity: false,
  objectives: [],
  images: [],
  documents: [],
});

let keyCounter = 1;
const withKeys = (rows: Array<Record<string, unknown>>): Row[] =>
  rows.map((r) => ({ ...r, _key: keyCounter++ }));

export default function ProjectForm({ projectId }: { projectId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(!!projectId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<{ sectors: CatalogRow[]; municipalities: CatalogRow[]; statuses: CatalogRow[] }>({
    sectors: [],
    municipalities: [],
    statuses: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const [sectors, municipalities, statuses] = await Promise.all([
          listCatalog("sectors" as CatalogName),
          listCatalog("municipalities" as CatalogName),
          listCatalog("statuses" as CatalogName),
        ]);
        setCatalogs({ sectors, municipalities, statuses });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar catálogos");
      }
    })();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      setLoading(true);
      try {
        const p = await getProject(projectId);
        setForm({
          slug: p.slug ?? "",
          title_pt: p.title_pt ?? "",
          title_en: p.title_en ?? "",
          summary_pt: p.summary_pt ?? "",
          summary_en: p.summary_en ?? "",
          description_pt: p.description_pt ?? "",
          description_en: p.description_en ?? "",
          sector_id: String(p.sector?.id ?? ""),
          municipality_id: String(p.municipality?.id ?? ""),
          status_id: String(p.status?.id ?? ""),
          progress: p.progress ?? 0,
          value_kz: p.value_kz ?? "",
          value_usd: p.value_usd ?? "",
          executor: p.executor ?? "",
          financing_source: p.financing_source ?? "",
          supervisor: p.supervisor ?? "",
          manager_name: p.manager_name ?? "",
          manager_phone: p.manager_phone ?? "",
          manager_email: p.manager_email ?? "",
          start_date: isoDate(p.start_date),
          end_date: isoDate(p.end_date),
          location: p.location ?? "",
          lat: p.lat != null ? String(p.lat) : "",
          lng: p.lng != null ? String(p.lng) : "",
          cover_image: p.cover_image ?? "",
          cover_alt_pt: p.cover_alt_pt ?? "",
          cover_alt_en: p.cover_alt_en ?? "",
          ordem: Number((p as unknown as { ordem?: number }).ordem ?? 0),
          ativo: !!p.ativo,
          is_opportunity: !!p.is_opportunity,
          objectives: withKeys((p.objectives ?? []).map((o) => ({ text_pt: o.text_pt, text_en: o.text_en }))),
          images: withKeys((p.images ?? []).map((i) => ({ url: i.url, alt_pt: i.alt_pt ?? "", alt_en: i.alt_en ?? "" }))),
          documents: withKeys((p.documents ?? []).map((d) => ({ name_pt: d.name_pt, name_en: d.name_en, file_url: d.file_url, size_kb: d.size_kb ?? "" }))),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar projeto");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const derivedSlug = useMemo(() => (form.slug || slugify(form.title_pt)), [form.slug, form.title_pt]);

  const buildPayload = (): ProjectCreate => ({
    slug: derivedSlug,
    title_pt: form.title_pt.trim(),
    title_en: form.title_en.trim(),
    summary_pt: form.summary_pt.trim() || null,
    summary_en: form.summary_en.trim() || null,
    description_pt: form.description_pt.trim() || null,
    description_en: form.description_en.trim() || null,
    sector_id: Number(form.sector_id),
    municipality_id: Number(form.municipality_id),
    status_id: Number(form.status_id),
    progress: Math.max(0, Math.min(100, Number(form.progress) || 0)),
    value_kz: form.value_kz.trim() || null,
    value_usd: form.value_usd.trim() || null,
    executor: form.executor.trim() || null,
    financing_source: form.financing_source.trim() || null,
    supervisor: form.supervisor.trim() || null,
    manager_name: form.manager_name.trim() || null,
    manager_phone: form.manager_phone.trim() || null,
    manager_email: form.manager_email.trim() || null,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    location: form.location.trim() || null,
    lat: form.lat === "" ? null : Number(form.lat),
    lng: form.lng === "" ? null : Number(form.lng),
    cover_image: form.cover_image.trim() || null,
    cover_alt_pt: form.cover_alt_pt.trim() || null,
    cover_alt_en: form.cover_alt_en.trim() || null,
    ordem: Number(form.ordem) || 0,
    ativo: form.ativo,
    is_opportunity: form.is_opportunity,
    objectives: form.objectives.map((o, i) => ({ text_pt: String(o.text_pt ?? ""), text_en: String(o.text_en ?? ""), ordem: i + 1 })),
    images: form.images.map((img, i) => ({ url: String(img.url ?? ""), alt_pt: String(img.alt_pt ?? "") || null, alt_en: String(img.alt_en ?? "") || null, ordem: i + 1 })),
    documents: form.documents.map((d, i) => ({
      name_pt: String(d.name_pt ?? ""),
      name_en: String(d.name_en ?? ""),
      file_url: String(d.file_url ?? ""),
      size_kb: d.size_kb === "" || d.size_kb == null ? null : Number(d.size_kb),
      ordem: i + 1,
    })),
  });

  const validate = (): string | null => {
    if (!form.title_pt.trim()) return "Título (PT) é obrigatório.";
    if (!form.title_en.trim()) return "Título (EN) é obrigatório.";
    if (!derivedSlug) return "Slug inválido.";
    if (!form.sector_id) return "Selecionar setor.";
    if (!form.municipality_id) return "Selecionar município.";
    if (!form.status_id) return "Selecionar estado.";
    if (form.images.some((i) => !String(i.url ?? "").trim())) return "Imagens sem URL — preencher ou remover.";
    if (form.documents.some((d) => !String(d.file_url ?? "").trim())) return "Documentos sem URL — preencher ou remover.";
    return null;
  };

  const save = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      const saved = projectId ? await updateProject(projectId, payload) : await createProject(payload);
      toast("Projeto guardado.");
      router.push(`/admin/projetos/${saved.id}`);
      router.refresh();
    } catch (e) {
      const err = e as { message?: string; fieldErrors?: Record<string, string> };
      setError([err.message, err.fieldErrors && Object.values(err.fieldErrors).join("; ")].filter(Boolean).join(" — ") || "Erro ao guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">A carregar projeto…</p>;
  }

  const coverPreview = resolveAssetUrl(form.cover_image);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/projetos" aria-label="Voltar" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] truncate">
              {projectId ? "Editar projeto" : "Novo projeto"}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/pt/projetos" target="_blank">
            <Btn variant="outline">Ver no site</Btn>
          </Link>
          <Btn onClick={save} loading={saving}>
            <Save size={15} aria-hidden="true" /> Guardar
          </Btn>
        </div>
      </div>

      {error ? <ErrorLine message={error} /> : null}

      <section className="bg-white dark:bg-[#0F2B5B]/30 rounded-2xl border border-gray-100 dark:border-white/10 p-5 space-y-4">
        <h2 className="font-bold text-sm text-[#0F2B5B] dark:text-white uppercase tracking-wide">Identificação</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Título (PT)" required>
            <input className={inputCls} value={form.title_pt} onChange={(e) => set("title_pt", e.target.value)} />
          </Field>
          <Field label="Título (EN)" required>
            <input className={inputCls} value={form.title_en} onChange={(e) => set("title_en", e.target.value)} />
          </Field>
          <Field label="Slug (URL)" hint={form.slug ? undefined : "gerado do título (PT)"}>
            <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugify(form.title_pt)} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Setor *">
              <select className={inputCls} value={form.sector_id} onChange={(e) => set("sector_id", e.target.value)}>
                <option value="">—</option>
                {catalogs.sectors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_pt || c.slug}</option>
                ))}
              </select>
            </Field>
            <Field label="Município *">
              <select className={inputCls} value={form.municipality_id} onChange={(e) => set("municipality_id", e.target.value)}>
                <option value="">—</option>
                {catalogs.municipalities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_pt || c.slug}</option>
                ))}
              </select>
            </Field>
            <Field label="Estado *">
              <select className={inputCls} value={form.status_id} onChange={(e) => set("status_id", e.target.value)}>
                <option value="">—</option>
                {catalogs.statuses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_pt || c.slug}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Resumo (PT)">
            <textarea rows={3} className={inputCls} value={form.summary_pt} onChange={(e) => set("summary_pt", e.target.value)} />
          </Field>
          <Field label="Resumo (EN)">
            <textarea rows={3} className={inputCls} value={form.summary_en} onChange={(e) => set("summary_en", e.target.value)} />
          </Field>
          <Field label="Descrição (PT)">
            <textarea rows={5} className={inputCls} value={form.description_pt} onChange={(e) => set("description_pt", e.target.value)} />
          </Field>
          <Field label="Descrição (EN)">
            <textarea rows={5} className={inputCls} value={form.description_en} onChange={(e) => set("description_en", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="bg-white dark:bg-[#0F2B5B]/30 rounded-2xl border border-gray-100 dark:border-white/10 p-5 space-y-4">
        <h2 className="font-bold text-sm text-[#0F2B5B] dark:text-white uppercase tracking-wide">Execução & valores</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          <Field label={`Progresso: ${form.progress}%`}>
            <input type="range" min={0} max={100} value={form.progress} onChange={(e) => set("progress", Number(e.target.value))} className="w-full accent-[#E8821A]" />
          </Field>
          <Field label="Valor (Kz)">
            <input className={inputCls} value={form.value_kz} onChange={(e) => set("value_kz", e.target.value)} placeholder="2500000000" />
          </Field>
          <Field label="Valor (USD)">
            <input className={inputCls} value={form.value_usd} onChange={(e) => set("value_usd", e.target.value)} placeholder="3000000" />
          </Field>
          <Field label="Ordem">
            <input type="number" className={inputCls} value={form.ordem} onChange={(e) => set("ordem", Number(e.target.value))} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Início">
            <input type="date" className={inputCls} value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </Field>
          <Field label="Fim previsto">
            <input type="date" className={inputCls} value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </Field>
          <Field label="Localização">
            <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="Latitude">
            <input type="number" step="any" className={inputCls} value={form.lat} onChange={(e) => set("lat", e.target.value)} />
          </Field>
          <Field label="Longitude">
            <input type="number" step="any" className={inputCls} value={form.lng} onChange={(e) => set("lng", e.target.value)} />
          </Field>
          <div className="flex items-end pb-2 gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 cursor-pointer">
              <input type="checkbox" className="accent-[#E8821A]" checked={form.ativo} onChange={(e) => set("ativo", e.target.checked)} />
              Publicado
            </label>
            
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 cursor-pointer">
              <input type="checkbox" className="accent-[#E8821A]" checked={form.is_opportunity} onChange={(e) => set("is_opportunity", e.target.checked)} />
              Oportunidade
            </label>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-[#0F2B5B]/30 rounded-2xl border border-gray-100 dark:border-white/10 p-5 space-y-4">
        <h2 className="font-bold text-sm text-[#0F2B5B] dark:text-white uppercase tracking-wide">Intervenção & gestão</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Empresa executora">
            <input className={inputCls} value={form.executor} onChange={(e) => set("executor", e.target.value)} />
          </Field>
          <Field label="Fonte de financiamento">
            <input className={inputCls} value={form.financing_source} onChange={(e) => set("financing_source", e.target.value)} />
          </Field>
          <Field label="Fiscalizador">
            <input className={inputCls} value={form.supervisor} onChange={(e) => set("supervisor", e.target.value)} />
          </Field>
          <Field label="Gestor — nome">
            <input className={inputCls} value={form.manager_name} onChange={(e) => set("manager_name", e.target.value)} />
          </Field>
          <Field label="Gestor — telefone">
            <input className={inputCls} value={form.manager_phone} onChange={(e) => set("manager_phone", e.target.value)} />
          </Field>
          <Field label="Gestor — e-mail">
            <input type="email" className={inputCls} value={form.manager_email} onChange={(e) => set("manager_email", e.target.value)} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Capa da imagem">
            <ImageUploadField
              value={form.cover_image}
              onChange={(next) => set("cover_image", next)}
              placeholder="/uploads/capa-01.jpg"
            />
          </Field>
          <div className="flex items-end">
            <div className="w-28 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 relative">
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPreview} alt="Pré-visualização da capa" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-gray-400 flex items-center justify-center h-full">sem capa</span>
              )}
            </div>
          </div>
          <Field label="Alt da capa (PT)">
            <input className={inputCls} value={form.cover_alt_pt} onChange={(e) => set("cover_alt_pt", e.target.value)} />
          </Field>
          <Field label="Alt da capa (EN)">
            <input className={inputCls} value={form.cover_alt_en} onChange={(e) => set("cover_alt_en", e.target.value)} />
          </Field>
        </div>
      </section>

      <NestedList
        title="Objetivos"
        addLabel="Adicionar objetivo"
        rows={form.objectives}
        onChange={(rows) => set("objectives", rows)}
        fields={[
          { key: "text_pt", label: "Texto (PT)" },
          { key: "text_en", label: "Texto (EN)" },
        ]}
      />
      <NestedList
        title="Galeria de imagens"
        addLabel="Adicionar imagem"
        rows={form.images}
        onChange={(rows) => set("images", rows)}
        fields={[
          { key: "url", label: "URL da imagem", type: "image" },
          { key: "alt_pt", label: "Alt (PT)" },
          { key: "alt_en", label: "Alt (EN)" },
        ]}
      />
      <NestedList
        title="Documentos"
        addLabel="Adicionar documento"
        rows={form.documents}
        onChange={(rows) => set("documents", rows)}
        fields={[
          { key: "name_pt", label: "Nome (PT)" },
          { key: "name_en", label: "Nome (EN)" },
          { key: "file_url", label: "URL do ficheiro" },
          { key: "size_kb", label: "Tamanho (KB)", type: "number" },
        ]}
      />
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {hint ? <p className="text-[10px] text-gray-400 mt-1">{hint}</p> : null}
    </div>
  );
}

function NestedList({
  title,
  addLabel,
  rows,
  onChange,
  fields,
}: {
  title: string;
  addLabel: string;
  rows: Row[];
  onChange: (rows: Row[]) => void;
  fields: Array<{ key: string; label: string; type?: "number" | "image" }>;
}) {
  return (
    <section className="bg-white dark:bg-[#0F2B5B]/30 rounded-2xl border border-gray-100 dark:border-white/10 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm text-[#0F2B5B] dark:text-white uppercase tracking-wide">
          {title} <span className="text-gray-400 normal-case">({rows.length})</span>
        </h2>
        <Btn variant="ghost" size="sm" onClick={() => onChange([...rows, { _key: keyCounter++ }])}>
          <Plus size={13} aria-hidden="true" /> {addLabel}
        </Btn>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">— vazio —</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={row._key} className="flex flex-wrap items-center gap-3 border border-gray-100 dark:border-white/10 rounded-xl p-3">
              <span className="text-[10px] font-bold text-gray-400 w-5">{i + 1}.</span>
              {fields.map((f) =>
                f.type === "image" ? (
                  <div key={f.key} className="flex-1 min-w-[180px]">
                    <ImageUploadField
                      value={String(row[f.key] ?? "")}
                      onChange={(next) =>
                        onChange(rows.map((r) => (r._key === row._key ? { ...r, [f.key]: next } : r)))
                      }
                      placeholder={f.label}
                    />
                  </div>
                ) : (
                  <input
                    key={f.key}
                    type={f.type === "number" ? "number" : "text"}
                    className={`${inputCls} flex-1 min-w-[160px] py-1.5`}
                    placeholder={f.label}
                    value={String(row[f.key] ?? "")}
                    onChange={(e) =>
                      onChange(rows.map((r) => (r._key === row._key ? { ...r, [f.key]: e.target.value } : r)))
                    }
                  />
                )
              )}
              <button
                onClick={() => onChange(rows.filter((r) => r._key !== row._key))}
                aria-label={`Remover ${i + 1}`}
                className="p-2 rounded-lg text-gray-400 hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ImageUploadField({ value, onChange, placeholder }: { value: string; onChange: (next: string) => void; placeholder?: string }) {
  const [uploading, setUploading] = useState(false);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(normalizeAssetUrl(url) ?? url);
      toast("Imagem carregada.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao carregar imagem", "err");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const previewUrl = value ? resolveAssetUrl(value) ?? value : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          className={inputCls}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(normalizeAssetUrl(e.target.value) ?? e.target.value)}
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-[#0F2B5B] hover:bg-gray-50 dark:border-white/10 dark:bg-[#0F2B5B]/20 dark:text-white">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]">
            <path d="M12 16V4m0 0-4 4m4-4 4 4M4 18.5V18a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {uploading ? "A enviar..." : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
      {previewUrl ? (
        <div className="h-16 w-28 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Pré-visualização" className="h-full w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}

function isoDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}
