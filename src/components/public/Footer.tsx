import Link from "next/link";
import { Award, Mail, MapPin, Phone } from "lucide-react";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import type { UiStrings } from "@/lib/i18n/ui";

export interface SiteContacts {
  phone: string;
  email: string;
  address: string;
  hours: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
}

/** Rodapé do template — contactos vindos de /api/settings quando existirem. */
export default function Footer({ locale, ui, contacts }: { locale: Locale; ui: UiStrings; contacts: SiteContacts }) {
  // rótulos como no template original (sem ícones de marca na UI)
  const socials = [
    { key: "fb", label: "fb", href: contacts.facebook },
  ];

  return (
    <footer className="bg-[#850b0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/media/logo.png"
                alt="GPB Logo"
                className="w-10 h-10 rounded-lg object-contain"
                style={{ width: 280, height: 70 }}
              />
              {/* <span>
                <span className="block font-bold text-sm font-['Montserrat']">{ui.brandLine1}</span>
                <span className="block text-[#D4A843] text-xs">{ui.brandLine2}</span>
              </span> */}
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{ui.footer.aboutText}</p>
            <div className="mt-4 flex items-center gap-2">
              <Award size={16} className="text-[#D4A843]" aria-hidden="true" />
              <span className="text-xs text-[#D4A843] font-medium">{ui.footer.certificate}</span>
            </div>
          </div>

          <nav aria-label={ui.footer.quickLinks}>
            <h4 className="font-semibold text-[#D4A843] mb-4 font-['Montserrat']">{ui.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li><Link href={localizedHref(locale, "projects")} className="text-white/60 hover:text-[#D4A843] text-sm transition-colors">{ui.footer.links.allProjects}</Link></li>
              <li><Link href={localizedHref(locale, "about")} className="text-white/60 hover:text-[#D4A843] text-sm transition-colors">{ui.footer.links.about}</Link></li>
              <li><Link href={localizedHref(locale, "investor")} className="text-white/60 hover:text-[#D4A843] text-sm transition-colors">{ui.footer.links.opportunities}</Link></li>
              <li><Link href={localizedHref(locale, "contact")} className="text-white/60 hover:text-[#D4A843] text-sm transition-colors">{ui.footer.links.requestInfo}</Link></li>
            </ul>
          </nav>

          <div>
            <h4 className="font-semibold text-[#D4A843] mb-4 font-['Montserrat']">{ui.footer.contacts}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <Phone size={15} className="mt-0.5 text-[#D4A843] shrink-0" aria-hidden="true" />
                <a href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`} className="hover:text-[#D4A843] transition-colors">
                  {contacts.phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <Mail size={15} className="mt-0.5 text-[#D4A843] shrink-0" aria-hidden="true" />
                <a href={`mailto:${contacts.email}`} className="hover:text-[#D4A843] transition-colors">
                  {contacts.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <MapPin size={15} className="mt-0.5 text-[#D4A843] shrink-0" aria-hidden="true" />
                <span>{contacts.address}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#D4A843] mb-4 font-['Montserrat']">{ui.footer.social}</h4>
            <div className="flex gap-3 mb-5">
              {socials.map(({ key, label, href }) => (
                <a
                  key={key}
                  href={href && href.startsWith("http") ? href : "#"}
                  aria-label={key}
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-[#D4A843] rounded-lg flex items-center justify-center transition-colors group"
                >
                  <span className="text-white/70 group-hover:text-[#850b0b] text-xs font-bold uppercase">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>{ui.footer.rights.replace("{year}", String(new Date().getFullYear()))}</span>
          <span className="flex items-center gap-2 flex-wrap justify-center">
            <Link href={localizedHref(locale, "privacy")} className="hover:text-[#D4A843] transition-colors">
              {ui.footer.privacy}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href={localizedHref(locale, "privacy")} className="hover:text-[#D4A843] transition-colors">
              {ui.footer.terms}
            </Link>
            <span aria-hidden="true">·</span>
            <span>{ui.footer.accessibility}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
