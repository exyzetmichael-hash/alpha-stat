"use client";

import { useActionState, useState } from "react";
import { renameFilial, type ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { EditSwap } from "@/components/motion/EditSwap";
import { EditButton } from "@/components/motion/EditButton";

export function FilialNameEditor({ id, name }: { id: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await renameFilial(prevState, formData);
    if (!result) setEditing(false);
    return result;
  }, null);

  return (
    <EditSwap
      editing={editing}
      view={
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#241A13]">{name}</h1>
          <EditButton onClick={() => setEditing(true)} label="Переименовать" />
        </div>
      }
      edit={
        <form action={formAction} className="space-y-2">
          <input type="hidden" name="id" value={id} />
          <input
            type="text"
            name="name"
            defaultValue={name}
            autoFocus
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-lg font-semibold focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
          <FormError message={state?.error} />
          <div className="flex gap-2">
            <SubmitButton pendingLabel="Сохраняю...">Сохранить</SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </form>
      }
    />
  );
}
