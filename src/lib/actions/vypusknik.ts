"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ActionState } from "./filial";

// Статусы приходят как набор отмеченных чекбоксов (можно несколько).
function readStatuses(formData: FormData, field: string): string[] {
  return formData
    .getAll(field)
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

export async function createVypusknik(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sezonId = String(formData.get("sezonId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const statusRightAfter = readStatuses(formData, "statusRightAfter");
  const statusSixMonths = readStatuses(formData, "statusSixMonths");

  if (!name) return { error: "Введите имя выпускника" };

  await prisma.vypusknik.create({
    data: {
      sezonId,
      name,
      statusRightAfter,
      statusSixMonths,
    },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function updateVypusknik(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const sezonId = String(formData.get("sezonId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const statusRightAfter = readStatuses(formData, "statusRightAfter");
  const statusSixMonths = readStatuses(formData, "statusSixMonths");

  if (!name) return { error: "Введите имя выпускника" };

  await prisma.vypusknik.update({
    where: { id },
    data: {
      name,
      statusRightAfter,
      statusSixMonths,
    },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteVypusknik(id: string, sezonId: string): Promise<void> {
  await prisma.vypusknik.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreVypusknik(id: string, sezonId: string): Promise<void> {
  await prisma.vypusknik.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
