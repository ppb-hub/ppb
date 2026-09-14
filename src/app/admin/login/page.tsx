"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User } from "lucide-react";
import { login } from "@/lib/api/auth";
import { Btn } from "@/components/admin/ui";

/**
 * Login administrativo → POST /api/auth/login (JSON LoginIn).
 * O token devolvido (TokenOut.access_token) passa a ser enviado como
 * Bearer + espelhado no cookie portal_token (ver lib/api/auth.ts).
 */
export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Preencha utilizador e palavra-passe.");
      return;
    }
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#850b0b] px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/hero-benguela.jpg" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#D4A843] items-center justify-center mb-4 shadow-lg">
            <span className="text-[#850b0b] font-bold font-['Montserrat']">GPB</span>
          </div>
          <h1 className="text-white font-bold text-xl font-['Montserrat']">Painel Administrativo</h1>
          <p className="text-white/60 text-sm mt-1">Portal de Projectos de Benguela</p>
        </div>

        <form onSubmit={submit} className="bg-white dark:bg-[#850b0b]/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
          {error && (
            <div role="alert" className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#850b0b] dark:text-white mb-1.5">Utilizador</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:border-[#E8821A] text-[#1a2332] dark:text-white"
                placeholder="administrador"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#850b0b] dark:text-white mb-1.5">Palavra-passe</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:border-[#E8821A] text-[#1a2332] dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#E8821A] hover:bg-[#c96d10] disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" /> A entrar…
              </>
            ) : (
              "Entrar"
            )}
          </button>
          <p className="text-[11px] text-gray-400 dark:text-white/40 text-center">
            Acesso restrito à equipa do Governo Provincial.
          </p>
        </form>
        <Btn variant="ghost" className="mt-4 w-full text-white/60 hover:text-white" onClick={() => router.push("/pt")}>
          ← Voltar ao site
        </Btn>
      </div>
    </div>
  );
}
