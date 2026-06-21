"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
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

  await prisma.uchastnik.update({
    where: { id },
    data: {
      stolikId: stolikIdRaw || null,
      name,
      roleNames,
      note: note || null,
    },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteUchastnik(id: string, sezonId: string): Promise<void> {
  await prisma.uchastnik.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreUchastnik(id: string, sezonId: string): Promise<void> {
  await prisma.uchastnik.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
