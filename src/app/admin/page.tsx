"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Inbox, Newspaper, CheckCircle2, PauseCircle } from "lucide-react";
import { listMessages, listProjects, listUpdates } from "@/lib/api/admin";
import { Card, RowsLoading, ErrorLine } from "@/components/admin/ui";
import { useAdminAuth } from "@/components/admin/AdminShell";
import { formatMoneyKz } from "@/lib/format";
import { bi } from "@/lib/fields";

interface DashData {
  totalProjects: number;
  activeProjects: number;
  stoppedProjects: number;
  unread: number;
  updates: Array<{ id: number; title_pt: string; date: string }>;
}

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [data, setData] = useState<DashData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [projects, messages, updates] = await Promise.all([listProjects(), listMessages({ only_unread: true }), listUpdates()]);
        if (cancelled) return;
        setData({
          totalProjects: projects.length,
          activeProjects: projects.filter((p) => p.ativo).length,
          stoppedProjects: projects.filter((p) => p.status?.slug === "paralisado").length,
          unread: messages.length,
          updates: updates.slice(0, 5),
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat']">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-white/60 mt-1">
          Bem-vindo, <span className="font-semibold text-[#E8821A]">{user?.username}</span>. Estado resumido do portal.
        </p>
      </div>

      {error ? <ErrorLine message={error} /> : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Projetos publicados", value: data?.activeProjects, icon: CheckCircle2, tone: "text-[#27AE60]" },
          { label: "Projetos (total)", value: data?.totalProjects, icon: FolderKanban, tone: "text-[#D4A843]" },
          { label: "Paralisados", value: data?.stoppedProjects, icon: PauseCircle, tone: "text-[#E74C3C]" },
          { label: "Mensagens por ler", value: data?.unread, icon: Inbox, tone: "text-[#E8821A]" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#850b0b]/30 rounded-2xl border border-gray-100 dark:border-white/10 p-5 flex items-center gap-4">
            <span className={`w-11 h-11 rounded-xl bg-gray-50 dark:bg-white/10 flex items-center justify-center ${s.tone}`}>
              <s.icon size={20} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-2xl font-bold font-['Montserrat'] text-[#850b0b] dark:text-white">
                {data ? s.value : "—"}
              </span>
              <span className="block text-xs text-gray-500 dark:text-white/50">{s.label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Últimas atualizações" actions={<Link className="text-xs text-[#E8821A] hover:underline flex items-center gap-1" href="/admin/atualizacoes"><Newspaper size={12} /> Gerir</Link>}>
          {!data && !error ? <RowsLoading rows={3} cols={2} /> : data && data.updates.length > 0 ? (
            <ul className="divide-y divide-gray-50 dark:divide-white/5">
              {data.updates.map((u) => (
                <li key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                  <span className="text-sm text-[#850b0b] dark:text-white line-clamp-1">{u.title_pt}</span>
                  <span className="text-xs text-gray-400 dark:text-white/40 shrink-0">{u.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Sem atualizações publicadas.</p>
          )}
        </Card>

        <Card title="Atalhos" actions={<Link className="text-xs text-[#E8821A] hover:underline" href="/admin/mensagens">Mensagens →</Link>}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { href: "/admin/projetos", label: "Gerir projectos" },
              { href: "/admin/projetos/novo", label: "Novo projeto" },
              { href: "/admin/numeros", label: "Números da home" },
              { href: "/admin/definicoes", label: "Definições do site" },
              { href: "/admin/catalogos", label: "Catálogos" },
              { href: "/admin/sobre", label: "Página “Sobre”" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 hover:border-[#E8821A] hover:bg-[#E8821A]/5 transition-colors text-[#850b0b] dark:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
