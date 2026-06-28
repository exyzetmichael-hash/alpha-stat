"use client";

import { useActionState, useRef } from "react";
import { createSezon } from "@/lib/actions/sezon";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { useDraftAutosave, clearDraft } from "@/lib/use-draft-autosave";

export function CreateSezonForm({
  filialId,
  previousSeasons = [],
}: {
  filialId: string;
  previousSeasons?: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const storageKey = `draft:sezon:create:${filialId}`;
  useDraftAutosave(storageKey, formRef);
  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await createSezon(prevState, formData);
    if (!result) {
      formRef.current?.reset();
      clearDraft(storageKey);
    }
    return result;
  }, null);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="filialId" value={filialId} />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Название сезона</label>
        <input
          type="text"
          name="name"
          placeholder="Например, Альфа — Весна 2025"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Тема сезона (необязательно)</label>
        <input
          type="text"
          name="theme"
          placeholder="Например, «Почувствуй дыхание весны»"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Начало</label>
          <input
            type="date"
            name="startDate"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Окончание</label>
          <input
            type="date"
            name="endDate"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
        </div>
      </div>

      {previousSeasons.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Скопировать столики из сезона (необязательно)
          </label>
          <select
            name="copyFromSezonId"
            defaultValue=""
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          >
            <option value="">Не копировать</option>
            {previousSeasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <FormError message={state?.error} />
      <SubmitButton pendingLabel="Добавляю...">Добавить сезон</SubmitButton>
    </form>
  );
}
