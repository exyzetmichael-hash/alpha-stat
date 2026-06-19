"use client";

import { useActionState, useRef } from "react";
import { createStolik } from "@/lib/actions/stolik";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";

export function CreateStolikForm({ sezonId }: { sezonId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await createStolik(prevState, formData);
    if (!result) formRef.current?.reset();
    return result;
  }, null);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="sezonId" value={sezonId} />
      <input
        type="text"
        name="name"
        placeholder="Например, Столик 3"
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
      />
      <FormError message={state?.error} />
      <SubmitButton pendingLabel="Добавляю...">Добавить столик</SubmitButton>
    </form>
  );
}
