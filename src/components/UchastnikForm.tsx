"use client";

import { useActionState, useRef, useState } from "react";
import { createUchastnik, updateUchastnik } from "@/lib/actions/uchastnik";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { useDraftAutosave, clearDraft } from "@/lib/use-draft-autosave";

const CUSTOM_ROLE_SENTINEL = "__custom__";

export function UchastnikForm({
  mode,
  sezonId,
  stolikId,
  roles,
  defaultValues,
  onDone,
}: {
  mode: "create" | "edit";
  sezonId: string;
  stolikId: string | null;
  roles: string[];
  defaultValues?: { id: string; name: string; roleName: string; note: string | null };
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const defaultRoleIsCustom = defaultValues ? !roles.includes(defaultValues.roleName) : false;
  const [showCustomRole, setShowCustomRole] = useState(defaultRoleIsCustom);
  const storageKey =
    mode === "create" ? `draft:uchastnik:create:${sezonId}:${stolikId ?? "none"}` : `draft:uchastnik:edit:${defaultValues!.id}`;
  useDraftAutosave(storageKey, formRef);

  const action = mode === "create" ? createUchastnik : updateUchastnik;
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
      <input type="hidden" name="stolikId" value={stolikId ?? ""} />
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Имя</label>
        <input
          type="text"
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="Имя участника"
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Роль</label>
        <select
          name="roleSelect"
          defaultValue={defaultRoleIsCustom ? CUSTOM_ROLE_SENTINEL : defaultValues?.roleName ?? ""}
          onChange={(e) => setShowCustomRole(e.target.value === CUSTOM_ROLE_SENTINEL)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        >
          <option value="" disabled>
            Выберите роль
          </option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
          <option value={CUSTOM_ROLE_SENTINEL}>Другое...</option>
        </select>
        {showCustomRole && (
          <input
            type="text"
            name="roleCustom"
            defaultValue={defaultRoleIsCustom ? defaultValues?.roleName : ""}
            placeholder="Впишите роль"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Примечание (необязательно)</label>
        <textarea
          name="note"
          defaultValue={defaultValues?.note ?? ""}
          rows={2}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <FormError message={state?.error} />
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Сохраняю...">
          {mode === "create" ? "Добавить участника" : "Сохранить"}
        </SubmitButton>
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
