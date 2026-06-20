export default function TrashLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-200" />
      <div className="h-4 w-full max-w-md animate-pulse rounded bg-gray-100" />

      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <div className="space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
