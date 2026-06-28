"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "./filial";

const CUSTOM_CATEGORY_SENTINEL = "__custom__";

type BudjetTip = "RASHOD" | "DOHOD";

const tipLabel: Record<BudjetTip, string> = { RASHOD: "Расход", DOHOD: "Доход" };

async function resolveCategoryName(formData: FormData, tip: BudjetTip): Promise<string | null> {
  const categorySelect = String(formData.get("categorySelect") ?? "").trim();
  if (!categorySelect) return null;

  if (categorySelect !== CUSTOM_CATEGORY_SENTINEL) {
    return categorySelect;
  }

  const customCategory = String(formData.get("categoryCustom") ?? "").trim();
  if (!customCategory) return null;

  await prisma.budjetKategoriya.upsert({
    where: { tip_name: { tip, name: customCategory } },
    update: {},
    create: { tip, name: customCategory },
  });

  return customCategory;
}

function parseAmount(value: FormDataEntryValue | null): number | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const num = Number.parseInt(str, 10);
  return Number.isNaN(num) || num < 0 ? null : num;
}

export async function createBudjetZapis(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sezonId = String(formData.get("sezonId") ?? "");
  const tip = String(formData.get("tip") ?? "") as BudjetTip;
  const amount = parseAmount(formData.get("amount"));
  const comment = String(formData.get("comment") ?? "").trim();
  const categoryName = await resolveCategoryName(formData, tip);

  if (!categoryName) return { error: "Выберите категорию" };
  if (amount === null) return { error: "Укажите сумму (целое число рублей)" };

  await prisma.budjetZapis.create({
    data: { sezonId, tip, categoryName, amount, comment: comment || null },
  });

  await logAudit(
    sezonId,
    "Бюджет",
    `Добавлен ${tipLabel[tip].toLowerCase()} «${categoryName}»: ${amount.toLocaleString("ru-RU")} ₽`
  );

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function updateBudjetZapis(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const sezonId = String(formData.get("sezonId") ?? "");
  const tip = String(formData.get("tip") ?? "") as BudjetTip;
  const amount = parseAmount(formData.get("amount"));
  const comment = String(formData.get("comment") ?? "").trim();
  const categoryName = await resolveCategoryName(formData, tip);

  if (!categoryName) return { error: "Выберите категорию" };
  if (amount === null) return { error: "Укажите сумму (целое число рублей)" };

  const before = await prisma.budjetZapis.findUnique({ where: { id } });

  await prisma.budjetZapis.update({
    where: { id },
    data: { categoryName, amount, comment: comment || null },
  });

  if (before) {
    const changes: string[] = [];
    if (before.categoryName !== categoryName) changes.push(`категория «${before.categoryName}» → «${categoryName}»`);
    if (before.amount !== amount) {
      changes.push(`сумма ${before.amount.toLocaleString("ru-RU")} ₽ → ${amount.toLocaleString("ru-RU")} ₽`);
    }
    if ((before.comment ?? "") !== (comment || "")) changes.push("комментарий изменён");
    if (changes.length > 0) {
      await logAudit(sezonId, "Бюджет", `Изменён ${tipLabel[tip].toLowerCase()} «${categoryName}»: ${changes.join("; ")}`);
    }
  }

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteBudjetZapis(id: string, sezonId: string): Promise<void> {
  const zapis = await prisma.budjetZapis.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(
    sezonId,
    "Бюджет",
    `Удалён ${tipLabel[zapis.tip].toLowerCase()} «${zapis.categoryName}»: ${zapis.amount.toLocaleString("ru-RU")} ₽`
  );
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreBudjetZapis(id: string, sezonId: string): Promise<void> {
  const zapis = await prisma.budjetZapis.update({ where: { id }, data: { deletedAt: null } });
  await logAudit(
    sezonId,
    "Бюджет",
    `Восстановлен ${tipLabel[zapis.tip].toLowerCase()} «${zapis.categoryName}»: ${zapis.amount.toLocaleString("ru-RU")} ₽`
  );
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
