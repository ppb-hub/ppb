import { ProjectGridSkeleton, Spinner } from "@/components/public/Skeletons";

export default function ProjectsLoading() {
  return (
    <div className="bg-white dark:bg-[#0a1628]">
      <div className="bg-[#0F2B5B] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="skeleton h-3 w-40 rounded bg-white/10" />
          <div className="skeleton h-8 w-64 rounded bg-white/10" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-3 mb-6">
          <div className="skeleton h-12 flex-1" />
          <div className="skeleton h-12 w-28 hidden sm:block" />
          <div className="skeleton h-12 w-40 hidden sm:block" />
        </div>
        <ProjectGridSkeleton count={6} />
        <Spinner />
      </div>
    </div>
  );
}
