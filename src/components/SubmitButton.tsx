"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Сохраняю...",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-xl bg-[#E63946] px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
