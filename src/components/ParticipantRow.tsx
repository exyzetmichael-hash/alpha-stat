"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/DeleteButton";
import { UchastnikForm, type Role } from "@/components/UchastnikForm";
import { Avatar } from "@/components/Avatar";
import { RoleBadge } from "@/components/RoleBadge";
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
        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
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
        <div className="flex items-start gap-3 py-2">
          <Avatar name={participant.name} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#241A13]">{participant.name}</p>
            {participant.roleNames.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {participant.roleNames.map((role) => (
                  <RoleBadge key={role} name={role} />
                ))}
              </div>
            )}
            {participant.note && <p className="mt-1 text-sm text-gray-500">{participant.note}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
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
