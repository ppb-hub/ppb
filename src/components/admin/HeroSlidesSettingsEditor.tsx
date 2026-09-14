"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Save, Trash2 } from "lucide-react";
import { getSettings, putSettings } from "@/lib/api/admin";
import { parseHeroSlides, type HeroSlide } from "@/lib/hero";
import { resolveAssetUrl } from "@/lib/api/config";
import { Btn, Card, ErrorLine, inputCls, Label, RowsLoading, toast } from "@/components/admin/ui";

const KEY = "hero_slides";

/** Defaults mostrados quando o backend ainda não tem a chave (idênticos aos da home). */
const FALLBACK: HeroSlide[] = [
  { url: "/media/hero-benguela.jpg", alt_pt: null, alt_en: null },
  { url: "/media/invest-port.jpg", alt_pt: null, alt_en: null },
];

/**
 * EDITOR LEGADO — persistência via settings (chave `hero_slides`, JSON string).
 * Usado pelo /admin/hero apenas quando o backend não expõe /api/admin/hero-images.
 */
export default function HeroSlidesSettingsEditor() {
  const [rows, setRows] = useState<HeroSlide[] | null>(null);
  const [raw, setRaw] = useState<Record<string, unknown>>({});
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = (await getSettings()) as Record<string, unknown>;
        setRaw(res ?? {});
        const parsed = parseHeroSlides(res?.[KEY]);
        if (parsed.length > 0) {
          setRows(parsed);
        } else {
          setRows(FALLBACK.map((f) => ({ ...f })));
          setUsingFallback(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar configurações");
        setRows([]);
      }
    })();
  }, []);

  const patch = (i: number, data: Partial<HeroSlide>) =>
    setRows((r) => (r ?? []).map((row, idx) => (idx === i ? { ...row, ...data } : row)));

  const move = (i: number, dir: -1 | 1) =>
    setRows((r) => {
      if (!r) return r;
      const j = i + dir;
      if (j < 0 || j >= r.length) return r;
      const out = [...r];
      [out[i], out[j]] = [out[j], out[i]];
      return out;
    });

  const save = async () => {
    if (!rows) return;
    const cleaned: HeroSlide[] = rows
      .map((r) => ({ url: r.url.trim(), alt_pt: r.alt_pt?.trim() || null, alt_en: r.alt_en?.trim() || null }))
      .filter((r) => r.url);
    if (cleaned.length === 0) {
      toast("Adicione pelo menos uma imagem (URL).", "err");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...raw, [KEY]: JSON.stringify(cleaned) };
      await putSettings(payload);
      setRaw(payload);
      setUsingFallback(false);
      toast(`Hero atualizado — ${cleaned.length} ${cleaned.length === 1 ? "imagem" : "imagens"}.`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao guardar", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Btn variant="outline" onClick={() => setRows((r) => [...(r ?? []), { url: "", alt_pt: null, alt_en: null }])}>
            <ImagePlus size={15} aria-hidden="true" /> Adicionar slide
          </Btn>
          <Btn onClick={save} loading={saving} disabled={!rows}>
            <Save size={15} aria-hidden="true" /> Guardar tudo
          </Btn>
        </div>
      </div>

      {error ? <ErrorLine message={error} /> : null}
      {usingFallback ? (
        <div></div>
      ) : null}

      {rows === null ? (
        <Card>
          <RowsLoading rows={2} cols={1} />
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((row, i) => (
            <Card key={i} title={`Slide ${i + 1}`}>
              <div className="grid sm:grid-cols-[190px_1fr] gap-5">
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/15 bg-gray-100 dark:bg-white/5 min-h-[110px]">
                  {row.url.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveAssetUrl(row.url) ?? row.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full min-h-[110px] flex items-center justify-center text-xs text-gray-400">sem pré-visualização</div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label required>URL da imagem</Label>
                    <input className={inputCls} value={row.url} onChange={(e) => patch(i, { url: e.target.value })} placeholder="/uploads/hero-lobito.jpg ou https://…" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Texto alternativo (PT)</Label>
                      <input className={inputCls} value={row.alt_pt ?? ""} onChange={(e) => patch(i, { alt_pt: e.target.value })} />
                    </div>
                    <div>
                      <Label>Texto alternativo (EN)</Label>
                      <input className={inputCls} value={row.alt_en ?? ""} onChange={(e) => patch(i, { alt_en: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover para cima" className="p-2 rounded-lg text-gray-500 hover:text-[#850b0b] hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
                      <ArrowUp size={15} />
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Mover para baixo" className="p-2 rounded-lg text-gray-500 hover:text-[#850b0b] hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
                      <ArrowDown size={15} />
                    </button>
                    <button onClick={() => setRows((r) => (r ?? []).filter((_, idx) => idx !== i))} aria-label="Remover slide" className="p-2 rounded-lg text-gray-500 hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 transition-colors ml-auto">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
