"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/DeleteButton";
import { ReklamaForm } from "@/components/ReklamaForm";
import { formatDateRu } from "@/lib/format-date";

export function ReklamaRow({
  sezonId,
  zapis,
  deleteAction,
}: {
  sezonId: string;
  zapis: { id: string; date: Date; action: string; materialsNote: string | null; effectivenessNote: string | null };
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-gray-200 p-3">
        <ReklamaForm mode="edit" sezonId={sezonId} defaultValues={zapis} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-none">
      <div>
        <p className="text-sm font-medium text-[#1a1a1a]">{formatDateRu(zapis.date)}</p>
        <p className="text-sm text-gray-600">{zapis.action}</p>
        {zapis.materialsNote && <p className="text-sm text-gray-500">Материалы: {zapis.materialsNote}</p>}
        {zapis.effectivenessNote && <p className="text-sm text-gray-500">Эффективность: {zapis.effectivenessNote}</p>}
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
          confirmText="Удалить эту запись о рекламной кампании? Её можно будет восстановить в Корзине."
        />
      </div>
    </div>
  );
}
