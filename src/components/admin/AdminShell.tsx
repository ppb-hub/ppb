"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FolderKanban,
  Newspaper,
  BarChart3,
  Building,
  Landmark,
  Milestone,
  TrendingUp,
  Quote,
  FileText,
  Settings2,
  Library,
  Inbox,
  UserCog,
  LogOut,
  Loader2,
  Moon,
  Sun,
  Image
} from "lucide-react";
import { me, logout, clearToken } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import type { UserOut } from "@/types/api";
import { Toaster, Btn } from "./ui";
import { cx } from "@/lib/format";

interface AuthState {
  user: UserOut | null;
  checking: boolean;
  error: string | null;
  doLogout: () => Promise<void>;
}
const AuthCtx = createContext<AuthState>({ user: null, checking: true, error: null, doLogout: async () => {} });
export const useAdminAuth = () => useContext(AuthCtx);

const NAV = [
  { section: "Visão geral", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    section: "Conteúdos",
    items: [
      { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
      { href: "/admin/atualizacoes", label: "Atualizações", icon: Newspaper },
      { href: "/admin/carousel", label: "Carousel da home", icon: Image },
      { href: "/admin/numeros", label: "Números da home", icon: BarChart3 },
      { href: "/admin/sobre", label: "Página “Sobre”", icon: Building },
      { href: "/admin/orgao", label: "Estrutura orgânica", icon: Landmark },
      { href: "/admin/marcos", label: "Realizações", icon: Milestone },
    ],
  },
  {
    section: "Investidor",
    items: [
      // { href: "/admin/oportunidades", label: "Oportunidades", icon: TrendingUp },
      { href: "/admin/indicadores", label: "Indicadores", icon: BarChart3 },
      { href: "/admin/depoimentos", label: "Depoimentos", icon: Quote },
      { href: "/admin/documentos", label: "Documentos", icon: FileText },
    ],
  },
  {
    section: "Sistema",
    items: [
      { href: "/admin/definicoes", label: "Definições do site", icon: Settings2 },
      { href: "/admin/catalogos", label: "Catálogos", icon: Library },
      { href: "/admin/mensagens", label: "Mensagens", icon: Inbox },
      { href: "/admin/conta", label: "Conta & acessos", icon: UserCog },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState<UserOut | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const u = await me();
      setUser(u);
      setError(null);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        clearToken();
        setUser(null);
        router.replace("/admin/login");
        return;
      }
      setError(e instanceof Error ? e.message : "Falha de ligação");
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const doLogout = useCallback(async () => {
    await logout();
    setUser(null);
    router.replace("/admin/login");
  }, [router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-[#0a1628] gap-3">
        <Loader2 className="animate-spin text-[#E8821A]" size={28} />
        <p className="text-sm text-gray-500 dark:text-white/50">A verificar sessão…</p>
      </div>
    );
  }

  if (!user) {
    // 401/403 → o redirect para login trata disto; manter tela neutra enquanto navega
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0a1628]">
        <div className="text-center space-y-4">
          {error ? <p className="text-sm text-red-500">{error}</p> : <p className="text-sm text-gray-500">Sessão terminada.</p>}
          <Btn onClick={() => router.replace("/admin/login")}>Entrar novamente</Btn>
        </div>
      </div>
    );
  }

  return (
    <AuthCtx.Provider value={{ user, checking, error, doLogout }}>
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a1628] text-[#1a2332] dark:text-white">
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:flex w-64 shrink-0 min-h-screen flex-col bg-[#0F2B5B] text-white sticky top-0 h-screen">
            <Link href="/admin" className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
              <span className="w-9 h-9 rounded-lg bg-[#D4A843] flex items-center justify-center">
                <span className="text-[#0F2B5B] font-bold text-xs font-['Montserrat']">GPB</span>
              </span>
              <span>
                <span className="block text-sm font-bold font-['Montserrat'] leading-tight">Painel</span>
                <span className="block text-[#D4A843] text-[11px]">Projectos de Benguela</span>
              </span>
            </Link>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Navegação do painel">
              {NAV.map((group) => (
                <div key={group.section}>
                  <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">{group.section}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cx(
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                            active ? "bg-[#D4A843] text-[#0F2B5B] font-semibold" : "text-white/75 hover:text-white hover:bg-white/10"
                          )}
                        >
                          <item.icon size={15} aria-hidden="true" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/60 truncate">{user.username}</span>
              <button onClick={() => void doLogout()} aria-label="Terminar sessão" className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <LogOut size={15} />
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur border-b border-gray-100 dark:border-white/10 h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
              {/* mobile nav */}
              <MobileNav user={user} onLogout={doLogout} />
              <div className="ml-auto flex items-center gap-2">
                <Link href="/pt" target="_blank" className="text-xs text-[#0F2B5B] dark:text-white/70 hover:text-[#E8821A] underline underline-offset-2">
                  Ver site
                </Link>
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  aria-label="Alternar tema"
                  className="p-2 rounded-lg text-gray-500 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </header>
            <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">{children}</main>
          </div>
        </div>
        <Toaster />
      </div>
    </AuthCtx.Provider>
  );
}

function MobileNav({ user, onLogout }: { user: UserOut; onLogout: () => Promise<void> }) {
  return (
    <div className="lg:hidden flex items-center gap-3 min-w-0">
      <select
        aria-label="Navegação do painel"
        className="max-w-[46vw] text-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-[#0F2B5B] rounded-lg px-2 py-1.5"
        onChange={(e) => {
          if (e.target.value) window.location.href = e.target.value;
        }}
        defaultValue=""
      >
        <option value="" disabled>
          Menu
        </option>
        {NAV.flatMap((g) => g.items.map((i) => ({ ...i, section: g.section }))).map((item) => (
          <option key={item.href} value={item.href}>
            {item.section} — {item.label}
          </option>
        ))}
      </select>
      <span className="hidden sm:block text-xs text-gray-400 truncate">{user.username}</span>
      <button onClick={() => void onLogout()} aria-label="Terminar sessão" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
        <LogOut size={15} />
      </button>
    </div>
  );
}
