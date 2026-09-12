"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, AlertCircle } from "lucide-react";
import { browserFetch } from "@/lib/api/server-fetch";
import { ApiError } from "@/lib/api/errors";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import type { UiStrings } from "@/lib/i18n/ui";
import { cx } from "@/lib/format";
import type { ContactCreate, ContactResponse } from "@/types/api";

function newCaptcha() {
  return { a: 1 + Math.floor(Math.random() * 9), b: 1 + Math.floor(Math.random() * 9) };
}

const Field = memo(function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#850b0b] dark:text-white mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} aria-hidden="true" /> {error}
        </p>
      ) : null}
    </div>
  );
});

const inputClass = (err?: string) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-white/5 text-[#1a2332] dark:text-white focus:outline-none transition-colors ${
    err ? "border-red-400 focus:border-red-500" : "border-gray-200 dark:border-white/20 focus:border-[#E8821A]"
  }`;

const ContactForm = memo(function ContactForm({
  locale,
  ui,
  municipalities,
  projects,
  preselectedProjectId,
  preselectedInterest,
  sidebar,
}: {
  locale: Locale;
  ui: UiStrings;
  municipalities: Array<{ slug: string; name: string }>;
  projects: Array<{ id: number; title: string }>;
  preselectedProjectId?: number;
  preselectedInterest?: string;
  sidebar: { phone: string; email: string; address: string; hours: string };
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    interest_type: preselectedInterest ?? "",
    municipality: "",
    project_id: preselectedProjectId ? String(preselectedProjectId) : "",
    message: "",
    website: "",
    privacy: false,
    math: "",
  });
  const [captcha, setCaptcha] = useState(newCaptcha);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mountedAt = useRef(Date.now());

  const expected = captcha.a + captcha.b;

  const update = useCallback((key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = ui.contact.required;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = ui.contact.invalidEmail;
    if (!form.phone.trim()) e.phone = ui.contact.required;
    if (!form.interest_type) e.interest_type = ui.contact.selectOne;
    if (!form.message.trim()) e.message = ui.contact.required;
    if (!form.privacy) e.privacy = ui.contact.mustAccept;
    if (Number(form.math) !== expected) e.math = ui.contact.wrongCaptcha;
    return e;
  };

  const preselected = useMemo(
    () => projects.find((p) => p.id === preselectedProjectId),
    [projects, preselectedProjectId]
  );

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError(null);
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }
    setLoading(true);
    try {
      const payload: ContactCreate = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim() || null,
        interest_type: form.interest_type || null,
        municipality: form.municipality || null,
        project_id: form.project_id ? Number(form.project_id) : null,
        project_title:
          projects.find((p) => String(p.id) === form.project_id)?.title ?? preselected?.title ?? null,
        message: form.message.trim(),
        // anti-spam: honeypot sempre vazio + captcha matemático + tempo no formulário
        website: form.website,
        captcha_answer: Number(form.math),
        captcha_expected: expected,
        elapsed_seconds: Math.max(0, Math.round((Date.now() - mountedAt.current) / 1000)),
      };
      const res = await browserFetch<ContactResponse>("/api/contact", { method: "POST", body: payload });
      if (res && res.success === false) {
        throw new ApiError(400, res.detail || ui.contact.serverError);
      }
      setSubmitted(true);
    } catch (err) {
      setCaptcha(newCaptcha());
      if (err instanceof ApiError) {
        if (err.fieldErrors) setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        setSubmitError(err.message || ui.contact.serverError);
      } else {
        setSubmitError(ui.contact.serverError);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find((p) => String(p.id) === form.project_id);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-[#27AE60]/10 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 size={40} className="text-[#27AE60]" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat'] mb-3">{ui.contact.successTitle}</h2>
        <p className="text-gray-600 dark:text-white/70 max-w-md">{ui.contact.successText}</p>
        <Link href={localizedHref(locale, "projects")} className="mt-6 inline-flex items-center gap-2 bg-[#E8821A] hover:bg-[#c96d10] text-white font-medium px-6 py-3 rounded-xl transition-colors">
          {ui.contact.successCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-10">
      {/* FORM — POST /api/contact */}
      <div>
        {submitError && (
          <div role="alert" className="mb-5 flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm rounded-xl p-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={ui.contact.name} required error={errors.name}>
              <input name="name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass(errors.name)} placeholder={ui.contact.namePh} autoComplete="name" />
            </Field>
            <Field label={ui.contact.email} required error={errors.email}>
              <input name="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass(errors.email)} placeholder={ui.contact.emailPh} autoComplete="email" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={ui.contact.phone} required error={errors.phone}>
              <input name="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass(errors.phone)} placeholder={ui.contact.phonePh} autoComplete="tel" />
            </Field>
            <Field label={ui.contact.company} error={errors.company}>
              <input name="company" type="text" value={form.company} onChange={(e) => update("company", e.target.value)} className={inputClass(errors.company)} placeholder={ui.contact.companyPh} autoComplete="organization" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={ui.contact.interest} required error={errors.interest_type}>
              <select value={form.interest_type} onChange={(e) => update("interest_type", e.target.value)} className={inputClass(errors.interest_type)}>
                <option value="">{locale === "pt" ? "Selecione..." : "Select..."}</option>
                {ui.contact.interestOptions.map((tOpt) => (
                  <option key={tOpt} value={tOpt}>
                    {tOpt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={ui.contact.municipality} error={errors.municipality}>
              <select value={form.municipality} onChange={(e) => update("municipality", e.target.value)} className={inputClass(errors.municipality)}>
                <option value="">{ui.contact.municipalityAll}</option>
                {municipalities.map((m) => (
                  <option key={m.slug} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={ui.contact.project} error={errors.project_id}>
            <select value={form.project_id} onChange={(e) => update("project_id", e.target.value)} className={inputClass(errors.project_id)}>
              <option value="">{projects.length ? ui.contact.projectAny : ui.contact.projectPlaceholder}</option>
              {projects.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.title}
                </option>
              ))}
            </select>
            {selectedProject ? <p className="text-xs text-gray-400 dark:text-white/40 mt-1">{selectedProject.title}</p> : null}
          </Field>

          <Field label={ui.contact.message} required error={errors.message}>
            <textarea
              name="message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              rows={5}
              maxLength={1000}
              className={`${inputClass(errors.message)} resize-none`}
              placeholder={ui.contact.messagePh}
            />
            <div className="text-right text-xs text-gray-400 mt-1" aria-live="polite">
              {form.message.length}/1000
            </div>
          </Field>

          {/* Honeypot invisível (campo `website` da API) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input name="website" id="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />
          </div>

          {/* Captcha matemático — o par resposta/esperado vai no body (ContactCreate) */}
          <Field label={ui.contact.captcha} required error={errors.math}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#850b0b] dark:text-white bg-[#F8F9FA] dark:bg-white/10 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/20">
                {captcha.a} + {captcha.b} =
              </span>
              <input
                name="math"
                type="number"
                inputMode="numeric"
                value={form.math}
                onChange={(e) => update("math", e.target.value)}
                className={`${inputClass(errors.math)} w-24`}
                placeholder={ui.contact.captchaPh}
                aria-label={ui.contact.captcha}
              />
            </div>
          </Field>

          <div>
            <label className={cx("flex items-start gap-2.5 cursor-pointer text-sm", errors.privacy ? "text-red-500" : "text-gray-600 dark:text-white/70")}>
              <input name="privacy" type="checkbox" checked={form.privacy} onChange={(e) => update("privacy", e.target.checked)} className="accent-[#E8821A] mt-0.5" />
              <span>
                {ui.contact.privacy}{" "}
                <Link href={localizedHref(locale, "privacy")} className="text-[#E8821A] underline">
                  {ui.contact.privacyLink}
                </Link>{" "}
                {locale === "pt" ? "do Portal de Projectos de Benguela." : "of the Benguela Projects Portal."}
              </span>
            </label>
            {errors.privacy ? <p className="mt-1 text-xs text-red-500">{errors.privacy}</p> : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#E8821A] hover:bg-[#c96d10] disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-colors text-base"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" /> {ui.contact.sending}
              </>
            ) : (
              ui.contact.submit
            )}
          </button>
        </form>
      </div>

      {/* Sidebar de contactos — valores de /api/settings quando existirem */}
      <div className="space-y-5">
        <div className="bg-[#F8F9FA] dark:bg-[#850b0b]/30 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
          <h3 className="font-bold text-[#850b0b] dark:text-white font-['Montserrat'] mb-5">{ui.contact.sidebarTitle}</h3>
          <div className="space-y-4">
            <a href={`tel:${sidebar.phone.replace(/[^\d+]/g, "")}`} className="flex items-start gap-3 group">
              <span className="w-9 h-9 bg-[#850b0b] rounded-lg flex items-center justify-center shrink-0">
                <Phone size={15} className="text-[#D4A843]" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs text-gray-400 dark:text-white/50">{ui.contact.phoneLabel}</span>
                <span className="block text-sm font-medium text-[#850b0b] dark:text-white group-hover:text-[#E8821A] transition-colors">{sidebar.phone}</span>
              </span>
            </a>
            <a href={`mailto:${sidebar.email}`} className="flex items-start gap-3 group">
              <span className="w-9 h-9 bg-[#850b0b] rounded-lg flex items-center justify-center shrink-0">
                <Mail size={15} className="text-[#D4A843]" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs text-gray-400 dark:text-white/50">{ui.contact.emailLabel}</span>
                <span className="block text-sm font-medium text-[#850b0b] dark:text-white group-hover:text-[#E8821A] transition-colors">{sidebar.email}</span>
              </span>
            </a>
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 bg-[#850b0b] rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-[#D4A843]" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs text-gray-400 dark:text-white/50">{ui.contact.addressLabel}</span>
                <span className="block text-sm text-[#850b0b] dark:text-white leading-snug">{sidebar.address}</span>
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 bg-[#850b0b] rounded-lg flex items-center justify-center shrink-0">
                <Clock size={15} className="text-[#D4A843]" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs text-gray-400 dark:text-white/50">{ui.contact.hoursLabel}</span>
                <span className="block text-sm text-[#850b0b] dark:text-white">{sidebar.hours}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden h-48 bg-[#850b0b]/10 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10">
          <div className="text-center text-gray-400 dark:text-white/40">
            <MapPin size={28} className="mx-auto mb-2 text-[#E8821A]" aria-hidden="true" />
            <p className="text-sm">{ui.contact.mapTitle}</p>
            <p className="text-xs mt-1">{ui.contact.mapNote}</p>
          </div>
        </div>

        <div className="bg-[#850b0b] rounded-2xl p-5 text-center">
          <p className="text-white/70 text-sm mb-1">{ui.contact.responseTime}</p>
          <p className="text-[#D4A843] font-bold font-['Montserrat'] text-lg">{ui.contact.responseValue}</p>
          <p className="text-white/50 text-xs mt-1">{ui.contact.responseNote}</p>
        </div>
      </div>
    </div>
  );
});

export default ContactForm;
