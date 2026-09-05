"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Btn, Card, Confirm, ErrorLine, inputCls, Label, Modal, RowsLoading, Table, Toggle, toast } from "./ui";
import { ApiError } from "@/lib/api/errors";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "select" | "date";
  required?: boolean;
  half?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export interface ResourceConfig<T extends { id: number }> {
  name: string;
  singular: string;
  emptyLabel?: string;
  list: () => Promise<T[]>;
  create?: (data: Record<string, unknown>) => Promise<unknown>;
  update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
  remove?: (id: number) => Promise<unknown>;
  /** campos principais mostrados na tabela (máx. 4) */
  columns: string[];
  fields: FieldDef[];
  defaults?: Partial<T>;
}

/**
 * Página CRUD genérica para recursos simples do backend (updates, org,
 * milestones, oportunidades, indicadores, depoimentos, documentos).
 * Renderiza exatamente os campos dos schemas *In documentados — nada além.
 */
export default function ResourcePage<T extends { id: number }>({ config }: { config: ResourceConfig<T> }) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await config.list();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Erro ao carregar");
      setRows([]);
    }
  }, [config]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    const initial: Record<string, unknown> = { ...(config.defaults as object) };
    for (const f of config.fields) if (initial[f.key] === undefined) initial[f.key] = f.type === "boolean" ? true : "";
    setForm(initial);
    setFormError(null);
    setEditing("new");
  };

  const openEdit = (row: T) => {
    const initial: Record<string, unknown> = {};
    for (const f of config.fields) initial[f.key] = (row as Record<string, unknown>)[f.key] ?? "";
    setForm(initial);
    setFormError(null);
    setEditing(row);
  };

  const submit = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of config.fields) {
        let v = form[f.key];
        if (f.type === "number") v = v === "" || v === null ? null : Number(v);
        if (f.type === "text" || f.type === "textarea" || f.type === "select" || f.type === "date") v = v === null ? null : String(v ?? "");
        if (f.required && (v === "" || v === null || (f.type === "number" && Number.isNaN(v)))) {
          throw new Error(`Campo obrigatório: ${f.label}`);
        }
        payload[f.key] = v;
      }
      if (editing === "new" && config.create) await config.create(payload);
      else if (editing && editing !== "new") await config.update(editing.id, payload);
      toast(editing === "new" ? "Registo criado." : "Alterações guardadas.");
      setEditing(null);
      await load();
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.fieldErrors
            ? `${e.message} — ${Object.values(e.fieldErrors).join("; ")}`
            : e.message
          : e instanceof Error
            ? e.message
            : "Erro ao guardar";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: T) => {
    if (!config.remove) return;
    try {
      await config.remove(row.id);
      toast("Registo eliminado.");
      setDeleting(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao eliminar", "err");
    }
  };

  const toggleActive = async (row: T & { ativo?: boolean }) => {
    try {
      const next = { ...(row as Record<string, unknown>), ativo: !(row as { ativo?: boolean }).ativo };
      await config.update(row.id, next);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao alterar estado", "err");
    }
  };

  const cells = useMemo(() => config.columns.slice(0, 4), [config.columns]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">{config.name}</h1>
          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
            Editado através dos endpoints administrativos do backend.
          </p>
        </div>
        {config.create && (
          <Btn onClick={openNew}>
            <Plus size={15} aria-hidden="true" /> Novo registo
          </Btn>
        )}
      </div>

      <Card>
        {loadError ? <ErrorLine message={loadError} /> : null}
        {rows === null ? (
          <RowsLoading />
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-white/40 py-6 text-center">{config.emptyLabel ?? "Sem registos."}</p>
        ) : (
          <Table
            head={[...cells.map(() => ""), "Ações"]}
          >
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                {cells.map((key) => {
                  const v = (row as Record<string, unknown>)[key];
                  const isTitle = key === cells[0];
                  return (
                    <td key={key} className="py-2.5 pr-4 align-middle">
                      {key === "ativo" ? (
                        <Toggle checked={Boolean(v)} onChange={() => void toggleActive(row as T & { ativo?: boolean })} label="Ativo" />
                      ) : typeof v === "boolean" ? (
                        v ? "Sim" : "Não"
                      ) : (
                        <span className={isTitle ? "font-medium text-[#0F2B5B] dark:text-white" : "text-gray-500 dark:text-white/60"}>
                          {renderCell(v)}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="py-2.5 pr-2 text-right whitespace-nowrap">
                  <div className="inline-flex gap-1">
                    <button onClick={() => openEdit(row)} aria-label="Editar" className="p-2 rounded-lg text-gray-500 hover:text-[#E8821A] hover:bg-[#E8821A]/10 transition-colors">
                      <Pencil size={14} />
                    </button>
                    {config.remove && (
                      <button onClick={() => setDeleting(row)} aria-label="Eliminar" className="p-2 rounded-lg text-gray-500 hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {editing !== null && (
        <Modal title={editing === "new" ? `Novo: ${config.singular}` : `Editar: ${config.singular}`} onClose={() => setEditing(null)} wide>
          {formError ? <ErrorLine message={formError} /> : null}
          <div className="grid sm:grid-cols-2 gap-4">
            {config.fields.map((f) => (
              <div key={f.key} className={f.half === false || f.type === "textarea" ? "sm:col-span-2" : ""}>
                <Label required={f.required}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <textarea
                    rows={4}
                    className={inputCls}
                    value={String(form[f.key] ?? "")}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  />
                ) : f.type === "boolean" ? (
                  <div className="pt-1">
                    <Toggle checked={Boolean(form[f.key])} onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))} label={f.label} />
                  </div>
                ) : f.type === "select" ? (
                  <select className={inputCls} value={String(form[f.key] ?? "")} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}>
                    <option value="">—</option>
                    {f.options?.map((o) => (
                      <option key={String(o.value)} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    className={inputCls}
                    value={String(form[f.key] ?? "")}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Btn variant="outline" onClick={() => setEditing(null)}>Cancelar</Btn>
            <Btn onClick={submit} loading={saving}>Guardar</Btn>
          </div>
        </Modal>
      )}

      {deleting && (
        <Confirm
          title={`Eliminar ${config.singular.toLowerCase()}`}
          text="Esta ação é definitiva e não pode ser anulada. Confirma a eliminação?"
          onClose={() => setDeleting(null)}
          onConfirm={() => remove(deleting)}
        />
      )}
    </div>
  );
}

function renderCell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v.length > 90 ? `${v.slice(0, 90)}…` : v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}
