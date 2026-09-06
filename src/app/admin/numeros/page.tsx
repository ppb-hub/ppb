"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { listStats, updateStat } from "@/lib/api/admin";
import { Btn, Card, ErrorLine, inputCls, Label, Modal, RowsLoading, Table, Toggle, toast } from "@/components/admin/ui";
import type { HomeStatIn, HomeStatOut } from "@/types/api";

/**
 * Números da homepage. O backend só expõe PUT /api/admin/stats/{id}
 * (listar + editar) — por isso não há "novo"/eliminar aqui: a origem é
 * fiel aos endpoints existentes.
 */
export default function AdminStatsPage() {
  const [rows, setRows] = useState<HomeStatOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<HomeStatOut | null>(null);
  const [form, setForm] = useState<HomeStatIn | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await listStats());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = (row: HomeStatOut) => {
    setForm({
      label_pt: row.label_pt,
      label_en: row.label_en,
      value: row.value,
      suffix_pt: row.suffix_pt ?? "",
      suffix_en: row.suffix_en ?? "",
      icon: row.icon ?? "",
      color: row.color ?? "",
      ordem: row.ordem,
      ativo: row.ativo,
    });
    setEditing(row);
  };

  const save = async () => {
    if (!editing || !form) return;
    setSaving(true);
    try {
      await updateStat(editing.id, form);
      toast("Número atualizado.");
      setEditing(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao guardar", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">Números da Homepage</h1>
        <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
          Os valores mostrados na secção “Números da Província”.
        </p>
      </div>

      <Card>
        {error ? <ErrorLine message={error} /> : null}
        {!rows ? (
          <RowsLoading rows={4} cols={3} />
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Sem números configurados.</p>
        ) : (
          <Table head={["Rótulo (PT)", "Valor", "Sufixo", "Visível", "Ações"]}>
            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                <td className="py-2.5 pr-4 font-medium text-[#0F2B5B] dark:text-white">{s.label_pt}</td>
                <td className="py-2.5 pr-4">{s.value}</td>
                <td className="py-2.5 pr-4 text-gray-500 dark:text-white/60 text-xs">{s.suffix_pt || "—"}</td>
                <td className="py-2.5 pr-4">
                  <span className={`text-xs font-semibold ${s.ativo ? "text-[#27AE60]" : "text-gray-400"}`}>{s.ativo ? "Sim" : "Não"}</span>
                </td>
                <td className="py-2.5 text-right">
                  <button onClick={() => open(s)} aria-label="Editar" className="p-2 rounded-lg text-gray-500 hover:text-[#E8821A] hover:bg-[#E8821A]/10 transition-colors">
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {editing && form && (
        <Modal title={`Editar número — ${editing.label_pt}`} onClose={() => setEditing(null)} wide>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label required>Rótulo (PT)</Label>
              <input className={inputCls} value={form.label_pt} onChange={(e) => setForm({ ...form, label_pt: e.target.value })} />
            </div>
            <div>
              <Label required>Rótulo (EN)</Label>
              <input className={inputCls} value={form.label_en} onChange={(e) => setForm({ ...form, label_en: e.target.value })} />
            </div>
            <div>
              <Label required>Valor</Label>
              <input className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              <p className="text-[10px] text-gray-400 mt-1">Numérico → anima contagem na home; texto → mostrado tal como está.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sufixo (PT)</Label>
                <input className={inputCls} value={form.suffix_pt ?? ""} onChange={(e) => setForm({ ...form, suffix_pt: e.target.value })} />
              </div>
              <div>
                <Label>Sufixo (EN)</Label>
                <input className={inputCls} value={form.suffix_en ?? ""} onChange={(e) => setForm({ ...form, suffix_en: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Ícone (nome)</Label>
              <input className={inputCls} value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="trending-up, building2, map-pin, droplets" />
            </div>
            <div>
              <Label>Cor (hex)</Label>
              <input className={inputCls} value={form.color ?? ""} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#D4A843" />
            </div>
            <div>
              <Label>Ordem</Label>
              <input type="number" className={inputCls} value={form.ordem ?? 0} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Label>Visível na home</Label>
              <Toggle checked={!!form.ativo} onChange={(v) => setForm({ ...form, ativo: v })} label="Ativo" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Btn variant="outline" onClick={() => setEditing(null)}>Cancelar</Btn>
            <Btn onClick={save} loading={saving}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
