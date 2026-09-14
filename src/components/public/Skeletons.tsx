/** Skeletons que imitam o layout real (nada "congelado" à espera da API). */

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#850b0b]/30 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
      <div className="h-48 skeleton" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-2.5 w-full rounded-full" />
        <div className="skeleton h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label="A carregar projectos">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="bg-white dark:bg-[#850b0b]/30 border border-gray-100 dark:border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className="w-20 h-14 skeleton rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
      <div className="hidden sm:block w-24 skeleton h-2 rounded-full" />
    </div>
  );
}

export function FeatureSlideSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-0 bg-white dark:bg-[#850b0b]/30 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
      <div className="h-64 md:h-auto skeleton" />
      <div className="p-8 space-y-4">
        <div className="skeleton h-5 w-24 rounded-full" />
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-2 w-full rounded-full" />
        <div className="skeleton h-10 w-40 rounded-xl" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#850b0b]/40 rounded-2xl p-6 border border-gray-100 dark:border-white/10 flex flex-col items-center gap-3">
      <div className="w-14 h-14 skeleton rounded-xl" />
      <div className="skeleton h-8 w-24" />
      <div className="skeleton h-3 w-32" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8 min-w-0">
          <div className="skeleton aspect-video w-full rounded-2xl" />
          <div className="space-y-3">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-11/12" />
            <div className="skeleton h-4 w-3/4" />
          </div>
          <div className="space-y-3">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-12 w-full rounded-2xl" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-gray-400 dark:text-white/40">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
}
