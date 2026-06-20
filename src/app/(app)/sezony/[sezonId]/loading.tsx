function SectionSkeleton({ titleWidth = "w-32" }: { titleWidth?: string }) {
  return (
    <section className="space-y-3">
      <div className={`h-5 ${titleWidth} animate-pulse rounded bg-gray-200`} />
      <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
      </div>
    </section>
  );
}

export default function SezonDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />

      <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
      </div>

      <SectionSkeleton titleWidth="w-24" />
      <SectionSkeleton titleWidth="w-44" />
      <SectionSkeleton titleWidth="w-56" />
      <SectionSkeleton titleWidth="w-20" />
      <SectionSkeleton titleWidth="w-36" />
      <SectionSkeleton titleWidth="w-32" />
      <SectionSkeleton titleWidth="w-52" />
    </div>
  );
}
