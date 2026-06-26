import { getRoleBadgeClass } from "@/lib/role-colors";

// Бейдж роли участника — пилюля со смысловым цветом.
export function RoleBadge({ name }: { name: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${getRoleBadgeClass(name)}`}>
      {name}
    </span>
  );
}
