"use client";

import { useActionState, useRef } from "react";
import { createReklama, updateReklama } from "@/lib/actions/reklama";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { useDraftAutosave, clearDraft } from "@/lib/use-draft-autosave";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function ReklamaForm({
  mode,
  sezonId,
  defaultValues,
  onDone,
}: {
  mode: "create" | "edit";
  sezonId: string;
  defaultValues?: {
    id: string;
    date: Date;
    action: string;
    materialsNote: string | null;
    effectivenessNote: string | null;
  };
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const storageKey = mode === "create" ? `draft:reklama:create:${sezonId}` : `draft:reklama:edit:${defaultValues!.id}`;
  useDraftAutosave(storageKey, formRef);

  const action = mode === "create" ? createReklama : updateReklama;
  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await action(prevState, formData);
    if (!result) {
      if (mode === "create") formRef.current?.reset();
      clearDraft(storageKey);
      onDone?.();
    }
    return result;
  }, null);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="sezonId" value={sezonId} />
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Дата</label>
        <input
          type="date"
          name="date"
          defaultValue={defaultValues ? toDateInputValue(defaultValues.date) : ""}
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Что делали</label>
        <textarea
          name="action"
          defaultValue={defaultValues?.action ?? ""}
          rows={2}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Материалы (необязательно)</label>
        <input
          type="text"
          name="materialsNote"
          defaultValue={defaultValues?.materialsNote ?? ""}
          placeholder="Остались ли материалы — да/нет, ссылка, описание"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Оценка эффективности (необязательно)</label>
        <input
          type="text"
          name="effectivenessNote"
          defaultValue={defaultValues?.effectivenessNote ?? ""}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <FormError message={state?.error} />
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Сохраняю...">{mode === "create" ? "Добавить запись" : "Сохранить"}</SubmitButton>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
