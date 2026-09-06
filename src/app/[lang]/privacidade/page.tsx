import type { Metadata } from "next";
import { LOCALES, DEFAULT_LOCALE, getUi, localizedHref, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);
  return {
    title: ui.privacy.title,
    description: ui.privacy.intro,
    alternates: {
      canonical: localizedHref(locale, "privacy"),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizedHref(l, "privacy")])),
    },
  };
}

const CONTENT: Record<Locale, Array<{ h: string; ps: string[] }>> = {
  pt: [
    {
      h: "1. Responsável pelo tratamento",
      ps: [
        "O Portal de Projectos é gerido pelo Governo Provincial de Benguela (GPB), com sede na Governo Provincial de Benguela, Rua de Timor. Contactos: gg.gp@benguela.gov.ao.",
      ],
    },
    {
      h: "2. Dados que recolhemos",
      ps: [
        "Apenas recolhemos os dados que submete voluntariamente no formulário de contacto (nome, e-mail, telefone, empresa, município, projeto de interesse e mensagem), usados exclusivamente para responder ao seu pedido.",
        "As submissões registam ainda o carimbo temporal e o endereço IP para efeitos de prevenção de spam e abuse.",
      ],
    },
    {
      h: "3. Finalidades e conservação",
      ps: [
        "Os dados do formulário são usados para responder às solicitações e manter registo das interações. São conservados enquanto for necessário para a finalidade declarada ou exigido por obrigação legal.",
        "Os conteúdos institucionais (projectos, números, atualizações) são públicos e não contêm dados pessoais.",
      ],
    },
    {
      h: "4. Cookies e armazenamento local",
      ps: [
        "Cookies necessários: preferência de tema (claro/escuro), idioma preferido e sessão do painel administrativo (cookie portal_token, estritamente necessário para autenticar gestores).",
        "Analytics: apenas com consentimento explícito no banner de cookies. Sem consentimento, nenhum script de medição é carregado.",
        "Pode gerir ou revogar o consentimento através do banner apresentado na primeira visita e das definições do seu navegador.",
      ],
    },
    {
      h: "5. Partilha de dados",
      ps: ["Não vendemos nem partilhamos dados pessoais com terceiros para fins comerciais. O envio das mensagens de contacto é processado pela infraestrutura institucional do GPB."],
    },
    {
      h: "6. Direitos dos titulares",
      ps: [
        "Pode solicitar acesso, retificação ou eliminação dos seus dados, bem como opor-se ao tratamento, escrevendo para projectos@benguela.gov.ao.",
      ],
    },
    {
      h: "7. Segurança",
      ps: ["Aplicamos medidas técnicas e organizativas adequadas (comunicações cifradas quando servidas via HTTPS, acesso restrito ao painel administrativo e princípios de privilégio mínimo)."],
    },
  ],
  en: [
    {
      h: "1. Data controller",
      ps: ["The Projects Portal is operated by the Provincial Government of Benguela (GPB), headquartered at Governo Provincial de Benguela, Rua de Timor. Contact: gg.gp@benguela.gov.ao."],
    },
    {
      h: "2. Data we collect",
      ps: [
        "We only collect what you submit through the contact form (name, e-mail, phone, company, municipality, project of interest and message), used exclusively to answer your request.",
        "Submissions also record a timestamp and IP address for spam and abuse prevention.",
      ],
    },
    {
      h: "3. Purposes and retention",
      ps: [
        "Form data is used to respond to requests and to keep a record of interactions, retained as long as needed for the stated purpose or by legal obligation.",
        "Institutional content (projects, figures, updates) is public and contains no personal data.",
      ],
    },
    {
      h: "4. Cookies and local storage",
      ps: [
        "Necessary cookies: theme preference, language preference and admin panel session (portal_token cookie, strictly required to authenticate managers).",
        "Analytics: only with explicit consent in the cookie banner. Without consent, no measurement script is loaded.",
        "You can manage or withdraw consent through the banner shown on first visit and your browser settings.",
      ],
    },
    {
      h: "5. Data sharing",
      ps: ["We do not sell or share personal data with third parties for commercial purposes. Contact messages are handled by GPB's institutional infrastructure."],
    },
    {
      h: "6. Rights",
      ps: ["You may request access, rectification or erasure of your data, and object to processing, by writing to projectos@benguela.gov.ao."],
    },
    {
      h: "7. Security",
      ps: ["We apply appropriate technical and organizational measures (encrypted communications when served over HTTPS, restricted access to the admin panel and least-privilege principles)."],
    },
  ],
};

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const ui = getUi(locale);
  const blocks = CONTENT[locale];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628]">
      <div className="bg-[#0F2B5B] py-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white font-['Montserrat'] mb-3">{ui.privacy.title}</h1>
          <p className="text-white/70">{ui.privacy.intro}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        {blocks.map((b) => (
          <section key={b.h} id={b.h.startsWith("4") ? "cookies" : undefined}>
            <h2 className="text-lg font-bold text-[#0F2B5B] dark:text-white font-['Montserrat'] mb-3">{b.h}</h2>
            {b.ps.map((p, i) => (
              <p key={i} className="text-gray-600 dark:text-white/70 text-sm leading-relaxed mb-2">
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="text-xs text-gray-400 dark:text-white/40">
          {locale === "pt" ? "Última atualização: 2026" : "Last updated: 2026"}
        </p>
      </div>
    </div>
  );
}
