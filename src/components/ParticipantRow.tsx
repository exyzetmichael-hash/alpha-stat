"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/DeleteButton";
import { UchastnikForm, type Role } from "@/components/UchastnikForm";
import { EditSwap } from "@/components/motion/EditSwap";
import { EditButton } from "@/components/motion/EditButton";

export function ParticipantRow({
  sezonId,
  stolikId,
  roles,
  participant,
  deleteAction,
}: {
  sezonId: string;
  stolikId: string | null;
  roles: Role[];
  participant: { id: string; name: string; roleNames: string[]; note: string | null };
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <EditSwap
      editing={editing}
      edit={
        <div className="rounded-xl border border-gray-200 p-3">
          <UchastnikForm
            mode="edit"
            sezonId={sezonId}
            stolikId={stolikId}
            roles={roles}
            defaultValues={participant}
            onDone={() => setEditing(false)}
          />
        </div>
      }
      view={
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-none">
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">
              {participant.name}{" "}
              {participant.roleNames.length > 0 && (
                <span className="font-normal text-gray-500">— {participant.roleNames.join(", ")}</span>
              )}
            </p>
            {participant.note && <p className="text-sm text-gray-500">{participant.note}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <EditButton onClick={() => setEditing(true)} />
            <DeleteButton
              action={deleteAction}
              confirmText={`Удалить участника «${participant.name}»? Его можно будет восстановить в Корзине.`}
            />
          </div>
        </div>
      }
    />
  );
}
