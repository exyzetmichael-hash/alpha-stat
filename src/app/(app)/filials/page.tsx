import { prisma } from "@/lib/db";
import { softDeleteFilial } from "@/lib/actions/filial";
import { FilialList, type FilialListItem } from "@/components/FilialList";
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

  const items: FilialListItem[] = filials.map((filial) => ({
    id: filial.id,
    name: filial.name,
    sezonCount: filial._count.sezony,
    deleteAction: softDeleteFilial.bind(null, filial.id),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#241A13]">Филиалы</h1>

      <FilialList filials={items} />

      <CreateFilialForm />
    </div>
  );
}
