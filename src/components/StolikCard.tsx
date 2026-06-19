"use client";

import { useActionState, useState } from "react";
import { renameStolik } from "@/lib/actions/stolik";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { DeleteButton } from "@/components/DeleteButton";
import { ToggleSection } from "@/components/ToggleSection";
import { ParticipantRow } from "@/components/ParticipantRow";
import { UchastnikForm } from "@/components/UchastnikForm";

type Participant = { id: string; name: string; roleName: string; note: string | null };

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
  roles: string[];
  deleteStolikAction: () => Promise<void>;
  deleteParticipantActions: Record<string, () => Promise<void>>;
}) {
  const [renaming, setRenaming] = useState(false);
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
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#1a1a1a]">{stolik.name}</h3>
          <div className="flex items-center gap-3">
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

      <div>
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
