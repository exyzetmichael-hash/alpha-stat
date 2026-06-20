export default function FilialDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />

      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
