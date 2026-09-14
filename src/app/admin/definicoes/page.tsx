"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { getSettings, putSettings } from "@/lib/api/admin";
import { Btn, Card, ErrorLine, inputCls, RowsLoading, toast } from "@/components/admin/ui";
import type { SiteSettingOut } from "@/types/api";

interface Entry {
  key: string;
  mode: "pten" | "plain";
  value_pt: string;
  value_en: string;
  value: string;
}

/**
 * GET /api/admin/settings devolve um objeto chave→valor; PUT aceita o
 * mesmo mapa. Normalizamos os dois shapes possíveis (string simples ou
 * { value_pt, value_en }) e enviamos de volta na forma original por chave.
 */
function normalize(raw: Record<string, unknown>): Entry[] {
  return Object.entries(raw ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      if (value && typeof value === "object" && ("value_pt" in (value as object) || "value_en" in (value as object))) {
        const v = value as SiteSettingOut;
        return { key, mode: "pten" as const, value_pt: v.value_pt ?? "", value_en: v.value_en ?? "", value: "" };
      }
      return { key, mode: "plain" as const, value_pt: "", value_en: "", value: value == null ? "" : String(value) };
    });
}

export default function AdminSettingsPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getSettings();
      setEntries(normalize(res as Record<string, unknown>));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar definições");
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!entries) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const e of entries) {
        payload[e.key] = e.mode === "pten" ? { value_pt: e.value_pt, value_en: e.value_en } : e.value;
      }
      const res = await putSettings(payload);
      setEntries(normalize((res as Record<string, unknown>) ?? payload));
      setDirty(false);
      toast("Definições guardadas.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao guardar", "err");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, patch: Partial<Entry>) => {
    setDirty(true);
    setEntries((prev) => prev?.map((e) => (e.key === key ? { ...e, ...patch } : e)) ?? []);
  };

  const labelFor = useMemo(() => (key: string) => key.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase()), []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat']">Definições do Site</h1>
        </div>
        <Btn onClick={save} loading={saving} disabled={!dirty}>
          <Save size={15} aria-hidden="true" /> Guardar tudo
        </Btn>
      </div>

      <Card>
        {error ? <ErrorLine message={error} /> : null}
        {!entries ? (
          <RowsLoading rows={6} cols={2} />
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">O backend não devolveu chaves de configuração.</p>
        ) : (
          <div className="space-y-5">
            {entries.map((e) => (
              <div key={e.key} className="grid sm:grid-cols-[220px_1fr_1fr] gap-3 items-center">
                <p className="text-xs font-bold text-gray-500 dark:text-white/60 font-mono break-all">{e.key}</p>
                {e.mode === "pten" ? (
                  <>
                    <input className={inputCls} value={e.value_pt} onChange={(ev) => update(e.key, { value_pt: ev.target.value })} placeholder={`${labelFor(e.key)} — PT`} aria-label={`${e.key} PT`} />
                    <input className={inputCls} value={e.value_en} onChange={(ev) => update(e.key, { value_en: ev.target.value })} placeholder={`${labelFor(e.key)} — EN`} aria-label={`${e.key} EN`} />
                  </>
                ) : (
                  <input className={`${inputCls} sm:col-span-2`} value={e.value} onChange={(ev) => update(e.key, { value: ev.target.value })} aria-label={e.key} />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
