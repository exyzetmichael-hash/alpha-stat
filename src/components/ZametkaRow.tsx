"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/DeleteButton";
import { ZametkaForm } from "@/components/ZametkaForm";

export function ZametkaRow({
  sezonId,
  zametka,
  deleteAction,
}: {
  sezonId: string;
  zametka: { id: string; details: string | null; idea: string | null };
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-gray-200 p-3">
        <ZametkaForm mode="edit" sezonId={sezonId} defaultValues={zametka} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-none">
      <div>
        {zametka.details && <p className="text-sm font-medium text-[#1a1a1a]">{zametka.details}</p>}
        {zametka.idea && <p className="text-sm text-gray-500">{zametka.idea}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-gray-400 hover:text-gray-700"
        >
          Изменить
        </button>
        <DeleteButton
          action={deleteAction}
          confirmText="Удалить эту заметку? Её можно будет восстановить в Корзине."
        />
      </div>
    </div>
  );
}
