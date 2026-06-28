import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: qRaw } = await searchParams;
  const q = (qRaw ?? "").trim();

  const matches = q
    ? await prisma.uchastnik.findMany({
        where: { deletedAt: null, name: { contains: q, mode: "insensitive" } },
        include: { sezon: { include: { filial: true } }, stolik: true },
        orderBy: { name: "asc" },
      })
    : [];

  const groups = new Map<string, typeof matches>();
  for (const m of matches) {
    const key = m.name.trim().toLowerCase();
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-[#241A13]">Поиск участника</h1>
      <p className="text-sm text-gray-500">
        Ищет среди участников во всех филиалах и сезонах — например, чтобы увидеть, где человек участвовал раньше.
      </p>

      <form action="/search" method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Имя участника..."
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#E63946] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#d12e3a]"
        >
          Найти
        </button>
      </form>

      {q && groups.size === 0 && <p className="text-sm text-gray-500">Никого не найдено.</p>}

      <div className="space-y-4">
        {Array.from(groups.values()).map((entries) => (
          <div key={entries[0].id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-bold text-[#241A13]">{entries[0].name}</p>
            <ul className="mt-2 space-y-1.5">
              {entries.map((entry) => (
                <li key={entry.id} className="text-sm text-gray-600">
                  <Link href={`/sezony/${entry.sezonId}`} className="font-medium text-[#E63946] hover:underline">
                    {entry.sezon.filial.name} · {entry.sezon.name}
                  </Link>
                  {" — "}
                  {entry.roleNames.join(", ")}
                  {entry.stolik && ` (${entry.stolik.name})`}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
