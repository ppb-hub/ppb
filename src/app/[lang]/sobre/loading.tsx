import { Spinner } from "@/components/public/Skeletons";

export default function AboutLoading() {
  return (
    <div>
      <div className="bg-[#0F2B5B] py-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="skeleton h-3 w-40 mx-auto rounded bg-white/10" />
          <div className="skeleton h-9 w-3/4 mx-auto rounded bg-white/10" />
          <div className="skeleton h-4 w-2/3 mx-auto rounded bg-white/10" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <Spinner />
      </div>
    </div>
  );
}
