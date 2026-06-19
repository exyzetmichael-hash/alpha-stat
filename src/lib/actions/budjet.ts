"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ActionState } from "./filial";

const CUSTOM_CATEGORY_SENTINEL = "__custom__";

type BudjetTip = "RASHOD" | "DOHOD";

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

  await prisma.budjetZapis.update({
    where: { id },
    data: { categoryName, amount, comment: comment || null },
  });

  revalidatePath(`/sezony/${sezonId}`);
  return null;
}

export async function softDeleteBudjetZapis(id: string, sezonId: string): Promise<void> {
  await prisma.budjetZapis.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}

export async function restoreBudjetZapis(id: string, sezonId: string): Promise<void> {
  await prisma.budjetZapis.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(`/sezony/${sezonId}`);
  revalidatePath("/trash");
}
