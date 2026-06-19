import { prisma } from "@/lib/db";
import { StatCard } from "@/components/StatCard";

// Завершённость сезона зависит от текущей даты, а не от действий пользователя,
// поэтому страница не может полагаться на revalidatePath из server actions.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [participantsCount, completedSeasonsCount, budjetSums] = await Promise.all([
    prisma.uchastnik.count({ where: { deletedAt: null, stolikId: { not: null } } }),
    prisma.sezon.count({ where: { deletedAt: null, endDate: { lt: new Date() } } }),
    prisma.budjetZapis.groupBy({ by: ["tip"], where: { deletedAt: null }, _sum: { amount: true } }),
  ]);

  const dohodTotal = budjetSums.find((s) => s.tip === "DOHOD")?._sum.amount ?? 0;
  const rashodTotal = budjetSums.find((s) => s.tip === "RASHOD")?._sum.amount ?? 0;
  const balance = dohodTotal - rashodTotal;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">Дашборд</h1>
      <p className="text-sm text-gray-500">Сводная статистика по всем филиалам и сезонам за всё время.</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <StatCard value={participantsCount.toLocaleString("ru-RU")} label="людей прошло через программу" />
        </div>
        <StatCard value={completedSeasonsCount.toLocaleString("ru-RU")} label="завершённых сезонов" />
        <StatCard value={`${balance.toLocaleString("ru-RU")} ₽`} label="баланс за всё время" />
        <StatCard value={`${dohodTotal.toLocaleString("ru-RU")} ₽`} label="доходы за всё время" />
        <StatCard value={`${rashodTotal.toLocaleString("ru-RU")} ₽`} label="расходы за всё время" />
      </div>
    </div>
  );
}
