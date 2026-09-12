"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Save } from "lucide-react";
import { getAbout, putAbout, uploadImage } from "@/lib/api/admin";
import { normalizeAssetUrl, resolveAssetUrl } from "@/lib/api/config";
import { Btn, Card, ErrorLine, inputCls, Label, toast } from "@/components/admin/ui";
import type { AboutContentIn, AboutContentOut } from "@/types/api";

const TEXT_FIELDS: Array<{ key: keyof AboutContentIn; label: string; area?: boolean; hint?: string }> = [
  { key: "hero_title_pt", label: "Título do cabeçalho (PT)" },
  { key: "hero_title_en", label: "Título do cabeçalho (EN)" },
  { key: "hero_subtitle_pt", label: "Subtítulo (PT)" },
  { key: "hero_subtitle_en", label: "Subtítulo (EN)" },
  { key: "message_title_pt", label: "Título da mensagem (PT)" },
  { key: "message_title_en", label: "Título da mensagem (EN)" },
  { key: "message_pt", label: "Mensagem do Governador (PT)", area: true, hint: "Parágrafos separados por linha em branco" },
  { key: "message_en", label: "Mensagem do Governador (EN)", area: true },
  { key: "mission_pt", label: "Missão (PT)", area: true },
  { key: "mission_en", label: "Missão (EN)", area: true },
  { key: "vision_pt", label: "Visão (PT)", area: true },
  { key: "vision_en", label: "Visão (EN)", area: true },
  { key: "values_pt", label: "Valores (PT)", area: true, hint: "Um valor por linha" },
  { key: "values_en", label: "Valores (EN)", area: true },
];

const META_FIELDS: Array<{ key: keyof AboutContentIn; label: string; hint?: string; image?: boolean }> = [
  { key: "governor_name", label: "Nome do Governador" },
  { key: "governor_role", label: "Cargo" },
  { key: "governor_motto", label: "Lema" },
  { key: "governor_photo", label: "Foto do Governador", hint: "Pode carregar um ficheiro ou colar uma URL.", image: true },
  { key: "video_url", label: "Vídeo institucional (URL)" },
  { key: "video_thumbnail", label: "Capa do vídeo", hint: "Pode carregar um ficheiro ou colar uma URL.", image: true },
  { key: "video_title_pt", label: "Título do vídeo (PT)" },
  { key: "video_title_en", label: "Título do vídeo (EN)" },
];

export default function AdminAboutPage() {
  const [form, setForm] = useState<AboutContentIn | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const about: AboutContentOut = await getAbout();
        const initial: AboutContentIn = {};
        for (const f of [...TEXT_FIELDS, ...META_FIELDS]) {
          (initial as Record<string, unknown>)[f.key] = about[f.key as keyof AboutContentOut] ?? "";
        }
        setForm(initial);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar");
      }
    })();
  }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await putAbout(form);
      toast("Conteúdo “Sobre” guardado.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao guardar", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat']">Página “Sobre a Gestão”</h1>
          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Conteúdo institucional.</p>
        </div>
        <Btn onClick={save} loading={saving} disabled={!form}>
          <Save size={15} aria-hidden="true" /> Guardar
        </Btn>
      </div>

      {error ? <ErrorLine message={error} /> : null}
      {!form ? (
        <Card>
          <p className="text-sm text-gray-500">A carregar conteúdo…</p>
        </Card>
      ) : (
        <>
          <Card title="Cabeçalho & mensagem">
            <div className="grid sm:grid-cols-2 gap-4">
              {META_FIELDS.map((f) => (
                <div key={String(f.key)}>
                  <Label>{f.label}</Label>
                  {f.image ? (
                    <ImageField
                      value={String((form as Record<string, unknown>)[f.key] ?? "")}
                      onChange={(next) => setForm({ ...form, [f.key]: next })}
                    />
                  ) : (
                    <input
                      className={inputCls}
                      value={String((form as Record<string, unknown>)[f.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  )}
                  {f.hint ? <p className="text-[10px] text-gray-400 mt-1">{f.hint}</p> : null}
                </div>
              ))}
            </div>
          </Card>
          <Card title="Textos institucionais">
            <div className="grid sm:grid-cols-2 gap-4">
              {TEXT_FIELDS.map((f) => (
                <div key={String(f.key)} className={f.area ? "sm:col-span-2" : ""}>
                  <Label>{f.label}</Label>
                  {f.area ? (
                    <textarea
                      rows={4}
                      className={inputCls}
                      value={String((form as Record<string, unknown>)[f.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      className={inputCls}
                      value={String((form as Record<string, unknown>)[f.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  )}
                  {f.hint ? <p className="text-[10px] text-gray-400 mt-1">{f.hint}</p> : null}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
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
          className={inputCls}
          value={value}
          onChange={(e) => onChange(normalizeAssetUrl(e.target.value) ?? e.target.value)}
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-[#850b0b] hover:bg-gray-50 dark:border-white/10 dark:bg-[#850b0b]/20 dark:text-white">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]">
            <path d="M12 16V4m0 0-4 4m4-4 4 4M4 18.5V18a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {uploading ? "A enviar..." : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
      {previewUrl ? (
        <div className="h-16 w-28 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/5">
          <img src={previewUrl} alt="Pré-visualização" className="h-full w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}
