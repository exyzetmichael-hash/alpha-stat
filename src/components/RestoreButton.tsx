"use client";

import { useState } from "react";

export function RestoreButton({ action }: { action: () => Promise<void> }) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await action();
        setPending(false);
      }}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
    >
      {pending ? "Восстанавливаю..." : "Восстановить"}
    </button>
  );
}
