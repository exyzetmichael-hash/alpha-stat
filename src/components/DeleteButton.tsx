"use client";

import { useState } from "react";

export function DeleteButton({
  action,
  confirmText,
  label = "Удалить",
}: {
  action: () => Promise<void>;
  confirmText: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!confirm(confirmText)) return;
        setPending(true);
        await action();
        setPending(false);
      }}
      className="rounded-lg px-1.5 py-1 text-sm text-gray-400 transition-colors hover:text-red-600 disabled:opacity-50"
    >
      {pending ? "Удаляю..." : label}
    </button>
  );
}
