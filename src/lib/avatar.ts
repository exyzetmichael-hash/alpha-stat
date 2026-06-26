// Инициалы и стабильный цвет аватара по имени. Цвет детерминированный —
// у одного человека он всегда одинаковый. Классы градиентов записаны
// целыми строками-литералами, чтобы их увидел JIT Tailwind.

const AVATAR_STYLES = [
  "bg-gradient-to-br from-[#ffeced] to-[#ff9a9f] text-[#B01F28]",
  "bg-gradient-to-br from-[#fef9c3] to-[#fbbf24] text-[#78350F]",
  "bg-gradient-to-br from-[#dcfce7] to-[#86efac] text-[#166534]",
  "bg-gradient-to-br from-[#ede9fe] to-[#c4b5fd] text-[#5B21B6]",
  "bg-gradient-to-br from-[#e0f2fe] to-[#38bdf8] text-[#0c4a6e]",
  "bg-gradient-to-br from-[#fce7f3] to-[#ec4899] text-white",
  "bg-gradient-to-br from-[#fef3c7] to-[#f97316] text-white",
  "bg-gradient-to-br from-[#e0f2fe] to-[#0284c7] text-white",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function getAvatarStyle(name: string): string {
  return AVATAR_STYLES[hashString(name) % AVATAR_STYLES.length];
}
