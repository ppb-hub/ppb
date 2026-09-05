"use client";

import { useEffect, useRef, useState } from "react";
import { progressColorClass } from "@/lib/format";

/** Barra animada ao entrar no viewport — comportamento do template. */
export default function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress || 0)));
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWidth(clamped);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [clamped]);

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden"
    >
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColorClass(clamped)}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
