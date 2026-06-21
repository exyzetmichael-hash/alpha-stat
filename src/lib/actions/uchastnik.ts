"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ActionState } from "./filial";

const CUSTOM_ROLE_SENTINEL = "__custom__";

async function resolveRoleName(formData: FormData): Promise<string | null> {
  const roleSelect = String(formData.get("roleSelect") ?? "").trim();
  if (!roleSelect) return null;

  if (roleSelect !== CUSTOM_ROLE_SENTINEL) {
    return roleSelect;
  }

  const customRole = String(formData.get("roleCustom") ?? "").trim();
  if (!customRole) return null;

  // Новая роль попадает в тот список, где её добавили: за столиком или
  // в команде вне столиков. Если роль с таким именем уже есть — оставляем
  // её область как есть.
  const scope = String(formData.get("stolikId") ?? "").trim() ? "STOLIK" : "KOMANDA";
  await prisma.rol.upsert({
    where: { name: customRole },
    update: {},
    create: { name: customRole, scope },
  });

  return customRole;
}

export async function createUchastnik(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sezonId = String(formData.get("sezonId") ?? "");
  const stolikIdRaw = String(formData.get("stolikId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const roleName = await resolveRoleName(formData);

  if (!name) return { error: "Введите имя участника" };
  if (!roleName) return { error: "Выберите роль участника" };

  await prisma.uchastnik.create({
    data: {
      sezonId,
      stolikId: stolikIdRaw || null,
      name,
      roleName,
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
  const roleName = await resolveRoleName(formData);

  if (!name) return { error: "Введите имя участника" };
  if (!roleName) return { error: "Выберите роль участника" };

  await prisma.uchastnik.update({
    where: { id },
    data: {
      stolikId: stolikIdRaw || null,
      name,
      roleName,
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
