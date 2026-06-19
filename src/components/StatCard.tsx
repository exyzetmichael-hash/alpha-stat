export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white px-4 py-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-[#E63946]">{value}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}
