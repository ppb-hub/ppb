import type { MetadataRoute } from "next";
import { LOCALES, localizedHref, type Locale } from "@/lib/i18n/config";
import { getProjects } from "@/lib/api/public";

const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

/**
 * sitemap.xml estático (rotas do template) + URLs reais de /api/projects.
 * Se a API estiver indisponível, publica só as páginas fixas (não rebenta).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["home", "projects", "about", "investor", "contact", "privacy"] as const;

  let slugs: string[] = [];
  try {
    const projects = await getProjects();
    slugs = projects.map((p) => p.slug);
  } catch {
    slugs = [];
  }

  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const r of routes) {
      const path = localizedHref(locale, r);
      entries.push({
        url: `${site}${path || `/${locale}`}`,
        lastModified: now,
        changeFrequency: r === "home" || r === "projects" ? "daily" : "weekly",
        priority: r === "home" ? 1 : r === "projects" ? 0.9 : 0.7,
      });
    }
    for (const slug of slugs) {
      entries.push({
        url: `${site}${localizedHref(locale, "projects", slug)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // hreflang alternates para projectos (mesma página em pt/en)
  for (const slug of slugs) {
    const ptUrl = `${site}${localizedHref("pt" as Locale, "projects", slug)}`;
    entries.push({
      url: ptUrl,
      lastModified: now,
      alternates: {
        languages: {
          pt: ptUrl,
          en: `${site}${localizedHref("en" as Locale, "projects", slug)}`,
          "x-default": ptUrl,
        },
      },
    });
  }

  return entries;
}
