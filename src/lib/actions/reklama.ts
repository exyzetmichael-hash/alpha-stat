"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ActionState } from "./filial";

function parseDateInput(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createReklama(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sezonId = String(formData.get("sezonId") ?? "");
  const date = parseDateInput(formData.get("date"));
  const action = String(formData.get("action") ?? "").trim();
  const materialsNote = String(formData.get("materialsNote") ?? "").trim();
  const effectivenessNote = String(formData.get("effectivenessNote") ?? "").trim();

  if (!date) return { error: "Укажите дату" };
  if (!action) return { error: "Опишите, что было сделано" };

  await prisma.reklama.create({
    data: {
      sezonId,
      date,
      action,
      materialsNote: materialsNote || null,
      effectivenessNote: effectivenessNote || null,
    },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function updateReklama(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const sezonId = String(formData.get("sezonId") ?? "");
  const date = parseDateInput(formData.get("date"));
  const action = String(formData.get("action") ?? "").trim();
  const materialsNote = String(formData.get("materialsNote") ?? "").trim();
  const effectivenessNote = String(formData.get("effectivenessNote") ?? "").trim();

  if (!date) return { error: "Укажите дату" };
  if (!action) return { error: "Опишите, что было сделано" };

  await prisma.reklama.update({
    where: { id },
    data: {
      date,
      action,
      materialsNote: materialsNote || null,
      effectivenessNote: effectivenessNote || null,
    },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteReklama(id: string, sezonId: string): Promise<void> {
  await prisma.reklama.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreReklama(id: string, sezonId: string): Promise<void> {
  await prisma.reklama.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
