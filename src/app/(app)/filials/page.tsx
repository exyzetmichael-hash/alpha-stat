import Link from "next/link";
import { prisma } from "@/lib/db";
import { softDeleteFilial } from "@/lib/actions/filial";
import { DeleteButton } from "@/components/DeleteButton";
import { CreateFilialForm } from "@/components/CreateFilialForm";

// Список филиалов всегда читает свежие данные (в т.ч. счётчик сезонов,
// который меняется при действиях с сезонами). Рендерим по запросу, а не
// статически на этапе сборки — иначе сборке нужна живая база данных.
export const dynamic = "force-dynamic";

export default async function FilialsPage() {
  const filials = await prisma.filial.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { sezony: { where: { deletedAt: null } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">Филиалы</h1>

      <div className="space-y-3">
        {filials.map((filial) => (
          <div
            key={filial.id}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
          >
            <Link href={`/filials/${filial.id}`} className="flex-1">
              <p className="font-semibold text-[#1a1a1a]">{filial.name}</p>
              <p className="text-sm text-gray-500">
                {filial._count.sezony} {filial._count.sezony === 1 ? "сезон" : "сезонов"}
              </p>
            </Link>
            <DeleteButton
              action={softDeleteFilial.bind(null, filial.id)}
              confirmText={`Удалить филиал «${filial.name}»? Его можно будет восстановить в Корзине.`}
            />
          </div>
        ))}

        {filials.length === 0 && (
          <p className="text-sm text-gray-500">Филиалов пока нет.</p>
        )}
      </div>

      <CreateFilialForm />
    </div>
  );
}
