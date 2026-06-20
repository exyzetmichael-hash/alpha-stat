"use client";

import { useActionState, useRef, useState } from "react";
import { createBudjetZapis, updateBudjetZapis } from "@/lib/actions/budjet";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { useDraftAutosave, clearDraft } from "@/lib/use-draft-autosave";

const CUSTOM_CATEGORY_SENTINEL = "__custom__";

export function BudjetForm({
  mode,
  sezonId,
  tip,
  categories,
  defaultValues,
  onDone,
}: {
  mode: "create" | "edit";
  sezonId: string;
  tip: "RASHOD" | "DOHOD";
  categories: string[];
  defaultValues?: { id: string; categoryName: string; amount: number; comment: string | null };
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const defaultCategoryIsCustom = defaultValues ? !categories.includes(defaultValues.categoryName) : false;
  const [showCustomCategory, setShowCustomCategory] = useState(defaultCategoryIsCustom);
  const storageKey = mode === "create" ? `draft:budjet:create:${sezonId}:${tip}` : `draft:budjet:edit:${defaultValues!.id}`;
  useDraftAutosave(storageKey, formRef);

  const action = mode === "create" ? createBudjetZapis : updateBudjetZapis;
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
      <input type="hidden" name="tip" value={tip} />
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Категория</label>
        <select
          name="categorySelect"
          defaultValue={defaultCategoryIsCustom ? CUSTOM_CATEGORY_SENTINEL : defaultValues?.categoryName ?? ""}
          onChange={(e) => setShowCustomCategory(e.target.value === CUSTOM_CATEGORY_SENTINEL)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        >
          <option value="" disabled>
            Выберите категорию
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          <option value={CUSTOM_CATEGORY_SENTINEL}>Другое...</option>
        </select>
        {showCustomCategory && (
          <input
            type="text"
            name="categoryCustom"
            defaultValue={defaultCategoryIsCustom ? defaultValues?.categoryName : ""}
            placeholder="Впишите категорию"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Сумма, ₽</label>
        <input
          type="number"
          name="amount"
          min={0}
          step={1}
          defaultValue={defaultValues?.amount ?? ""}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Комментарий (необязательно)</label>
        <input
          type="text"
          name="comment"
          defaultValue={defaultValues?.comment ?? ""}
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
