import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Простая страница проверки «жив ли сервис» — её можно открыть в браузере
// (адрес сайта + /api/health), чтобы убедиться, что приложение работает и
// видит базу данных. Не требует входа по паролю (см. PUBLIC_PATHS в proxy.ts).
// При проблеме возвращает понятный статус, а не белый экран.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "ok" });
  } catch {
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503 }
    );
  }
}
