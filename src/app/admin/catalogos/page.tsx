"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCatalogRow,
  deleteCatalogRow,
  listCatalog,
  updateCatalogRow,
  type CatalogName,
  type CatalogRow,
} from "@/lib/api/admin";
import { Btn, Card, Confirm, ErrorLine, inputCls, Label, Modal, RowsLoading, Table, Toggle, toast } from "@/components/admin/ui";
import { cx } from "@/lib/format";

const TABS: Array<{ id: CatalogName; label: string; colorField: boolean }> = [
  { id: "sectors", label: "Setores", colorField: false },
  { id: "municipalities", label: "Municípios", colorField: false },
  { id: "statuses", label: "Estados", colorField: true },
];

/**
 * CRUD em /api/admin/catalog/{name} (linhas = objeto solto). Envia os campos
 * documentados nos schemas SectorOut/MunicipalityOut/ProjectStatusOut:
 * slug, name_pt, name_en, ordem, ativo (+ color no catálogo de estados).
 */
export default function AdminCatalogPage() {
  const [tab, setTab] = useState<CatalogName>("sectors");
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CatalogRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<CatalogRow | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (name: CatalogName) => {
    setRows(null);
    setError(null);
    try {
      setRows(await listCatalog(name));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar catálogo");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const meta = TABS.find((x) => x.id === tab)!;

  const open = (row: CatalogRow | "new") => {
    const base: Record<string, unknown> = { slug: "", name_pt: "", name_en: "", ordem: 0, ativo: true };
    if (meta.colorField) base.color = "#0F2B5B";
    if (row !== "new") for (const k of Object.keys(base)) base[k] = row[k] ?? base[k];
    setForm(base);
    setEditing(row);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: String(form.slug || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        ordem: Number(form.ordem) || 0,
        ativo: Boolean(form.ativo),
      };
      if (editing === "new") await createCatalogRow(tab, payload);
      else if (editing) await updateCatalogRow(tab, editing.id, payload);
      toast("Catálogo atualizado.");
      setEditing(null);
      await load(tab);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao guardar", "err");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await deleteCatalogRow(tab, deleting.id);
      toast("Linha eliminada.");
      setDeleting(null);
      await load(tab);
    } catch (e) {
      toast(e instanceof Error ? e.message : "O backend recusou a eliminação (pode ter registos vinculados).", "err");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">Catálogos</h1>
          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Setores, municípios e estados usados nos projetos e nos filtros do site.</p>
        </div>
        <Btn onClick={() => open("new")}>
          <Plus size={15} aria-hidden="true" /> Nova linha
        </Btn>
      </div>

      <div className="flex gap-2">
        {TABS.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className={cx(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
              tab === x.id
                ? "bg-[#0F2B5B] text-white border-[#0F2B5B]"
                : "bg-white dark:bg-transparent text-gray-600 dark:text-white/60 border-gray-200 dark:border-white/20 hover:border-[#0F2B5B]"
            )}
          >
            {x.label}
          </button>
        ))}
      </div>

      <Card>
        {error ? <ErrorLine message={error} /> : null}
        {!rows ? (
          <RowsLoading rows={5} cols={3} />
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Catálogo vazio.</p>
        ) : (
          <Table head={["Slug", "Nome (PT)", "Nome (EN)", ...(meta.colorField ? ["Cor"] : []), "Ordem", "Ativo", "Ações"]}>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">{row.slug}</td>
                <td className="py-2.5 pr-4 font-medium text-[#0F2B5B] dark:text-white">{row.name_pt}</td>
                <td className="py-2.5 pr-4 text-gray-500 dark:text-white/60">{row.name_en}</td>
                {meta.colorField ? (
                  <td className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-2 text-xs">
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: String(row.color ?? "#999") }} />
                      {String(row.color ?? "—")}
                    </span>
                  </td>
                ) : null}
                <td className="py-2.5 pr-4 text-xs">{row.ordem ?? "—"}</td>
                <td className="py-2.5 pr-4">
                  <span className={`text-xs font-semibold ${row.ativo ? "text-[#27AE60]" : "text-gray-400"}`}>{row.ativo ? "Sim" : "Não"}</span>
                </td>
                <td className="py-2.5 text-right whitespace-nowrap">
                  <div className="inline-flex gap-1">
                    <button onClick={() => open(row)} aria-label="Editar" className="p-2 rounded-lg text-gray-500 hover:text-[#E8821A] hover:bg-[#E8821A]/10 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleting(row)} aria-label="Eliminar" className="p-2 rounded-lg text-gray-500 hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {editing !== null && (
        <Modal title={editing === "new" ? `Nova linha — ${meta.label}` : `Editar — ${meta.label}`} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div>
              <Label>Slug</Label>
              <input className={inputCls} value={String(form.slug ?? "")} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="deixar vazio para gerar do nome PT" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label required>Nome (PT)</Label>
                <input className={inputCls} value={String(form.name_pt ?? "")} onChange={(e) => setForm({ ...form, name_pt: e.target.value })} />
              </div>
              <div>
                <Label>Nome (EN)</Label>
                <input className={inputCls} value={String(form.name_en ?? "")} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
              </div>
            </div>
            {meta.colorField ? (
              <div>
                <Label>Cor (hex)</Label>
                <div className="flex gap-2">
                  <input type="color" className="h-10 w-14 rounded-lg border border-gray-200 dark:border-white/20 bg-transparent" value={/^#([0-9a-fA-F]{6})$/.test(String(form.color)) ? String(form.color) : "#0F2B5B"} onChange={(e) => setForm({ ...form, color: e.target.value })} aria-label="Cor" />
                  <input className={inputCls} value={String(form.color ?? "")} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#27AE60" />
                </div>
              </div>
            ) : null}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Ordem</Label>
                <input type="number" className={inputCls} value={String(form.ordem ?? 0)} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Toggle checked={Boolean(form.ativo)} onChange={(v) => setForm({ ...form, ativo: v })} label="Ativo" />
                <span className="text-sm text-gray-600 dark:text-white/70">Ativo</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Btn variant="outline" onClick={() => setEditing(null)}>Cancelar</Btn>
            <Btn onClick={save} loading={saving}>Guardar</Btn>
          </div>
        </Modal>
      )}

      {deleting && (
        <Confirm
          title="Eliminar linha do catálogo"
          text={`“${deleting.name_pt || deleting.slug}” será removida. Projetos que a usem podem ficar sem esse valor.`}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
