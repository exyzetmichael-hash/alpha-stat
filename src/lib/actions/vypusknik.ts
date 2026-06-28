"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
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

  await logAudit(sezonId, "Выпускник", `Добавлен выпускник «${name}»`);

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

  const before = await prisma.vypusknik.findUnique({ where: { id } });

  await prisma.vypusknik.update({
    where: { id },
    data: {
      name,
      statusRightAfter,
      statusSixMonths,
    },
  });

  if (before) {
    const changes: string[] = [];
    if (before.name !== name) changes.push(`имя «${before.name}» → «${name}»`);
    const rightAfterChanged =
      before.statusRightAfter.length !== statusRightAfter.length ||
      before.statusRightAfter.some((s) => !statusRightAfter.includes(s));
    if (rightAfterChanged) {
      changes.push(
        `статус сразу после Альфы: ${before.statusRightAfter.join(", ") || "—"} → ${statusRightAfter.join(", ") || "—"}`
      );
    }
    const sixMonthsChanged =
      before.statusSixMonths.length !== statusSixMonths.length ||
      before.statusSixMonths.some((s) => !statusSixMonths.includes(s));
    if (sixMonthsChanged) {
      changes.push(
        `статус через полгода: ${before.statusSixMonths.join(", ") || "—"} → ${statusSixMonths.join(", ") || "—"}`
      );
    }
    if (changes.length > 0) {
      await logAudit(sezonId, "Выпускник", `Изменён выпускник «${name}»: ${changes.join("; ")}`);
    }
  }

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteVypusknik(id: string, sezonId: string): Promise<void> {
  const vypusknik = await prisma.vypusknik.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(sezonId, "Выпускник", `Удалён выпускник «${vypusknik.name}»`);
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreVypusknik(id: string, sezonId: string): Promise<void> {
  const vypusknik = await prisma.vypusknik.update({ where: { id }, data: { deletedAt: null } });
  await logAudit(sezonId, "Выпускник", `Восстановлен выпускник «${vypusknik.name}»`);
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
