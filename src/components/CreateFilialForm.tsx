"use client";

import { useActionState, useRef } from "react";
import { createFilial, type ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { useDraftAutosave, clearDraft } from "@/lib/use-draft-autosave";

const STORAGE_KEY = "draft:filial:create";

export function CreateFilialForm() {
  const formRef = useRef<HTMLFormElement>(null);
  useDraftAutosave(STORAGE_KEY, formRef);
  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await createFilial(prevState, formData);
    if (!result) {
      formRef.current?.reset();
      clearDraft(STORAGE_KEY);
    }
    return result;
  }, null);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input
        type="text"
        name="name"
        placeholder="Название нового филиала"
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
      />
      <FormError message={state?.error} />
      <SubmitButton pendingLabel="Добавляю...">Добавить филиал</SubmitButton>
    </form>
  );
}
