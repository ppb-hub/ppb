import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { ThemeProvider } from "next-themes";
import { LOCALES, DEFAULT_LOCALE, htmlLang, type Locale } from "@/lib/i18n/config";
import "./globals.css";

/** Aplica a preferência guardada antes da pintura — evita flash de tema (FOUC). */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("gpba-theme");if(t!=="dark"&&t!=="light"){t="light"}var c=document.documentElement.classList;t==="dark"?c.add("dark"):c.remove("dark")}catch(e){}})();`;


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Portal de Projectos — Governo Provincial de Benguela",
    template: "%s — Portal de Projectos de Benguela",
  },
  description:
    "Acompanhe os projectos públicos, investimentos e oportunidades da Província de Benguela, Angola.",
  applicationName: "Portal de Projectos de Benguela",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
  },
  openGraph: {
    type: "website",
    siteName: "Portal de Projectos de Benguela",
    locale: "pt_AO",
    alternateLocale: ["en_GB"],
    url: "/",
    images: [{ url: "/media/hero-benguela.jpg", width: 1200, height: 630, alt: "Portal de Projectos de Benguela" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#850b0b" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1628" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // idioma para <html lang> — definido pelo middleware no header x-nextjs-locale
  let locale: Locale = DEFAULT_LOCALE;
  try {
    const h = await headers();
    const l = h.get("x-nextjs-locale");
    if (l && (LOCALES as readonly string[]).includes(l)) locale = l as Locale;
  } catch {
    /* estático — usa default */
  }

  return (
    <html lang={htmlLang(locale)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="gpba-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
