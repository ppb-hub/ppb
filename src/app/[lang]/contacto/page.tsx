import type { Metadata } from "next";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import ContactForm from "@/components/public/ContactForm";
import { safe, catalogName } from "@/lib/api/public";
import { pickSetting } from "@/lib/api/public";
import { localizedHref, LOCALES, DEFAULT_LOCALE, getUi, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);
  return {
    title: ui.nav.contact,
    description: ui.contact.subtitle,
    alternates: {
      canonical: localizedHref(locale, "contact"),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizedHref(l, "contact")])),
    },
  };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ projeto?: string; interesse?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);

  const [munisRes, projectsRes, settingsRes] = await Promise.all([safe.municipalities(), safe.projects(), safe.settings()]);

  const settings = settingsRes.ok ? settingsRes.data : null;
  const sidebar = {
    phone: pickSetting(settings ?? {}, "contact_phone", locale) ?? "+244 272 232 105",
    email: pickSetting(settings ?? {}, "contact_email", locale) ?? "gg.gp@benguela.gov.ao",
    address: pickSetting(settings ?? {}, "address", locale) ?? "Governo Provincial de Benguela, Rua de Timor",
    hours: pickSetting(settings ?? {}, "business_hours", locale) ?? (locale === "pt" ? "8h às 17h (dias úteis)" : "8am–5pm (business days)"),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628]">
      {/* Header */}
      <div className="bg-[#850b0b] py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Breadcrumbs locale={locale} ui={ui} items={[{ label: ui.nav.contact }]} centered />
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-['Montserrat'] mb-3">{ui.contact.title}</h1>
          <p className="text-white/70 text-lg">{ui.contact.subtitle}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <ContactForm
          locale={locale}
          ui={ui}
          sidebar={sidebar}
          municipalities={munisRes.ok ? munisRes.data.map((m) => ({ slug: m.slug, name: catalogName(m, locale) || m.slug })) : []}
          projects={
            projectsRes.ok
              ? projectsRes.data.map((p) => ({
                  id: p.id,
                  title: (locale === "pt" ? p.title_pt : p.title_en) || p.title_pt || p.slug,
                }))
              : []
          }
          preselectedProjectId={sp.projeto ? Number(sp.projeto) : undefined}
          preselectedInterest={sp.interesse === "investidor" ? ui.contact.interestOptions[0] : undefined}
        />
      </div>
    </div>
  );
}
