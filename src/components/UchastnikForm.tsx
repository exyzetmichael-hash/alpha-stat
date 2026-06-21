"use client";

import { useActionState, useRef, useState } from "react";
import { createUchastnik, updateUchastnik } from "@/lib/actions/uchastnik";
import { deleteRol } from "@/lib/actions/rol";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { CheckPill } from "@/components/CheckPill";
import { useDraftAutosave, clearDraft } from "@/lib/use-draft-autosave";

// Роль участника: стандартные роли (из seed.ts) удалить нельзя, а добавленные
// лидером — можно прямо здесь, в поле выбора роли. У участника может быть
// несколько ролей — поэтому выбор через чекбоксы.
export type Role = { id: string; name: string; isStandard: boolean };

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
  defaultValues?: { id: string; name: string; roleNames: string[]; note: string | null };
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  // Роли, которые лидер ввёл прямо сейчас и которых ещё нет в справочнике:
  // показываем их как отмеченные чекбоксы, а на сохранении действие заведёт их.
  const knownNames = roles.map((r) => r.name);
  const [addedRoles, setAddedRoles] = useState<string[]>(
    () => (defaultValues?.roleNames ?? []).filter((name) => !knownNames.includes(name))
  );
  const [customInput, setCustomInput] = useState("");
  const storageKey =
    mode === "create" ? `draft:uchastnik:create:${sezonId}:${stolikId ?? "none"}` : `draft:uchastnik:edit:${defaultValues!.id}`;
  useDraftAutosave(storageKey, formRef);

  const action = mode === "create" ? createUchastnik : updateUchastnik;
  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await action(prevState, formData);
    if (!result) {
      if (mode === "create") {
        formRef.current?.reset();
        setAddedRoles([]);
        setCustomInput("");
      }
      clearDraft(storageKey);
      onDone?.();
    }
    return result;
  }, null);

  // Роли, добавленные лидером, — их можно удалить (стандартные защищены).
  const deletableRoles = roles.filter((r) => !r.isStandard);
  const selectedNames = new Set(defaultValues?.roleNames ?? []);

  async function handleDeleteRole(role: Role) {
    if (!confirm(`Удалить роль «${role.name}»? Она пропадёт из списка у всех участников во всех сезонах.`)) return;
    setDeletingRoleId(role.id);
    await deleteRol(role.id);
    setDeletingRoleId(null);
  }

  function handleAddCustomRole() {
    const name = customInput.trim();
    if (!name) return;
    const exists =
      knownNames.some((n) => n.toLowerCase() === name.toLowerCase()) ||
      addedRoles.some((n) => n.toLowerCase() === name.toLowerCase());
    if (!exists) setAddedRoles((prev) => [...prev, name]);
    setCustomInput("");
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

      <fieldset className="min-w-0">
        <legend className="mb-2 block text-sm font-medium text-gray-700">Роли (можно несколько)</legend>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <CheckPill key={role.id} name="roleNames" value={role.name} defaultChecked={selectedNames.has(role.name)}>
              {role.name}
            </CheckPill>
          ))}
          {addedRoles.map((name) => (
            <CheckPill key={`added:${name}`} name="roleNames" value={name} defaultChecked>
              {name}
            </CheckPill>
          ))}
        </div>

        <div className="mt-2.5 flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomRole();
              }
            }}
            placeholder="Своя роль…"
            aria-label="Добавить свою роль"
            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
          <button
            type="button"
            onClick={handleAddCustomRole}
            disabled={!customInput.trim()}
            className="shrink-0 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Добавить
          </button>
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Новая роль появится в списке для всех участников.</p>

        {deletableRoles.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="mb-1.5 text-xs text-gray-400">Добавленные роли — нажмите ×, чтобы удалить у всех:</p>
            <div className="flex flex-wrap gap-1.5">
              {deletableRoles.map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 py-1 pl-2.5 pr-1.5 text-xs text-gray-600"
                >
                  {role.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteRole(role)}
                    disabled={deletingRoleId === role.id}
                    aria-label={`Удалить роль ${role.name}`}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </fieldset>

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
