"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Search, Sun, X, Languages } from "lucide-react";
import { LOCALES, localizedHref, switchLocalePath, type Locale } from "@/lib/i18n/config";
import type { UiStrings } from "@/lib/i18n/ui";

/** Cabeçalho fixo do template: nav, pesquisa de projectos, idioma, tema, menu mobile. */
export default function Header({ locale, ui }: { locale: Locale; ui: UiStrings }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false), [pathname]
    setTheme('light')
  });

  const navLinks = [
    { key: "home" as const, label: ui.nav.home },
    { key: "projects" as const, label: ui.nav.projects },
    { key: "about" as const, label: ui.nav.about },
    { key: "investor" as const, label: ui.nav.investor },
    { key: "contact" as const, label: ui.nav.contact },
  ];

  const isActive = (href: string) =>
    href === localizedHref(locale, "home") ? pathname === href : pathname.startsWith(href);

  const other = locale === "pt" ? "en" : "pt";
  const isDark = resolvedTheme === "dark";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${scrolled ? "shadow-lg" : "shadow-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-[4.5rem]">
          {/* Logo */}
          <Link href={localizedHref(locale, "home")} className="flex items-center gap-3 shrink-0">
            <img
              src="/media/logo_gov.png"
              alt="GPB Logo"
              className="w-10 h-10 rounded-lg object-contain"
              style={{width: 280, height: 70}}
            />
            {/* <span className="hidden sm:block">
              <span className="block text-[#850b0b] font-bold text-sm leading-tight font-['Montserrat']">
                {ui.brandLine1}
              </span>
              <span className="block text-[#D4A843] text-xs font-medium">{ui.brandLine2}</span>
            </span>
            <span className="sr-only">{ui.brandLine1} {ui.brandLine2}</span> */}
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const href = localizedHref(locale, link.key);
              return (
                <Link
                  key={link.key}
                  href={href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive(href)
                      ? "text-[#850b0b]"
                      : "text-[#000]/80 hover:text-[#850b0b]"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              {searchOpen && (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`${localizedHref(locale, "projects")}?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchOpen(false);
                    }
                  }}
                  placeholder={ui.search.placeholder}
                  aria-label={ui.search.aria}
                  className="absolute right-10 top-1/2 -translate-y-1/2 w-56 bg-[#F3F4F6] border border-[#D4A843]/30 text-[#850b0b] placeholder-[#850b0b]/50 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#D4A843]"
                />
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={ui.search.aria}
                aria-expanded={searchOpen}
                className="p-2 text-[#000]/80 hover:text-[#850b0b] hover:bg-[#D4A843]/10 rounded-md transition-colors"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Idioma — mantém o caminho atual */}
            <Link
              href={switchLocalePath(pathname, other as Locale)}
              aria-label={other === "en" ? "English" : "Português"}
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-2 text-[#000]/80 hover:text-[#850b0b] hover:bg-[#D4A843]/10 rounded-md transition-colors text-xs font-semibold uppercase"
            >
              <Languages size={16} />
              {other}
            </Link>

            {/* <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? ui.theme.toLight : ui.theme.toDark}
              className="p-2 text-[#850b0b]/80 hover:text-[#850b0b] hover:bg-[#D4A843]/10 rounded-md transition-colors"
              suppressHydrationWarning
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button> */}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-[#850b0b]/80 hover:text-[#850b0b]"
              aria-label={menuOpen ? ui.menu.close : ui.menu.open}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <nav aria-label="Mobile" className="bg-white border-t border-[#D4A843]/20 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => {
            const href = localizedHref(locale, link.key);
            return (
              <Link
                key={link.key}
                href={href}
                className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive(href)
                    ? "bg-[#D4A843] text-[#850b0b]"
                    : "text-[#850b0b]/80 hover:text-[#850b0b] hover:bg-[#D4A843]/10"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={switchLocalePath(pathname, other as Locale)}
            className="px-4 py-2.5 rounded-md text-sm font-medium text-[#D4A843] hover:bg-[#D4A843]/10 flex items-center gap-2"
          >
            <Languages size={15} /> {other === "en" ? "English" : "Português"}
          </Link>
        </nav>
      </div>
    </header>
  );
}