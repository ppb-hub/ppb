"use client";

import { useEffect, useRef, useState } from "react";
import { apiIcon } from "@/lib/icons";
import { parseCount } from "@/lib/format";
import type { HomeStatOut } from "@/types/api";
import type { Locale } from "@/lib/i18n/config";
import { bi } from "@/lib/fields";

export default function StatCard({ stat, locale }: { stat: HomeStatOut; locale: Locale }) {
  const [statsActive, setStatsActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = bi(stat, "label", locale);
  const suffix = bi(stat, "suffix", locale);
  const target = parseCount(stat.value);
  const isNumeric = Number.isFinite(target);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!statsActive || !isNumeric) return;
    let start = 0;
    const step = target / (1800 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start * 10) / 10);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [statsActive, isNumeric, target]);

  const Icon = apiIcon(stat.icon);
  const decimal = !Number.isInteger(target) && Number.isFinite(target);
  const display = isNumeric
    ? count.toLocaleString(locale === "pt" ? "pt-AO" : "en-GB", {
        minimumFractionDigits: decimal ? 1 : 0,
        maximumFractionDigits: decimal ? 1 : 0,
      })
    : String(stat.value ?? "");

  return (
    <div
      ref={ref}
      className="bg-white dark:bg-[#850b0b]/40 rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-white/10 flex flex-col items-center text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-shadow"
    >
      <div className="w-14 h-14 bg-[#850b0b]/8 dark:bg-white/10 rounded-xl flex items-center justify-center mb-4">
        <Icon size={28} style={stat.color ? { color: stat.color } : undefined} className="text-[#D4A843]" aria-hidden="true" />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-[#850b0b] dark:text-white font-['Montserrat'] mb-1">
        {display}
        <br />
        {suffix ? <span className="text-base sm:text-lg font-semibold"> {suffix}</span> : null}
      </div>
      <div className="text-sm text-gray-500 dark:text-white/60">{label}</div>
    </div>
  );
}
