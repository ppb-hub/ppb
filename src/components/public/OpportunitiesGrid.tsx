// src/components/public/OpportunitiesGrid.tsx
"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { ApiIcon } from "@/lib/icons";
import { bi } from "@/lib/fields";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import type { UiStrings } from "@/lib/i18n/ui";
import type { InvestorOpportunityOut } from "@/types/api";
import { cx } from "@/lib/format";

interface OpportunitiesGridProps {
  locale: Locale;
  ui: UiStrings;
  opportunities: InvestorOpportunityOut[];
}

export default function OpportunitiesGrid({
  locale,
  ui,
  opportunities,
}: OpportunitiesGridProps) {
  if (!opportunities.length) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-white/40">
        <p className="text-lg">{ui.investor.noOpportunities || "Nenhuma oportunidade disponível no momento."}</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {opportunities.map((op) => (
        <div
          key={op.id}
          className="group bg-white dark:bg-[#850b0b]/30 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1"
          style={{ borderColor: op.color ? `${op.color}55` : undefined }}
        >
          {/* Header com ícone */}
          <div className="relative h-32 bg-gradient-to-br from-[#850b0b] to-[#1a3d6e] flex items-center justify-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ApiIcon name={op.icon} size={32} className="text-[#D4A843]" />
            </div>
            <div className="absolute top-3 left-3">
              <span className="bg-[#D4A843] text-[#850b0b] text-xs font-bold px-2.5 py-1 rounded-full">
                {ui.investor.opportunityBadge || "Oportunidade"}
              </span>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-5">
            {op.type && (
              <span className="text-xs bg-[#850b0b]/8 dark:bg-white/10 text-[#850b0b] dark:text-white/70 px-2.5 py-1 rounded-full mb-2 inline-block">
                {op.type}
              </span>
            )}
            <h3 className="font-bold text-[#850b0b] dark:text-white font-['Montserrat'] text-base leading-snug mb-2 line-clamp-2">
              {bi(op, "area", locale)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed mb-4 line-clamp-3">
              {bi(op, "description", locale)}
            </p>

            <Link
              href={`${localizedHref(locale, "contact")}?interesse=investidor&oportunidade=${op.id}`}
              className="flex items-center justify-center gap-2 w-full bg-[#850b0b] hover:bg-[#E8821A] text-white text-sm font-medium py-2.5 rounded-xl transition-colors duration-200"
            >
              {ui.investor.requestStudy} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}