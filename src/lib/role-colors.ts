// Цвет бейджа роли. Нескольким известным ролям — фиксированный смысловой цвет,
// остальным (включая кастомные роли лидеров) — стабильный цвет по хешу имени.
// Классы — целые строки-литералы, чтобы их подхватил JIT Tailwind.

const NEUTRAL = "bg-[#F5F0EB] text-[#524940]";

const FIXED: Record<string, string> = {
  Лидер: "bg-[#FFF1F0] text-[#B01F28]",
  Гость: "bg-[#FFFBEB] text-[#B45309]",
  Участник: NEUTRAL,
  Помощник: NEUTRAL,
  "Помощник (сервис)": NEUTRAL,
  Сопровождающий: NEUTRAL,
};

const PALETTE = [
  "bg-[#EFF6FF] text-[#1D4ED8]",
  "bg-[#F0FDF4] text-[#15803D]",
  "bg-[#F3F0FF] text-[#6D28D9]",
  "bg-[#FFF7ED] text-[#C2410C]",
  "bg-[#ECFEFF] text-[#0E7490]",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getRoleBadgeClass(name: string): string {
  return FIXED[name] ?? PALETTE[hashString(name) % PALETTE.length];
}
