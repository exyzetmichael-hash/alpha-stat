"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// Стандартные роли (из seed.ts) удалить нельзя — только роли, которые
// лидер добавил сам через "Другое..." в форме участника. Удаление общее:
// роль пропадает из выпадающего списка у всех участников и сезонов сразу.
export async function deleteRol(id: string): Promise<void> {
  const rol = await prisma.rol.findUnique({ where: { id } });
  if (!rol || rol.isStandard) return;

  await prisma.rol.update({ where: { id }, data: { deletedAt: new Date() } });
  // Роли используются на всех страницах сезонов — обновляем их все.
  revalidatePath("/(app)/sezony/[sezonId]", "page");
}
