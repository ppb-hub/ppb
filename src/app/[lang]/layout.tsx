import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/public/Header";
import Footer, { type SiteContacts } from "@/components/public/Footer";
import CookieBar from "@/components/public/CookieBar";
import Analytics from "@/components/public/Analytics";
import ScrollToTop from "@/components/public/ScrollToTop";
import { LOCALES, DEFAULT_LOCALE, getUi, localizedHref } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { safe, pickSetting } from "@/lib/api/public";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);
  return {
    title: {
      absolute:
        locale === "pt"
          ? "Portal de Projectos — Governo Provincial de Benguela"
          : "Projects Portal — Provincial Government of Benguela",
    },
    description: ui.footer.aboutText,
    alternates: {
      canonical: localizedHref(locale, "home"),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizedHref(l, "home")])),
    },
  };
}

/** Contactos do rodapé: /api/settings quando a chave existir; senão o texto do template. */
async function loadContacts(locale: Locale): Promise<SiteContacts> {
  const fallbacks: SiteContacts = {
    phone: "+244 272 232 105",
    email: "gg.gp@benguela.gov.ao",
    address: "Governo Provincial de Benguela, Rua de Timor",
    hours: locale === "pt" ? "8h às 17h (dias úteis)" : "8am–5pm (business days)",
  };
  const res = await safe.settings();
  if (!res.ok) return fallbacks;
  const s = res.data;
  return {
    phone: pickSetting(s, "contact_phone", locale) ?? fallbacks.phone,
    email: pickSetting(s, "contact_email", locale) ?? fallbacks.email,
    address: pickSetting(s, "address", locale) ?? fallbacks.address,
    hours: pickSetting(s, "business_hours", locale) ?? fallbacks.hours,
    facebook: pickSetting(s, "facebook_url", locale) ?? undefined,
    instagram: pickSetting(s, "instagram_url", locale) ?? undefined,
    youtube: pickSetting(s, "youtube_url", locale) ?? undefined,
    linkedin: pickSetting(s, "linkedin_url", locale) ?? undefined,
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!(LOCALES as readonly string[]).includes(lang)) notFound();
  const locale = lang as Locale;
  const ui = getUi(locale);
  const contacts = await loadContacts(locale);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628] text-[#1a2332] dark:text-white transition-colors duration-300">
      <ScrollToTop />
      <Header locale={locale} ui={ui} />
      <main className="pt-16 md:pt-[4.5rem]" id="conteudo">{children}</main>
      <Footer locale={locale} ui={ui} contacts={contacts} />
      <CookieBar locale={locale} ui={ui} />
      <Analytics />
    </div>
  );
}
