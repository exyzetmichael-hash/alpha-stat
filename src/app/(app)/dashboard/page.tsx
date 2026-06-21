import { prisma } from "@/lib/db";
import { StatCard } from "@/components/StatCard";
import { StaggerList, StaggerItem } from "@/components/motion/Stagger";
import { VYPUSKNIK_STATUSES } from "@/lib/vypusknik-statuses";

// Завершённость сезона зависит от текущей даты, а не от действий пользователя,
// поэтому страница не может полагаться на revalidatePath из server actions.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Удалённые филиалы и сезоны не каскадируют deletedAt на свои дочерние записи,
  // поэтому здесь явно проверяем всю цепочку (сезон → филиал), чтобы данные
  // из корзины не попадали в статистику дашборда.
  const [participantsCount, completedSeasonsCount, budjetSums, vypuskniki] = await Promise.all([
    prisma.uchastnik.count({
      where: { deletedAt: null, stolikId: { not: null }, sezon: { deletedAt: null, filial: { deletedAt: null } } },
    }),
    prisma.sezon.count({
      where: { deletedAt: null, endDate: { lt: new Date() }, filial: { deletedAt: null } },
    }),
    prisma.budjetZapis.groupBy({
      by: ["tip"],
      where: { deletedAt: null, sezon: { deletedAt: null, filial: { deletedAt: null } } },
      _sum: { amount: true },
    }),
    prisma.vypusknik.findMany({
      where: { deletedAt: null, sezon: { deletedAt: null, filial: { deletedAt: null } } },
      select: { statusRightAfter: true, statusSixMonths: true },
    }),
  ]);

  const dohodTotal = budjetSums.find((s) => s.tip === "DOHOD")?._sum.amount ?? 0;
  const rashodTotal = budjetSums.find((s) => s.tip === "RASHOD")?._sum.amount ?? 0;
  const balance = dohodTotal - rashodTotal;

  // Считаем, сколько выпускников отмечено каждым статусом — отдельно «сразу
  // после Альфы» и «через полгода». Выпускник может иметь несколько статусов,
  // поэтому он учитывается в каждом отмеченном.
  const rightAfterCounts = new Map<string, number>();
  const sixMonthsCounts = new Map<string, number>();
  for (const v of vypuskniki) {
    for (const s of v.statusRightAfter) rightAfterCounts.set(s, (rightAfterCounts.get(s) ?? 0) + 1);
    for (const s of v.statusSixMonths) sixMonthsCounts.set(s, (sixMonthsCounts.get(s) ?? 0) + 1);
  }
  // Сначала стандартные статусы в заданном порядке, затем любые нестандартные.
  const extraStatuses = [...rightAfterCounts.keys(), ...sixMonthsCounts.keys()].filter(
    (s) => !VYPUSKNIK_STATUSES.includes(s as (typeof VYPUSKNIK_STATUSES)[number])
  );
  const statusRows = [...VYPUSKNIK_STATUSES, ...new Set(extraStatuses)]
    .map((status) => ({
      status,
      rightAfter: rightAfterCounts.get(status) ?? 0,
      sixMonths: sixMonthsCounts.get(status) ?? 0,
    }))
    .filter((row) => row.rightAfter > 0 || row.sixMonths > 0);
  const vypusknikiTotal = vypuskniki.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">Дашборд</h1>
      <p className="text-sm text-gray-500">Сводная статистика по всем филиалам и сезонам за всё время.</p>

      <StaggerList className="grid grid-cols-2 gap-3">
        <StaggerItem className="col-span-2">
          <StatCard value={participantsCount.toLocaleString("ru-RU")} label="людей прошло через программу" />
        </StaggerItem>
        <StaggerItem>
          <StatCard value={completedSeasonsCount.toLocaleString("ru-RU")} label="завершённых сезонов" />
        </StaggerItem>
        <StaggerItem>
          <StatCard value={`${balance.toLocaleString("ru-RU")} ₽`} label="баланс за всё время" />
        </StaggerItem>
        <StaggerItem>
          <StatCard value={`${dohodTotal.toLocaleString("ru-RU")} ₽`} label="доходы за всё время" />
        </StaggerItem>
        <StaggerItem>
          <StatCard value={`${rashodTotal.toLocaleString("ru-RU")} ₽`} label="расходы за всё время" />
        </StaggerItem>
      </StaggerList>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1a1a1a]">Выпускники по статусам</h2>
        {statusRows.length === 0 ? (
          <p className="text-sm text-gray-500">
            {vypusknikiTotal === 0
              ? "Выпускников пока нет."
              : "У выпускников пока не отмечены статусы."}
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-2.5 font-medium">Статус</th>
                  <th className="px-3 py-2.5 text-right font-medium">Сразу</th>
                  <th className="px-4 py-2.5 text-right font-medium">Через полгода</th>
                </tr>
              </thead>
              <tbody>
                {statusRows.map((row) => (
                  <tr key={row.status} className="border-b border-gray-50 last:border-none">
                    <td className="px-4 py-2.5 text-[#1a1a1a]">{row.status}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-gray-700">{row.rightAfter}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{row.sixMonths}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
