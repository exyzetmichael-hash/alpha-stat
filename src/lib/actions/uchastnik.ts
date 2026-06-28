"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "./filial";

// Роли участника приходят как набор отмеченных чекбоксов (можно несколько).
// Любая роль, которой ещё нет в справочнике (добавленная лидером прямо в форме),
// заводится автоматически в области текущего контекста: за столиком или
// в команде вне столиков. Порядок и дубли убираем.
async function resolveRoleNames(formData: FormData, stolikIdRaw: string): Promise<string[]> {
  const names = Array.from(
    new Set(
      formData
        .getAll("roleNames")
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0)
    )
  );

  if (names.length === 0) return names;

  const scope = stolikIdRaw ? "STOLIK" : "KOMANDA";
  await Promise.all(
    names.map((name) =>
      prisma.rol.upsert({
        where: { name },
        update: {},
        create: { name, scope },
      })
    )
  );

  return names;
}

export async function createUchastnik(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sezonId = String(formData.get("sezonId") ?? "");
  const stolikIdRaw = String(formData.get("stolikId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const roleNames = await resolveRoleNames(formData, stolikIdRaw);

  if (!name) return { error: "Введите имя участника" };
  if (roleNames.length === 0) return { error: "Выберите хотя бы одну роль" };

  await prisma.uchastnik.create({
    data: {
      sezonId,
      stolikId: stolikIdRaw || null,
      name,
      roleNames,
      note: note || null,
    },
  });

  await logAudit(sezonId, "Участник", `Добавлен участник «${name}» (${roleNames.join(", ")})`);

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function updateUchastnik(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const sezonId = String(formData.get("sezonId") ?? "");
  const stolikIdRaw = String(formData.get("stolikId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const roleNames = await resolveRoleNames(formData, stolikIdRaw);

  if (!name) return { error: "Введите имя участника" };
  if (roleNames.length === 0) return { error: "Выберите хотя бы одну роль" };

  const before = await prisma.uchastnik.findUnique({ where: { id } });

  await prisma.uchastnik.update({
    where: { id },
    data: {
      stolikId: stolikIdRaw || null,
      name,
      roleNames,
      note: note || null,
    },
  });

  if (before) {
    const changes: string[] = [];
    if (before.name !== name) changes.push(`имя «${before.name}» → «${name}»`);
    const rolesChanged =
      before.roleNames.length !== roleNames.length || before.roleNames.some((r) => !roleNames.includes(r));
    if (rolesChanged) {
      changes.push(`роли: ${before.roleNames.join(", ") || "—"} → ${roleNames.join(", ") || "—"}`);
    }
    if ((before.note ?? "") !== (note || "")) changes.push("заметка изменена");
    if ((before.stolikId ?? "") !== (stolikIdRaw || "")) changes.push("стол изменён");
    if (changes.length > 0) {
      await logAudit(sezonId, "Участник", `Изменён участник «${name}»: ${changes.join("; ")}`);
    }
  }

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteUchastnik(id: string, sezonId: string): Promise<void> {
  const uchastnik = await prisma.uchastnik.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(sezonId, "Участник", `Удалён участник «${uchastnik.name}»`);
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreUchastnik(id: string, sezonId: string): Promise<void> {
  const uchastnik = await prisma.uchastnik.update({ where: { id }, data: { deletedAt: null } });
  await logAudit(sezonId, "Участник", `Восстановлен участник «${uchastnik.name}»`);
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
