"use client";

import { useActionState, useState } from "react";
import { renameStolik } from "@/lib/actions/stolik";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { DeleteButton } from "@/components/DeleteButton";
import { ToggleSection } from "@/components/ToggleSection";
import { ParticipantRow } from "@/components/ParticipantRow";
import { UchastnikForm, type Role } from "@/components/UchastnikForm";
import { uchastnikiLabel } from "@/lib/plural";

type Participant = { id: string; name: string; roleNames: string[]; note: string | null };

// Короткое имя лидера для подписи столика: «Иван П.».
function shortLeaderName(participants: Participant[]): string | null {
  const leader = participants.find((p) => p.roleNames.includes("Лидер"));
  if (!leader) return null;
  const [first, second] = leader.name.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}

export function StolikCard({
  sezonId,
  stolik,
  participants,
  roles,
  deleteStolikAction,
  deleteParticipantActions,
}: {
  sezonId: string;
  stolik: { id: string; name: string };
  participants: Participant[];
  roles: Role[];
  deleteStolikAction: () => Promise<void>;
  deleteParticipantActions: Record<string, () => Promise<void>>;
}) {
  const [renaming, setRenaming] = useState(false);
  const leaderName = shortLeaderName(participants);
  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await renameStolik(prevState, formData);
    if (!result) setRenaming(false);
    return result;
  }, null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {renaming ? (
        <form action={formAction} className="mb-3 space-y-2">
          <input type="hidden" name="id" value={stolik.id} />
          <input type="hidden" name="sezonId" value={sezonId} />
          <input
            type="text"
            name="name"
            defaultValue={stolik.name}
            autoFocus
            className="w-full rounded-xl border border-gray-300 px-3 py-2 font-semibold focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
          <FormError message={state?.error} />
          <div className="flex gap-2">
            <SubmitButton pendingLabel="Сохраняю...">Сохранить</SubmitButton>
            <button
              type="button"
              onClick={() => setRenaming(false)}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-extrabold text-[#241A13]">{stolik.name}</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {uchastnikiLabel(participants.length)}
              {leaderName && ` · ${leaderName}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setRenaming(true)}
              className="rounded-lg px-1.5 py-1 text-sm text-gray-400 transition-colors hover:text-gray-700"
            >
              Переименовать
            </button>
            <DeleteButton
              action={deleteStolikAction}
              confirmText={`Удалить «${stolik.name}»? Его можно будет восстановить в Корзине.`}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {participants.map((participant) => (
          <ParticipantRow
            key={participant.id}
            sezonId={sezonId}
            stolikId={stolik.id}
            roles={roles}
            participant={participant}
            deleteAction={deleteParticipantActions[participant.id]}
          />
        ))}
        {participants.length === 0 && <p className="py-1 text-sm text-gray-500">Пока никого нет.</p>}
      </div>

      <div className="mt-3">
        <ToggleSection closedLabel="+ Добавить участника">
          <UchastnikForm mode="create" sezonId={sezonId} stolikId={stolik.id} roles={roles} />
        </ToggleSection>
      </div>
    </div>
  );
}
