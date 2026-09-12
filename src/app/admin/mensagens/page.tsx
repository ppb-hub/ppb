"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox, Mail, MailOpen, ShieldAlert, Trash2, X } from "lucide-react";
import { deleteMessage, getMessage, listMessages, markMessage, type MessagesQuery } from "@/lib/api/admin";
import { Btn, Card, Confirm, ErrorLine, RowsLoading, Table, toast } from "@/components/admin/ui";
import { cx } from "@/lib/format";
import type { MessageDetailOut, MessageListItem } from "@/types/api";

const TABS: Array<{ id: string; label: string; query: MessagesQuery }> = [
  { id: "inbox", label: "Caixa de entrada", query: { spam: false } },
  { id: "unread", label: "Por ler", query: { spam: false, only_unread: true } },
  { id: "spam", label: "Spam", query: { spam: true } },
];

/**
 * Inbox das mensagens de contacto — GET/GET-1/PATCH/PATCH/DELETE em
 * /api/admin/messages (marcar lida, marcar spam, eliminar).
 */
export default function AdminMessagesPage() {
  const [tab, setTab] = useState(TABS[0]);
  const [rows, setRows] = useState<MessageListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<MessageDetailOut | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState<MessageListItem | null>(null);

  const load = useCallback(async (query: MessagesQuery) => {
    setRows(null);
    setError(null);
    try {
      setRows(await listMessages(query));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar mensagens");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load(tab.query);
  }, [tab, load]);

  const open = async (m: MessageListItem) => {
    setLoadingDetail(true);
    setDetail(null);
    try {
      const d = await getMessage(m.id);
      setDetail(d);
      if (!d.is_read) {
        try {
          await markMessage(m.id, "read", true);
          setRows((r) => (r ?? []).map((x) => (x.id === m.id ? { ...x, is_read: true } : x)));
        } catch {
          /* leitura local não crítica */
        }
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao abrir mensagem", "err");
    } finally {
      setLoadingDetail(false);
    }
  };

  const act = async (m: MessageListItem, kind: "read" | "spam", value: boolean) => {
    try {
      const updated = await markMessage(m.id, kind, value);
      setRows((r) => (r ?? []).map((x) => (x.id === m.id ? { ...x, ...updated } : x)));
      setDetail((d) => (d && d.id === m.id ? { ...d, ...updated } : d));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro", "err");
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await deleteMessage(deleting.id);
      toast("Mensagem eliminada.");
      setDeleting(null);
      setDetail(null);
      await load(tab.query);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao eliminar", "err");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat']">Mensagens de Contacto</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x)}
            className={cx(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors border inline-flex items-center gap-2",
              tab.id === x.id
                ? "bg-[#850b0b] text-white border-[#850b0b]"
                : "bg-white dark:bg-transparent text-gray-600 dark:text-white/60 border-gray-200 dark:border-white/20"
            )}
          >
            {x.id === "spam" ? <ShieldAlert size={13} aria-hidden="true" /> : <Inbox size={13} aria-hidden="true" />}
            {x.label}
          </button>
        ))}
      </div>

      <Card>
        {error ? <ErrorLine message={error} /> : null}
        {!rows ? (
          <RowsLoading rows={6} cols={4} />
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">Sem mensagens nesta caixa.</p>
        ) : (
          <Table head={["", "Remetente", "Assunto implícito", "Interesse", "Data", ""]}>
            {rows.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 cursor-pointer" onClick={() => void open(m)}>
                <td className="py-2.5 pr-2 text-[#E8821A]">{!m.is_read ? <Mail size={15} aria-label="não lida" /> : <MailOpen size={15} className="text-gray-300 dark:text-white/30" aria-label="lida" />}</td>
                <td className="py-2.5 pr-4">
                  <span className="block font-medium text-[#850b0b] dark:text-white">{m.name}</span>
                  <span className="block text-xs text-gray-400">{m.email}</span>
                </td>
                <td className="py-2.5 pr-4 text-gray-500 dark:text-white/60 max-w-[220px] truncate">{m.project_title || "—"}</td>
                <td className="py-2.5 pr-4 text-xs">
                  <span className="bg-[#850b0b]/8 dark:bg-white/10 text-[#850b0b] dark:text-white/70 px-2 py-1 rounded-full">{m.interest_type || "—"}</span>
                </td>
                <td className="py-2.5 pr-4 text-xs text-gray-400 whitespace-nowrap">{new Date(m.created_at).toLocaleString("pt-PT")}</td>
                <td className="py-2.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleting(m);
                    }}
                    aria-label="Eliminar"
                    className="p-2 rounded-lg text-gray-400 hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {(detail || loadingDetail) && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative bg-white dark:bg-[#0a1628] w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <header className="sticky top-0 bg-white dark:bg-[#0a1628] flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-[#850b0b] dark:text-white font-['Montserrat'] text-sm">Mensagem de {detail?.name ?? "…"}</h3>
              <button onClick={() => setDetail(null)} aria-label="Fechar" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </header>
            {loadingDetail ? (
              <div className="p-5">
                <RowsLoading rows={4} cols={1} />
              </div>
            ) : detail ? (
              <div className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Info label="E-mail" value={detail.email} href={`mailto:${detail.email}`} />
                  <Info label="Telefone" value={detail.phone ?? "—"} href={detail.phone ? `tel:${detail.phone}` : undefined} />
                  <Info label="Empresa" value={detail.company ?? "—"} />
                  <Info label="Município" value={detail.municipality ?? "—"} />
                  <Info label="Tipo de interesse" value={detail.interest_type ?? "—"} />
                  <Info label="Projeto" value={detail.project_title ?? "—"} />
                  <Info label="Recebida" value={new Date(detail.created_at).toLocaleString("pt-PT")} />
                  {detail.ip_address ? <Info label="IP" value={detail.ip_address} /> : null}
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 whitespace-pre-line text-sm text-[#1a2332] dark:text-white/85 leading-relaxed border border-gray-100 dark:border-white/10">
                  {detail.message}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Btn variant="outline" size="sm" onClick={() => void act(detail, "read", detail.is_read ? false : true)}>
                    {detail.is_read ? "Marcar como não lida" : "Marcar como lida"}
                  </Btn>
                  <Btn variant="outline" size="sm" onClick={() => void act(detail, "spam", !detail.is_spam)}>
                    {detail.is_spam ? "Não é spam" : "Marcar como spam"}
                  </Btn>
                  <Btn variant="danger" size="sm" onClick={() => setDeleting(detail)}>
                    <Trash2 size={13} aria-hidden="true" /> Eliminar
                  </Btn>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {deleting && (
        <Confirm
          title="Eliminar mensagem"
          text={`A mensagem de “${deleting.name}” será removida definitivamente.`}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
      {href ? (
        <a href={href} className="text-[#E8821A] hover:underline break-all">{value}</a>
      ) : (
        <p className="text-[#850b0b] dark:text-white break-all">{value}</p>
      )}
    </div>
  );
}
