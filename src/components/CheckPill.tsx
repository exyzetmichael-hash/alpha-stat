"use client";

import type { ReactNode } from "react";

// Чекбокс в виде «пилюли» — крупная зона нажатия (≥44px), аккуратная галочка
// и понятное выбранное состояние. Используется и для ролей участника, и для
// статусов выпускника, чтобы выбор везде выглядел одинаково.
export function CheckPill({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 shadow-sm transition-colors hover:border-gray-300 has-[:checked]:border-[#E63946] has-[:checked]:bg-[#E63946]/[0.06] has-[:checked]:font-medium has-[:checked]:text-[#E63946] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#E63946]/30">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="h-4 w-4 shrink-0 cursor-pointer accent-[#E63946]"
      />
      <span className="whitespace-nowrap">{children}</span>
    </label>
  );
}
