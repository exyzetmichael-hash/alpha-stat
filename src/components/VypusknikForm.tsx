"use client";

import { useActionState, useRef } from "react";
import { createVypusknik, updateVypusknik } from "@/lib/actions/vypusknik";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { useDraftAutosave, clearDraft } from "@/lib/use-draft-autosave";
import { VYPUSKNIK_STATUSES } from "@/lib/vypusknik-statuses";

// Группа чекбоксов статусов. Помимо стандартного списка показываем уже
// сохранённые «нестандартные» значения (например, введённые до перехода
// на списки), чтобы их можно было снять, а не потерять молча.
function StatusCheckboxes({ name, label, selected }: { name: string; label: string; selected: string[] }) {
  const extras = selected.filter((s) => !VYPUSKNIK_STATUSES.includes(s as (typeof VYPUSKNIK_STATUSES)[number]));
  const options = [...VYPUSKNIK_STATUSES, ...extras];

  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-gray-700">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((status) => (
          <label
            key={status}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition-colors has-[:checked]:border-[#E63946] has-[:checked]:bg-[#E63946]/10 has-[:checked]:text-[#E63946]"
          >
            <input
              type="checkbox"
              name={name}
              value={status}
              defaultChecked={selected.includes(status)}
              className="h-3.5 w-3.5 accent-[#E63946]"
            />
            {status}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function VypusknikForm({
  mode,
  sezonId,
  defaultValues,
  onDone,
}: {
  mode: "create" | "edit";
  sezonId: string;
  defaultValues?: { id: string; name: string; statusRightAfter: string[]; statusSixMonths: string[] };
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const storageKey = mode === "create" ? `draft:vypusknik:create:${sezonId}` : `draft:vypusknik:edit:${defaultValues!.id}`;
  useDraftAutosave(storageKey, formRef);

  const action = mode === "create" ? createVypusknik : updateVypusknik;
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
        <label className="mb-1 block text-sm font-medium text-gray-700">Имя</label>
        <input
          type="text"
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="Имя выпускника"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <StatusCheckboxes
        name="statusRightAfter"
        label="Статус сразу после Альфы (можно несколько, необязательно)"
        selected={defaultValues?.statusRightAfter ?? []}
      />

      <StatusCheckboxes
        name="statusSixMonths"
        label="Статус через полгода (можно несколько, необязательно)"
        selected={defaultValues?.statusSixMonths ?? []}
      />

      <FormError message={state?.error} />
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Сохраняю...">{mode === "create" ? "Добавить выпускника" : "Сохранить"}</SubmitButton>
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
