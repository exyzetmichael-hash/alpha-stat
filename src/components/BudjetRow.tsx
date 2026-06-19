"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/DeleteButton";
import { BudjetForm } from "@/components/BudjetForm";

export function BudjetRow({
  sezonId,
  tip,
  categories,
  zapis,
  deleteAction,
}: {
  sezonId: string;
  tip: "RASHOD" | "DOHOD";
  categories: string[];
  zapis: { id: string; categoryName: string; amount: number; comment: string | null };
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-gray-200 p-3">
        <BudjetForm
          mode="edit"
          sezonId={sezonId}
          tip={tip}
          categories={categories}
          defaultValues={zapis}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-none">
      <div>
        <p className="text-sm font-medium text-[#1a1a1a]">
          {zapis.categoryName} <span className="font-normal text-gray-500">— {zapis.amount.toLocaleString("ru-RU")} ₽</span>
        </p>
        {zapis.comment && <p className="text-sm text-gray-500">{zapis.comment}</p>}
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
          confirmText={`Удалить запись «${zapis.categoryName}»? Её можно будет восстановить в Корзине.`}
        />
      </div>
    </div>
  );
}
