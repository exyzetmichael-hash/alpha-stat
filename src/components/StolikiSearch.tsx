"use client";

import { useState } from "react";
import { StolikCard } from "@/components/StolikCard";
import { ParticipantRow } from "@/components/ParticipantRow";
import { ToggleSection } from "@/components/ToggleSection";
import { CreateStolikForm } from "@/components/CreateStolikForm";
import { UchastnikForm, type Role } from "@/components/UchastnikForm";

type Participant = { id: string; name: string; roleNames: string[]; note: string | null };
type StolikData = { id: string; name: string; uchastniki: Participant[] };

function matches(participant: Participant, query: string): boolean {
  if (!query) return true;
  return (
    participant.name.toLowerCase().includes(query) ||
    participant.roleNames.some((role) => role.toLowerCase().includes(query))
  );
}

export function StolikiSearch({
  sezonId,
  stoliki,
  komanda,
  stolikRoles,
  komandaRoles,
  deleteStolikActions,
  deleteParticipantActions,
}: {
  sezonId: string;
  stoliki: StolikData[];
  komanda: Participant[];
  stolikRoles: Role[];
  komandaRoles: Role[];
  deleteStolikActions: Record<string, () => Promise<void>>;
  deleteParticipantActions: Record<string, () => Promise<void>>;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const visibleStoliki = stoliki
    .map((stolik) => ({ ...stolik, uchastniki: stolik.uchastniki.filter((p) => matches(p, q)) }))
    .filter((stolik) => !isSearching || stolik.uchastniki.length > 0);
  const visibleKomanda = komanda.filter((p) => matches(p, q));

  return (
    <div className="space-y-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по имени или роли..."
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
      />

      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">За столиками</p>
        {visibleStoliki.map((stolik) => (
          <StolikCard
            key={stolik.id}
            sezonId={sezonId}
            stolik={stolik}
            participants={stolik.uchastniki}
            roles={stolikRoles}
            deleteStolikAction={deleteStolikActions[stolik.id]}
            deleteParticipantActions={deleteParticipantActions}
          />
        ))}
        {visibleStoliki.length === 0 && (
          <p className="text-sm text-gray-500">{isSearching ? "Ничего не найдено." : "Столиков пока нет."}</p>
        )}
        <ToggleSection closedLabel="+ Добавить столик">
          <CreateStolikForm sezonId={sezonId} />
        </ToggleSection>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Команда вне столиков</p>
        <p className="text-sm text-gray-500">Медиа, кухня, дети, молитва, музыкальное сопровождение и другие роли.</p>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            {visibleKomanda.map((participant) => (
              <ParticipantRow
                key={participant.id}
                sezonId={sezonId}
                stolikId={null}
                roles={komandaRoles}
                participant={participant}
                deleteAction={deleteParticipantActions[participant.id]}
              />
            ))}
            {visibleKomanda.length === 0 && (
              <p className="py-1 text-sm text-gray-500">{isSearching ? "Ничего не найдено." : "Пока никого нет."}</p>
            )}
          </div>
        </div>
        <ToggleSection closedLabel="+ Добавить участника">
          <UchastnikForm mode="create" sezonId={sezonId} stolikId={null} roles={komandaRoles} />
        </ToggleSection>
      </section>
    </div>
  );
}
