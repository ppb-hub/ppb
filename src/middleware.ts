import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n/config";

const PUBLIC_FILE_RE = /\.(?:svg|png|jpg|jpeg|webp|gif|ico|txt|xml|json|pdf|woff2?)$/i;
const EXCLUDED_PREFIXES = ["/admin", "/backend", "/_next", "/media"];

/**
 * - /            → redireciona para /pt ou /en (negociação por Accept-Language)
 * - /qualquer-coisa sem idioma → /pt/qualquer-coisa (mantendo path, query e hash)
 *   (apenas GET/HEAD; outros métodos passam sem reescrita para não partir nada)
 * - /admin, /backend (proxy da API), assets e _next ficam de fora.
 * - Persiste o idioma escolhido num cookie para os redirects seguintes.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    request.method !== "GET" && request.method !== "HEAD"
  ) {
    return NextResponse.next();
  }
  if (PUBLIC_FILE_RE.test(pathname)) return NextResponse.next();
  if (EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const first = pathname.split("/")[1] ?? "";
  const hasLang = (LOCALES as readonly string[]).includes(first);
  const requestLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  if (!hasLang) {
    const lang =
      (request.method === "GET" &&
        (LOCALES as readonly string[]).includes(first) &&
        first) ||
      (requestLocale && (LOCALES as readonly string[]).includes(requestLocale)
        ? requestLocale
        : negotiate(request.headers.get("accept-language")) ?? DEFAULT_LOCALE);

    const url = request.nextUrl.clone();
    url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    return response;
  }

  // Já tem idioma: garante o cookie de preferência + headers de varnish/CDN
  const url = request.nextUrl.clone();
  const response = NextResponse.next();
  if (url.pathname !== "/") {
    response.headers.set("x-nextjs-locale", first);
  }
  return response;
}

function negotiate(header: string | null): string | null {
  if (!header) return null;
  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.split("-")[0]?.toLowerCase() ?? "", q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of preferred) {
    if ((LOCALES as readonly string[]).includes(tag)) return tag;
  }
  return null;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
