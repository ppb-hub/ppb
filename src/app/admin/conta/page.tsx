"use client";

import { useState } from "react";
import { KeyRound, UserPlus } from "lucide-react";
import { changePassword, createAdmin } from "@/lib/api/auth";
import { useAdminAuth } from "@/components/admin/AdminShell";
import { Btn, Card, ErrorLine, inputCls, Label, toast } from "@/components/admin/ui";

/** Conta: dados do utilizador (GET /api/auth/me), alterar palavra-passe (POST /api/auth/password) e criar admin (POST /api/auth/admin). */
export default function AdminAccountPage() {
  const { user } = useAdminAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2B5B] dark:text-white font-['Montserrat']">Conta & Acessos</h1>
        <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Gestão da sessão e utilizadores administrativos suportados pela API.</p>
      </div>

      <Card title="Sessão atual">
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Utilizador</dt>
            <dd className="text-[#0F2B5B] dark:text-white font-medium">{user?.username ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">E-mail</dt>
            <dd className="text-[#0F2B5B] dark:text-white">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Estado</dt>
            <dd className={user?.is_active ? "text-[#27AE60] font-medium" : "text-[#E74C3C] font-medium"}>{user?.is_active ? "Ativo" : "Inativo"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Privilégios</dt>
            <dd className="text-[#0F2B5B] dark:text-white">{user?.is_superuser ? "Superutilizador" : "Administrador"}</dd>
          </div>
        </dl>
      </Card>

      <PasswordForm />
      <NewAdminForm />
    </div>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < 8) {
      setError("A nova palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    if (next !== confirm) {
      setError("A confirmação não coincide.");
      return;
    }
    setBusy(true);
    try {
      await changePassword({ current_password: current, new_password: next });
      toast("Palavra-passe alterada.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível alterar a palavra-passe.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Alterar palavra-passe">
      <form onSubmit={submit} className="space-y-4">
        {error ? <ErrorLine message={error} /> : null}
        <div>
          <Label required>Palavra-passe atual</Label>
          <input type="password" autoComplete="current-password" className={inputCls} value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label required>Nova palavra-passe</Label>
            <input type="password" autoComplete="new-password" className={inputCls} value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div>
            <Label required>Confirmar nova</Label>
            <input type="password" autoComplete="new-password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <Btn type="submit" loading={busy}>
          <KeyRound size={14} aria-hidden="true" /> Alterar
        </Btn>
      </form>
    </Card>
  );
}

function NewAdminForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || password.length < 8) {
      setError("Utilizador obrigatório e palavra-passe com 8+ caracteres.");
      return;
    }
    setBusy(true);
    try {
      await createAdmin({ username: username.trim(), email: email.trim() || undefined, password });
      toast("Administrador criado.");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o administrador.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Novo administrador">
      <p className="text-[11px] text-gray-400 mb-3">Criação de contas administrativas (acesso restrito).</p>
      <form onSubmit={submit} className="space-y-4">
        {error ? <ErrorLine message={error} /> : null}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label required>Utilizador</Label>
            <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <Label>E-mail</Label>
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div>
          <Label required>Palavra-passe inicial</Label>
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <Btn type="submit" loading={busy} variant="outline">
          <UserPlus size={14} aria-hidden="true" /> Criar administrador
        </Btn>
      </form>
    </Card>
  );
}
