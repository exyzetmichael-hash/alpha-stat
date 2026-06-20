function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="h-7 w-16 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />
      <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <StatCardSkeleton />
        </div>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}
