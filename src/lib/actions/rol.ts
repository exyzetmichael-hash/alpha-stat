"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// Стандартные роли (из seed.ts) удалить нельзя — только роли, которые
// лидер добавил сам через "Другое..." в форме участника.
export async function deleteRol(id: string): Promise<void> {
  const rol = await prisma.rol.findUnique({ where: { id } });
  if (!rol || rol.isStandard) return;

  await prisma.rol.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/dashboard");
  revalidatePath("/(app)/sezony/[sezonId]", "page");
}
