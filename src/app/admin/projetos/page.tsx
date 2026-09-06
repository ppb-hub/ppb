"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteProject, listProjects, setProjectActive } from "@/lib/api/admin";
import { Btn, Card, Confirm, ErrorLine, RowsLoading, Table, Toggle, toast } from "@/components/admin/ui";
import { ProgressBar } from "@/components/admin/MiniBits";

export default function AdminProjectsList() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listProjects>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ id: number; title: string } | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRows(await listProjects());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar projectos");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (id: number, ativo: boolean) => {
    setBusy(id);
    try {
      await setProjectActive(id, ativo);
      setRows((r) => (r ?? []).map((p) => (p.id === id ? { ...p, ativo } : p)));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro", "err");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await deleteProject(deleting.id);
      toast("Projeto eliminado.");
      setDeleting(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao eliminar", "err");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">Projetos</h1>
          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
          </p>
        </div>
        <Link href="/admin/projetos/novo">
          <Btn>
            <Plus size={15} aria-hidden="true" /> Novo projeto
          </Btn>
        </Link>
      </div>

      <Card>
        {error ? <ErrorLine message={error} /> : null}
        {!rows ? (
          <RowsLoading />
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Sem projectos.</p>
        ) : (
          <Table head={["Projeto", "Município / Setor", "Estado", "Progresso", "Publicado", "Ações"]}>
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                <td className="py-2.5 pr-4 max-w-[280px]">
                  <span className="block font-medium text-[#0F2B5B] dark:text-white truncate">{p.title_pt}</span>
                  <span className="block text-xs text-gray-400 font-mono truncate">/{p.slug}</span>
                </td>
                <td className="py-2.5 pr-4 text-gray-500 dark:text-white/60 text-xs">
                  {p.municipality?.name_pt}
                  <span className="mx-1 opacity-40">·</span>
                  {p.sector?.name_pt}
                </td>
                <td className="py-2.5 pr-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: `${p.status?.color ?? "#9CA3AF"}22`, color: p.status?.color ?? "#9CA3AF" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.status?.color ?? "#9CA3AF" }} />
                    {p.status?.name_pt}
                  </span>
                </td>
                <td className="py-2.5 pr-4 w-36">
                  <ProgressBar progress={p.progress} />
                </td>
                <td className="py-2.5 pr-4">
                  <Toggle checked={p.ativo} onChange={(v) => void toggle(p.id, v)} disabled={busy === p.id} label={`Publicar ${p.title_pt}`} />
                </td>
                <td className="py-2.5 text-right whitespace-nowrap">
                  <div className="inline-flex gap-1">
                    <Link href={`/admin/projetos/${p.id}`} aria-label="Editar" className="p-2 rounded-lg text-gray-500 hover:text-[#E8821A] hover:bg-[#E8821A]/10 transition-colors">
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => setDeleting({ id: p.id, title: p.title_pt })} aria-label="Eliminar" className="p-2 rounded-lg text-gray-500 hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {deleting && (
        <Confirm
          title="Eliminar projeto"
          text={`O projeto “${deleting.title}” e os seus objetivos, imagens e documentos serão eliminados definitivamente.`}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
