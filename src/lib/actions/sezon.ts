"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { ActionState } from "./filial";

function parseDateInput(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createSezon(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const filialId = String(formData.get("filialId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const theme = String(formData.get("theme") ?? "").trim();
  const startDate = parseDateInput(formData.get("startDate"));
  const endDate = parseDateInput(formData.get("endDate"));
  const copyFromSezonId = String(formData.get("copyFromSezonId") ?? "").trim();

  if (!name) return { error: "Введите название сезона" };
  if (!startDate || !endDate) return { error: "Укажите дату начала и дату окончания" };
  if (endDate < startDate) return { error: "Дата окончания не может быть раньше даты начала" };

  const sezon = await prisma.sezon.create({
    data: { filialId, name, theme: theme || null, startDate, endDate },
  });

  if (copyFromSezonId) {
    const sourceStoliki = await prisma.stolik.findMany({
      where: { sezonId: copyFromSezonId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
    if (sourceStoliki.length > 0) {
      await prisma.stolik.createMany({
        data: sourceStoliki.map((s) => ({ sezonId: sezon.id, name: s.name })),
      });
    }
  }

  revalidatePath(`/filials/${filialId}`);
  revalidatePath(`/sezony/${sezon.id}`);
  return null;
}

export async function updateSezon(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const filialId = String(formData.get("filialId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const theme = String(formData.get("theme") ?? "").trim();
  const startDate = parseDateInput(formData.get("startDate"));
  const endDate = parseDateInput(formData.get("endDate"));
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const thoughtsNote = String(formData.get("thoughtsNote") ?? "").trim();
  const nextSeasonNote = String(formData.get("nextSeasonNote") ?? "").trim();

  if (!name) return { error: "Введите название сезона" };
  if (!startDate || !endDate) return { error: "Укажите дату начала и дату окончания" };
  if (endDate < startDate) return { error: "Дата окончания не может быть раньше даты начала" };

  await prisma.sezon.update({
    where: { id },
    data: {
      name,
      theme: theme || null,
      startDate,
      endDate,
      photoUrl: photoUrl || null,
      thoughtsNote: thoughtsNote || null,
      nextSeasonNote: nextSeasonNote || null,
    },
  });

  revalidatePath(`/filials/${filialId}`);
  revalidatePath(`/sezony/${id}`);
  return null;
}

export async function softDeleteSezon(id: string, filialId: string): Promise<void> {
  await prisma.sezon.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(`/filials/${filialId}`);
  revalidatePath("/trash");
}

export async function restoreSezon(id: string, filialId: string): Promise<void> {
  await prisma.sezon.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(`/filials/${filialId}`);
  revalidatePath("/trash");
}

// Удаление со страницы самого сезона: после удаления возвращаем
// пользователя к странице филиала, иначе он остался бы на странице
// удалённой записи.
export async function softDeleteSezonAndGoToFilial(id: string, filialId: string): Promise<void> {
  await prisma.sezon.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(`/filials/${filialId}`);
  revalidatePath("/trash");
  redirect(`/filials/${filialId}`);
}

// Безвозвратное удаление из корзины: сначала дочерние записи сезона, затем сам сезон.
export async function hardDeleteSezon(id: string, filialId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.uchastnik.deleteMany({ where: { sezonId: id } });
    await tx.veha.deleteMany({ where: { sezonId: id } });
    await tx.budjetZapis.deleteMany({ where: { sezonId: id } });
    await tx.reklama.deleteMany({ where: { sezonId: id } });
    await tx.vypusknik.deleteMany({ where: { sezonId: id } });
    await tx.zametka.deleteMany({ where: { sezonId: id } });
    await tx.stolik.deleteMany({ where: { sezonId: id } });
    await tx.sezon.delete({ where: { id } });
  });

  revalidatePath(`/filials/${filialId}`);
  revalidatePath("/trash");
}
