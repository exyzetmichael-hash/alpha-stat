"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export type ActionState = { error?: string } | null;

export async function createFilial(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Введите название филиала" };
  }

  await prisma.filial.create({ data: { name } });
  revalidatePath("/filials");
  return null;
}

export async function renameFilial(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Название не может быть пустым" };
  }

  await prisma.filial.update({ where: { id }, data: { name } });
  revalidatePath("/filials");
  revalidatePath(`/filials/${id}`);
  return null;
}

export async function softDeleteFilial(id: string): Promise<void> {
  await prisma.filial.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/filials");
  revalidatePath("/trash");
}

export async function restoreFilial(id: string): Promise<void> {
  await prisma.filial.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath("/filials");
  revalidatePath("/trash");
}

// Удаление со страницы самого филиала: после удаления возвращаем
// пользователя к списку филиалов, иначе он остался бы на странице
// удалённой записи.
export async function softDeleteFilialAndGoToList(id: string): Promise<void> {
  await prisma.filial.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/filials");
  revalidatePath("/trash");
  redirect("/filials");
}

// Безвозвратное удаление из корзины: филиал не каскадирует deletedAt на свои
// сезоны, поэтому здесь вручную удаляем все дочерние записи перед самим филиалом.
export async function hardDeleteFilial(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const sezony = await tx.sezon.findMany({ where: { filialId: id }, select: { id: true } });
    const sezonIds = sezony.map((s) => s.id);

    if (sezonIds.length > 0) {
      await tx.uchastnik.deleteMany({ where: { sezonId: { in: sezonIds } } });
      await tx.veha.deleteMany({ where: { sezonId: { in: sezonIds } } });
      await tx.budjetZapis.deleteMany({ where: { sezonId: { in: sezonIds } } });
      await tx.reklama.deleteMany({ where: { sezonId: { in: sezonIds } } });
      await tx.vypusknik.deleteMany({ where: { sezonId: { in: sezonIds } } });
      await tx.zametka.deleteMany({ where: { sezonId: { in: sezonIds } } });
      await tx.stolik.deleteMany({ where: { sezonId: { in: sezonIds } } });
      await tx.sezon.deleteMany({ where: { id: { in: sezonIds } } });
    }

    await tx.filial.delete({ where: { id } });
  });

  revalidatePath("/filials");
  revalidatePath("/trash");
}
