"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/DeleteButton";
import { VypusknikForm } from "@/components/VypusknikForm";

export function VypusknikRow({
  sezonId,
  vypusknik,
  deleteAction,
}: {
  sezonId: string;
  vypusknik: { id: string; name: string; statusRightAfter: string | null; statusSixMonths: string | null };
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-gray-200 p-3">
        <VypusknikForm mode="edit" sezonId={sezonId} defaultValues={vypusknik} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-none">
      <div>
        <p className="text-sm font-medium text-[#1a1a1a]">{vypusknik.name}</p>
        {vypusknik.statusRightAfter && (
          <p className="text-sm text-gray-500">Сразу после Альфы: {vypusknik.statusRightAfter}</p>
        )}
        {vypusknik.statusSixMonths && (
          <p className="text-sm text-gray-500">Через полгода: {vypusknik.statusSixMonths}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg px-1.5 py-1 text-sm text-gray-400 transition-colors hover:text-gray-700"
        >
          Изменить
        </button>
        <DeleteButton
          action={deleteAction}
          confirmText={`Удалить выпускника «${vypusknik.name}»? Его можно будет восстановить в Корзине.`}
        />
      </div>
    </div>
  );
}
