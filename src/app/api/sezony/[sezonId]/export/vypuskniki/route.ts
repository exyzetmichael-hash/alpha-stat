import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ sezonId: string }> }) {
  const { sezonId } = await params;

  const vypuskniki = await prisma.vypusknik.findMany({
    where: { sezonId, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  const rows = [
    ["Имя", "Статус сразу после Альфы", "Статус через полгода"],
    ...vypuskniki.map((v) => [v.name, v.statusRightAfter.join(", "), v.statusSixMonths.join(", ")]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vypuskniki.csv"',
    },
  });
}
