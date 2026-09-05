"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getAbout, putAbout } from "@/lib/api/admin";
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

const META_FIELDS: Array<{ key: keyof AboutContentIn; label: string; hint?: string }> = [
  { key: "governor_name", label: "Nome do Governador" },
  { key: "governor_role", label: "Cargo" },
  { key: "governor_motto", label: "Lema" },
  { key: "governor_photo", label: "Foto (URL)", hint: "Sem endpoint de upload no backend — usar URL/caminho" },
  { key: "video_url", label: "Vídeo institucional (URL)" },
  { key: "video_thumbnail", label: "Capa do vídeo (URL)" },
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
          <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">Página “Sobre a Gestão”</h1>
          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">PUT /api/admin/about — objeto único de conteúdo institucional.</p>
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
                  <input
                    className={inputCls}
                    value={String((form as Record<string, unknown>)[f.key] ?? "")}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
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
