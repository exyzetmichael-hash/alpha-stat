"use client";

import { useActionState, useRef, useState } from "react";
import { createUchastnik, updateUchastnik } from "@/lib/actions/uchastnik";
import { deleteRol } from "@/lib/actions/rol";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { useDraftAutosave, clearDraft } from "@/lib/use-draft-autosave";

// Роль участника: стандартные роли (из seed.ts) удалить нельзя, а добавленные
// лидером — можно прямо здесь, в поле выбора роли.
export type Role = { id: string; name: string; isStandard: boolean };

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
  roles: Role[];
  defaultValues?: { id: string; name: string; roleName: string; note: string | null };
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const defaultRoleIsCustom = defaultValues ? !roles.some((r) => r.name === defaultValues.roleName) : false;
  const [showCustomRole, setShowCustomRole] = useState(defaultRoleIsCustom);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
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

  // Роли, добавленные лидером, — их можно удалить (стандартные защищены).
  const deletableRoles = roles.filter((r) => !r.isStandard);

  async function handleDeleteRole(role: Role) {
    if (!confirm(`Удалить роль «${role.name}»? Она пропадёт из списка у всех участников во всех сезонах.`)) return;
    setDeletingRoleId(role.id);
    await deleteRol(role.id);
    setDeletingRoleId(null);
  }

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
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
          <option value={CUSTOM_ROLE_SENTINEL}>Другое...</option>
        </select>
        {showCustomRole && (
          <input
            type="text"
            name="roleCustom"
            defaultValue={defaultRoleIsCustom ? defaultValues?.roleName : ""}
            placeholder="Впишите роль — она добавится в список для всех"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
        )}

        {deletableRoles.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-xs text-gray-400">Добавленные роли (нажмите ×, чтобы удалить у всех):</p>
            <div className="flex flex-wrap gap-1.5">
              {deletableRoles.map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
                >
                  {role.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteRole(role)}
                    disabled={deletingRoleId === role.id}
                    aria-label={`Удалить роль ${role.name}`}
                    className="text-gray-400 transition-colors hover:text-red-600 disabled:opacity-50"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
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
