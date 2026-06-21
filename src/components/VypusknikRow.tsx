"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/DeleteButton";
import { VypusknikForm } from "@/components/VypusknikForm";
import { EditSwap } from "@/components/motion/EditSwap";
import { EditButton } from "@/components/motion/EditButton";

export function VypusknikRow({
  sezonId,
  vypusknik,
  deleteAction,
}: {
  sezonId: string;
  vypusknik: { id: string; name: string; statusRightAfter: string[]; statusSixMonths: string[] };
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <EditSwap
      editing={editing}
      edit={
        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
          <VypusknikForm mode="edit" sezonId={sezonId} defaultValues={vypusknik} onDone={() => setEditing(false)} />
        </div>
      }
      view={
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-none">
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">{vypusknik.name}</p>
            {vypusknik.statusRightAfter.length > 0 && (
              <p className="text-sm text-gray-500">Сразу после Альфы: {vypusknik.statusRightAfter.join(", ")}</p>
            )}
            {vypusknik.statusSixMonths.length > 0 && (
              <p className="text-sm text-gray-500">Через полгода: {vypusknik.statusSixMonths.join(", ")}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <EditButton onClick={() => setEditing(true)} />
            <DeleteButton
              action={deleteAction}
              confirmText={`Удалить выпускника «${vypusknik.name}»? Его можно будет восстановить в Корзине.`}
            />
          </div>
        </div>
      }
    />
  );
}
