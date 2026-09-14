import { FeatureSlideSkeleton, StatCardSkeleton, Spinner } from "@/components/public/Skeletons";

export default function HomeLoading() {
  return (
    <div>
      <section className="py-16 bg-[#F8F9FA] dark:bg-[#850b0b]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="skeleton h-8 w-64 mx-auto mb-10" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-white dark:bg-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="skeleton h-8 w-56 mb-10" />
          <FeatureSlideSkeleton />
        </div>
      </section>
      <section className="py-16 bg-[#F8F9FA] dark:bg-[#850b0b]/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="skeleton h-8 w-48 mb-8" />
          <Spinner />
        </div>
      </section>
    </div>
  );
}
