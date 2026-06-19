"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ActionState } from "./filial";

export async function createStolik(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sezonId = String(formData.get("sezonId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Введите название столика" };

  await prisma.stolik.create({ data: { sezonId, name } });
  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function renameStolik(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const sezonId = String(formData.get("sezonId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Название не может быть пустым" };

  await prisma.stolik.update({ where: { id }, data: { name } });
  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteStolik(id: string, sezonId: string): Promise<void> {
  await prisma.stolik.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreStolik(id: string, sezonId: string): Promise<void> {
  await prisma.stolik.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
