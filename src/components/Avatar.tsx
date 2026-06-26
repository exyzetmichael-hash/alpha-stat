import { getInitials, getAvatarStyle } from "@/lib/avatar";

// Кружок-аватар с инициалами и стабильным градиентом по имени.
export function Avatar({ name }: { name: string }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${getAvatarStyle(name)}`}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
