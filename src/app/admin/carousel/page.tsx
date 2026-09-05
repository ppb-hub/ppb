"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Save, Trash2, Upload } from "lucide-react";
import {
  createHeroImage,
  deleteHeroImage,
  listHeroImages,
  updateHeroImage,
} from "@/lib/api/admin";
import { HeroImageRow } from "@/types/api";
import { resolveAssetUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import {
  Btn,
  Card,
  Confirm,
  ErrorLine,
  inputCls,
  Label,
  RowsLoading,
  Toggle,
  toast,
} from "@/components/admin/ui";
import { cx, formatSizeKb } from "@/lib/format";
import HeroSlidesSettingsEditor from "@/components/admin/HeroSlidesSettingsEditor";

const MAX_MB = 5;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/**
 * Gestão das imagens do hero — agora com UPLOAD real: o ficheiro vai para
 * POST /api/admin/hero-images (multipart) e o backend persiste os bytes na
 * base de dados (tabela hero_images) e serve-os em GET /uploads/hero/{id}.
 *
 * Se o backend ainda não expuser estes endpoints (404), o ecrã degrada para
 * o editor legado da chave settings.hero_slides, com aviso.
 */
export default function AdminHeroPage() {
  const [mode, setMode] = useState<"db" | "legacy" | null>(null);
  const [rows, setRows] = useState<HeroImageRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<HeroImageRow | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await listHeroImages();
      setRows((list ?? []).slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id));
      setMode("db");
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
        setMode("legacy");
      } else if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        throw e; // guard global trata
      } else {
        setError(e instanceof Error ? e.message : "Erro ao carregar imagens do hero");
        setRows([]);
        setMode("db");
      }
    }
  }, []);

  useEffect(() => {
    void load().catch(() => undefined);
  }, [load]);

  const patchLocal = (id: number, data: Partial<HeroImageRow>) =>
    setRows((r) => (r ?? []).map((row) => (row.id === id ? { ...row, ...data } : row)));

  const saveRow = async (row: HeroImageRow) => {
    setBusyId(row.id);
    try {
      await updateHeroImage(row.id, {
        alt_pt: row.alt_pt?.trim() || null,
        alt_en: row.alt_en?.trim() || null,
        ordem: row.ordem,
        ativo: row.ativo,
      });
      toast(`Slide ${row.id} guardado.`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao guardar slide", "err");
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const list = rows ?? [];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[index], next[j]] = [next[j], next[index]];
    // reindexa ordem = posição (o backend ordena por ordem asc)
    const reindexed = next.map((row, i) => ({ ...row, ordem: i + 1 }));
    setRows(reindexed);
    try {
      await Promise.all(
        [reindexed[index], reindexed[j]].map((row) =>
          updateHeroImage(row.id, { alt_pt: row.alt_pt ?? null, alt_en: row.alt_en ?? null, ordem: row.ordem, ativo: row.ativo ?? true })
        )
      );
    } catch (e) {
      toast(e instanceof Error ? `Reordenação falhou: ${e.message}` : "Reordenação não persistiu — recarregue.", "err");
      void load().catch(() => undefined);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await deleteHeroImage(deleting.id);
      toast("Imagem removida (ficheiro eliminado da BD).");
      setDeleting(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao eliminar", "err");
    }
  };

  if (mode === "legacy") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-[#D4A843]/50 bg-[#D4A843]/10 px-4 py-3 text-xs text-[#8a6a1f] dark:text-[#D4A843]">
          O backend ainda não expõe <span className="font-mono">/api/admin/hero-images</span> (upload → BD).
          Está a usar o editor legado pela chave <span className="font-mono">settings.hero_slides</span>.
          Consulte <span className="font-mono">docs/API_INTEGRATION_NOTES.md §6.1</span> para ativar o armazenamento
          das imagens na base de dados.
        </div>
        <HeroSlidesSettingsEditor />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">Imagens do Hero</h1>
          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
            Upload persistido na base de dados (<span className="font-mono">hero_images</span>) · servido em{" "}
            <span className="font-mono">/uploads/hero/&#123;id&#125;</span> · rotação de 5 s na home.
          </p>
        </div>
      </div>

      {error ? <ErrorLine message={error} /> : null}

      <UploadCard onUploaded={() => void load().catch(() => undefined)} />

      {rows === null ? (
        <Card>
          <RowsLoading rows={2} cols={1} />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 py-6 text-center">
            Ainda sem imagens guardadas — a home usa os defaults. Faça o primeiro upload acima.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((row, i) => (
            <RowEditor
              key={row.id}
              row={row}
              position={i + 1}
              total={rows.length}
              busy={busyId === row.id}
              onChange={(data) => patchLocal(row.id, data)}
              onSave={() => void saveRow(row)}
              onMove={(dir) => void move(i, dir)}
              onDelete={() => setDeleting(row)}
            />
          ))}
          <p className="text-[11px] text-gray-400 dark:text-white/40">
            1 imagem ativa: sem rotação · 2: autoplay com rewind · 3+: loop contínuo. Desativar mantém o registo na BD
            mas esconde-o da home.
          </p>
        </div>
      )}

      {deleting && (
        <Confirm
          title="Eliminar imagem do hero"
          text={`“${deleting.filename ?? deleting.url}” e os bytes guardados na BD serão removidos; o URL deixa de ser servido.`}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}

/* ---------------- Upload ---------------- */

function UploadCard({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altPt, setAltPt] = useState("");
  const [altEn, setAltEn] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f: File | null) => {
    if (f && f.size > MAX_MB * 1024 * 1024) {
      toast(`Ficheiro demasiado grande (máx. ${MAX_MB} MB).`, "err");
      return;
    }
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast("Escolha primeiro um ficheiro de imagem.", "err");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (altPt.trim()) form.append("alt_pt", altPt.trim());
      if (altEn.trim()) form.append("alt_en", altEn.trim());
      await createHeroImage(form);
      toast("Imagem enviada e guardada na base de dados.");
      setFile(null);
      setAltPt("");
      setAltEn("");
      if (inputRef.current) inputRef.current.value = "";
      onUploaded();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Falha no upload", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Enviar nova imagem" actions={<span className="text-[10px] text-gray-400">JPG · PNG · WEBP · GIF · máx. {MAX_MB} MB</span>}>
      <form onSubmit={submit} className="grid sm:grid-cols-[190px_1fr] gap-5">
        <label
          className={cx(
            "rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 min-h-[130px] flex items-center justify-center cursor-pointer hover:border-[#E8821A] transition-colors overflow-hidden",
            preview && "border-solid"
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pré-visualização do ficheiro a enviar" className="w-full h-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-xs text-gray-400 px-2 py-4 text-center">
              <Upload size={18} aria-hidden="true" />
              clic para escolher
              <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
            </span>
          )}
        </label>
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label required={false}>Texto alternativo (PT)</Label>
              <input className={inputCls} value={altPt} onChange={(e) => setAltPt(e.target.value)} placeholder="ex.: Vista aérea de Benguela" />
            </div>
            <div>
              <Label required={false}>Texto alternativo (EN)</Label>
              <input className={inputCls} value={altEn} onChange={(e) => setAltEn(e.target.value)} placeholder="e.g. Aerial view of Benguela" />
            </div>
          </div>
          {file ? <p className="text-[11px] text-gray-400 truncate">{file.name} · {formatSizeKb(Math.round(file.size / 1024))}</p> : null}
          <Btn type="submit" loading={busy} disabled={!file}>
            <ImagePlus size={15} aria-hidden="true" /> Enviar e adicionar ao rotativo
          </Btn>
        </div>
      </form>
    </Card>
  );
}

/* ---------------- Linha ---------------- */

function RowEditor({
  row,
  position,
  total,
  busy,
  onChange,
  onSave,
  onMove,
  onDelete,
}: {
  row: HeroImageRow;
  position: number;
  total: number;
  busy: boolean;
  onChange: (data: Partial<HeroImageRow>) => void;
  onSave: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const src = resolveAssetUrl(row.url) ?? row.url;
  return (
    <Card
      title={`Slide ${position}`}
      actions={
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={position === 1} aria-label="Mover para cima" className="p-1.5 rounded-lg text-gray-500 hover:text-[#0F2B5B] hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
            <ArrowUp size={14} />
          </button>
          <button onClick={() => onMove(1)} disabled={position === total} aria-label="Mover para baixo" className="p-1.5 rounded-lg text-gray-500 hover:text-[#0F2B5B] hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
            <ArrowDown size={14} />
          </button>
          <button onClick={onDelete} aria-label="Eliminar imagem" className="p-1.5 rounded-lg text-gray-500 hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      }
    >
      <div className="grid sm:grid-cols-[190px_1fr] gap-5">
        <a href={src} target="_blank" rel="noopener noreferrer" className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/15 bg-gray-100 dark:bg-white/5 min-h-[120px] block" aria-label="Abrir imagem em separador">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={row.alt_pt || row.alt_en || ""} className="w-full h-full object-cover" loading="lazy" />
        </a>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400">
            <span className="font-mono">{row.url}</span>
            {row.filename ? <span>· {row.filename}</span> : null}
            {typeof row.size_kb === "number" ? <span>· {formatSizeKb(row.size_kb)}</span> : null}
            <span>· id {row.id}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Texto alternativo (PT)</Label>
              <input className={inputCls} value={row.alt_pt ?? ""} onChange={(e) => onChange({ alt_pt: e.target.value })} />
            </div>
            <div>
              <Label>Texto alternativo (EN)</Label>
              <input className={inputCls} value={row.alt_en ?? ""} onChange={(e) => onChange({ alt_en: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Toggle checked={row.ativo ?? true} onChange={(v) => onChange({ ativo: v })} label="Visível na home" />
              <span className="text-sm text-gray-600 dark:text-white/70">Visível na home</span>
            </div>
            <Btn size="sm" onClick={onSave} loading={busy}>
              <Save size={13} aria-hidden="true" /> Guardar
            </Btn>
          </div>
        </div>
      </div>
    </Card>
  );
}
