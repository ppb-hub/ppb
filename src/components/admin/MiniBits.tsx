"use client";

import { progressColorClass } from "@/lib/format";

export function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress || 0)));
  return (
    <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden" title={`${clamped}%`}>
      <div className={`h-full rounded-full ${progressColorClass(clamped)}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
