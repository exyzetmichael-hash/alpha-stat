"use client";

import { useActionState, useRef, useState } from "react";
import { createVeha, updateVeha } from "@/lib/actions/veha";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";

const STANDARD_VEHA_NAMES = ["Вечеринка (открытие сезона)", "Выезд", "Выпускной", "Богослужение/служение"];
const CUSTOM_VEHA_SENTINEL = "__custom__";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function VehaForm({
  mode,
  sezonId,
  defaultValues,
  onDone,
}: {
  mode: "create" | "edit";
  sezonId: string;
  defaultValues?: { id: string; name: string; date: Date; participantCount: number | null; note: string | null };
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const defaultNameIsCustom = defaultValues ? !STANDARD_VEHA_NAMES.includes(defaultValues.name) : false;
  const [showCustomName, setShowCustomName] = useState(defaultNameIsCustom);

  const action = mode === "create" ? createVeha : updateVeha;
  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await action(prevState, formData);
    if (!result) {
      if (mode === "create") formRef.current?.reset();
      onDone?.();
    }
    return result;
  }, null);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="sezonId" value={sezonId} />
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Событие</label>
        <select
          name="nameSelect"
          defaultValue={defaultNameIsCustom ? CUSTOM_VEHA_SENTINEL : defaultValues?.name ?? ""}
          onChange={(e) => setShowCustomName(e.target.value === CUSTOM_VEHA_SENTINEL)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        >
          <option value="" disabled>
            Выберите событие
          </option>
          {STANDARD_VEHA_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value={CUSTOM_VEHA_SENTINEL}>Другое...</option>
        </select>
        {showCustomName && (
          <input
            type="text"
            name="nameCustom"
            defaultValue={defaultNameIsCustom ? defaultValues?.name : ""}
            placeholder="Впишите название события"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
        )}
      </div>

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
        <label className="mb-1 block text-sm font-medium text-gray-700">Число участников (если известно)</label>
        <input
          type="number"
          name="participantCount"
          min={0}
          defaultValue={defaultValues?.participantCount ?? ""}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Примечание (необязательно)</label>
        <textarea
          name="note"
          defaultValue={defaultValues?.note ?? ""}
          rows={2}
          placeholder="Например: сертификаты / подарки / присутствовали"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <FormError message={state?.error} />
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Сохраняю...">{mode === "create" ? "Добавить событие" : "Сохранить"}</SubmitButton>
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
