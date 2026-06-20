import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { softDeleteSezon } from "@/lib/actions/sezon";
import { softDeleteFilialAndGoToList } from "@/lib/actions/filial";
import { getSezonStatus } from "@/lib/season-status";
import { formatDateRu } from "@/lib/format-date";
import { FilialNameEditor } from "@/components/FilialNameEditor";
import { CreateSezonForm } from "@/components/CreateSezonForm";
import { ToggleSection } from "@/components/ToggleSection";
import { SeasonList, type SeasonListItem } from "@/components/SeasonList";
import { DeleteButton } from "@/components/DeleteButton";

export default async function FilialDetailPage({
  params,
}: {
  params: Promise<{ filialId: string }>;
}) {
  const { filialId } = await params;

  const filial = await prisma.filial.findFirst({
    where: { id: filialId, deletedAt: null },
    include: {
      sezony: {
        where: { deletedAt: null },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!filial) notFound();

  const seasons: SeasonListItem[] = filial.sezony.map((sezon) => ({
    id: sezon.id,
    name: sezon.name,
    status: getSezonStatus(sezon.startDate, sezon.endDate),
    dateRangeLabel: `${formatDateRu(sezon.startDate)} — ${formatDateRu(sezon.endDate)}`,
    deleteAction: softDeleteSezon.bind(null, sezon.id, filial.id),
  }));

  return (
    <div className="space-y-6">
      <FilialNameEditor id={filial.id} name={filial.name} />

      <SeasonList seasons={seasons} />

      <ToggleSection closedLabel="+ Добавить сезон">
        <CreateSezonForm filialId={filial.id} />
      </ToggleSection>

      <div className="border-t border-gray-200 pt-4">
        <DeleteButton
          action={softDeleteFilialAndGoToList.bind(null, filial.id)}
          confirmText={`Удалить филиал «${filial.name}» со всеми его сезонами? Его можно будет восстановить в Корзине.`}
          label="Удалить филиал"
        />
      </div>
    </div>
  );
}
