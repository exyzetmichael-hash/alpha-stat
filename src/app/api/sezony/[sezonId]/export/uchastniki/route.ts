import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ sezonId: string }> }) {
  const { sezonId } = await params;

  const uchastniki = await prisma.uchastnik.findMany({
    where: { sezonId, deletedAt: null },
    include: { stolik: true },
    orderBy: { createdAt: "asc" },
  });

  const rows = [
    ["Имя", "Роли", "Столик", "Заметка"],
    ...uchastniki.map((u) => [u.name, u.roleNames.join(", "), u.stolik?.name ?? "", u.note ?? ""]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="uchastniki.csv"',
    },
  });
}
