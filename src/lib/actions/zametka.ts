"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ActionState } from "./filial";

export async function createZametka(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sezonId = String(formData.get("sezonId") ?? "");
  const details = String(formData.get("details") ?? "").trim();
  const idea = String(formData.get("idea") ?? "").trim();

  if (!details && !idea) return { error: "Заполните хотя бы одно поле" };

  await prisma.zametka.create({
    data: { sezonId, details: details || null, idea: idea || null },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function updateZametka(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const sezonId = String(formData.get("sezonId") ?? "");
  const details = String(formData.get("details") ?? "").trim();
  const idea = String(formData.get("idea") ?? "").trim();

  if (!details && !idea) return { error: "Заполните хотя бы одно поле" };

  await prisma.zametka.update({
    where: { id },
    data: { details: details || null, idea: idea || null },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteZametka(id: string, sezonId: string): Promise<void> {
  await prisma.zametka.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreZametka(id: string, sezonId: string): Promise<void> {
  await prisma.zametka.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
