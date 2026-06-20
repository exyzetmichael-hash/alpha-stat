export default function FilialsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
          >
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
