"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";

/** UI kit mínimo do painel — mesma paleta do site. */

export function Card({ title, actions, children, className = "" }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white dark:bg-[#850b0b]/30 rounded-2xl border border-gray-100 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="font-bold text-[#850b0b] dark:text-white font-['Montserrat'] text-base">{title}</h2>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Btn({
  variant = "primary",
  size = "md",
  loading,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "gold" | "outline";
  size?: "sm" | "md";
  loading?: boolean;
}) {
  const styles = {
    primary: "bg-[#E8821A] hover:bg-[#c96d10] text-white",
    gold: "bg-[#D4A843] hover:bg-[#e0bc6a] text-[#850b0b]",
    danger: "bg-[#E74C3C] hover:bg-[#c0392b] text-white",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-[#850b0b] dark:text-white",
    outline: "border border-gray-200 dark:border-white/20 hover:border-[#850b0b] dark:hover:border-white text-[#850b0b] dark:text-white",
  }[variant];
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-60 ${
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
      } ${styles} ${className}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

export const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 text-sm text-[#1a2332] dark:text-white rounded-xl focus:outline-none focus:border-[#E8821A] transition-colors";

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-[#850b0b] dark:text-white mb-1.5 uppercase tracking-wide">
      {children}
      {required && <span className="text-red-500 ml-0.5 normal-case">*</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? "bg-[#27AE60]" : "bg-gray-300 dark:bg-white/20"
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#0a1628] w-full ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col`}>
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <h3 className="font-bold text-[#850b0b] dark:text-white font-['Montserrat']">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </header>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ title, text, confirmLabel = "Eliminar", onConfirm, onClose }: { title: string; text: string; confirmLabel?: string; onConfirm: () => void | Promise<void>; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-gray-600 dark:text-white/70 mb-5">{text}</p>
      <div className="flex justify-end gap-2">
        <Btn variant="outline" onClick={onClose}>Cancelar</Btn>
        <Btn
          variant="danger"
          loading={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await onConfirm();
            } finally {
              setLoading(false);
            }
          }}
        >
          {confirmLabel}
        </Btn>
      </div>
    </Modal>
  );
}

export function Table({ head, children }: { head: React.ReactNode[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-gray-400 dark:text-white/40 border-b border-gray-100 dark:border-white/10">
            {head.map((h, i) => (
              <th key={i} className="py-2.5 pr-4 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-white/5">{children}</tbody>
      </table>
    </div>
  );
}

export function RowsLoading({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 py-2" aria-busy="true" aria-label="A carregar">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ErrorLine({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
      <AlertTriangle size={15} aria-hidden="true" /> {message}
    </div>
  );
}

/* ---------- Toasts (módulo simples sem dependências) ---------- */
type ToastMsg = { id: number; text: string; type: "ok" | "err" };
let toastId = 0;
const listeners = new Set<(t: ToastMsg[]) => void>();
let toasts: ToastMsg[] = [];

function emit() {
  listeners.forEach((l) => l([...toasts]));
}

export function toast(text: string, type: "ok" | "err" = "ok") {
  const t = { id: ++toastId, text, type };
  toasts = [...toasts, t];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id);
    emit();
  }, 3500);
}

export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);
  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2 no-print" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm text-white animate-fade-in ${
            t.type === "ok" ? "bg-[#850b0b]" : "bg-[#E74C3C]"
          }`}
        >
          {t.type === "ok" ? <CheckCircle2 size={15} className="text-[#27AE60]" /> : <AlertTriangle size={15} />}
          {t.text}
        </div>
      ))}
    </div>
  );
}
