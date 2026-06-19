"use client";

import { useState } from "react";

export function ToggleSection({
  closedLabel,
  openLabel = "Свернуть",
  children,
}: {
  closedLabel: string;
  openLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600"
      >
        {closedLabel}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      {children}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-gray-400"
      >
        {openLabel}
      </button>
    </div>
  );
}
