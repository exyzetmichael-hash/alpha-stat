"use client";

import { useState } from "react";
import { AVATAR_COLORS } from "@/lib/ploshad/identity";

// Поповер «как меня видно»: имя и цвет аватара. Значения хранятся в localStorage
// (см. identity.ts) — аккаунтов нет, имя самоназначаемое.
export function NameSettings({
  name,
  color,
  onSave,
  onClose,
}: {
  name: string;
  color: string;
  onSave: (name: string, color: string) => void;
  onClose: () => void;
}) {
  const [draftName, setDraftName] = useState(name);
  const [draftColor, setDraftColor] = useState(color);

  return (
    <div className="w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
      <label className="mb-1 block text-xs font-semibold text-gray-600">Как вас зовут</label>
      <input
        type="text"
        value={draftName}
        maxLength={40}
        onChange={(e) => setDraftName(e.target.value)}
        placeholder="Имя на площади"
        className="mb-3 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
      />

      <span className="mb-1 block text-xs font-semibold text-gray-600">Цвет</span>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {AVATAR_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Цвет ${c}`}
            onClick={() => setDraftColor(c)}
            className={`h-6 w-6 rounded-full transition-transform ${
              draftColor === c ? "ring-2 ring-offset-2 ring-[#241A13]" : "hover:scale-110"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={() => onSave(draftName.trim() || name, draftColor)}
          className="rounded-lg bg-[#E63946] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#d52f3c]"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
