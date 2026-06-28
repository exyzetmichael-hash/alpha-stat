"use client";

import { useState } from "react";
import { VypusknikRow } from "@/components/VypusknikRow";
import { ToggleSection } from "@/components/ToggleSection";
import { VypusknikForm } from "@/components/VypusknikForm";

type Vypusknik = { id: string; name: string; statusRightAfter: string[]; statusSixMonths: string[] };

function matches(vypusknik: Vypusknik, query: string): boolean {
  if (!query) return true;
  return (
    vypusknik.name.toLowerCase().includes(query) ||
    vypusknik.statusRightAfter.some((s) => s.toLowerCase().includes(query)) ||
    vypusknik.statusSixMonths.some((s) => s.toLowerCase().includes(query))
  );
}

export function VypuskniySearch({
  sezonId,
  vypuskniki,
  deleteActions,
}: {
  sezonId: string;
  vypuskniki: Vypusknik[];
  deleteActions: Record<string, () => Promise<void>>;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;
  const visible = vypuskniki.filter((v) => matches(v, q));

  return (
    <section className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по имени или статусу..."
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {visible.map((vypusknik) => (
          <VypusknikRow
            key={vypusknik.id}
            sezonId={sezonId}
            vypusknik={vypusknik}
            deleteAction={deleteActions[vypusknik.id]}
          />
        ))}
        {visible.length === 0 && (
          <p className="py-1 text-sm text-gray-500">{isSearching ? "Ничего не найдено." : "Выпускников пока нет."}</p>
        )}
      </div>
      <ToggleSection closedLabel="+ Добавить выпускника">
        <VypusknikForm mode="create" sezonId={sezonId} />
      </ToggleSection>
    </section>
  );
}
