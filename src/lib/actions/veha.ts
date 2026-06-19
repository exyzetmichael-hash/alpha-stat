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

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const num = Number.parseInt(str, 10);
  return Number.isNaN(num) ? null : num;
}

const CUSTOM_VEHA_SENTINEL = "__custom__";

function resolveVehaName(formData: FormData): string | null {
  const nameSelect = String(formData.get("nameSelect") ?? "").trim();
  if (!nameSelect) return null;
  if (nameSelect !== CUSTOM_VEHA_SENTINEL) return nameSelect;
  const custom = String(formData.get("nameCustom") ?? "").trim();
  return custom || null;
}

export async function createVeha(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sezonId = String(formData.get("sezonId") ?? "");
  const name = resolveVehaName(formData);
  const date = parseDateInput(formData.get("date"));
  const participantCount = parseOptionalInt(formData.get("participantCount"));
  const note = String(formData.get("note") ?? "").trim();

  if (!name) return { error: "Укажите название события" };
  if (!date) return { error: "Укажите дату события" };

  await prisma.veha.create({
    data: { sezonId, name, date, participantCount, note: note || null },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function updateVeha(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const sezonId = String(formData.get("sezonId") ?? "");
  const name = resolveVehaName(formData);
  const date = parseDateInput(formData.get("date"));
  const participantCount = parseOptionalInt(formData.get("participantCount"));
  const note = String(formData.get("note") ?? "").trim();

  if (!name) return { error: "Укажите название события" };
  if (!date) return { error: "Укажите дату события" };

  await prisma.veha.update({
    where: { id },
    data: { name, date, participantCount, note: note || null },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteVeha(id: string, sezonId: string): Promise<void> {
  await prisma.veha.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreVeha(id: string, sezonId: string): Promise<void> {
  await prisma.veha.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
