"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/DeleteButton";
import { VehaForm } from "@/components/VehaForm";
import { formatDateRu } from "@/lib/format-date";

export function VehaRow({
  sezonId,
  veha,
  deleteAction,
}: {
  sezonId: string;
  veha: { id: string; name: string; date: Date; participantCount: number | null; note: string | null };
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-gray-200 p-3">
        <VehaForm mode="edit" sezonId={sezonId} defaultValues={veha} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-none">
      <div>
        <p className="text-sm font-medium text-[#1a1a1a]">
          {veha.name} <span className="font-normal text-gray-500">— {formatDateRu(veha.date)}</span>
        </p>
        {veha.participantCount !== null && (
          <p className="text-sm text-gray-500">Участников: {veha.participantCount}</p>
        )}
        {veha.note && <p className="text-sm text-gray-500">{veha.note}</p>}
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
          confirmText={`Удалить событие «${veha.name}»? Его можно будет восстановить в Корзине.`}
        />
      </div>
    </div>
  );
}
