import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ sezonId: string }> }) {
  const { sezonId } = await params;

  const zapisi = await prisma.budjetZapis.findMany({
    where: { sezonId, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  const rows = [
    ["Тип", "Категория", "Сумма", "Комментарий"],
    ...zapisi.map((z) => [
      z.tip === "RASHOD" ? "Расход" : "Доход",
      z.categoryName,
      String(z.amount),
      z.comment ?? "",
    ]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="budjet.csv"',
    },
  });
}
