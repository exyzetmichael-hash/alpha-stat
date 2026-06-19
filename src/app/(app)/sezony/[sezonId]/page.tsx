import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSezonStatus } from "@/lib/season-status";
import { softDeleteStolik } from "@/lib/actions/stolik";
import { softDeleteUchastnik } from "@/lib/actions/uchastnik";
import { SeasonEditor } from "@/components/SeasonEditor";
import { StolikCard } from "@/components/StolikCard";
import { CreateStolikForm } from "@/components/CreateStolikForm";
import { ToggleSection } from "@/components/ToggleSection";
import { ParticipantRow } from "@/components/ParticipantRow";
import { UchastnikForm } from "@/components/UchastnikForm";

export default async function SezonDetailPage({
  params,
}: {
  params: Promise<{ sezonId: string }>;
}) {
  const { sezonId } = await params;

  const sezon = await prisma.sezon.findFirst({
    where: { id: sezonId, deletedAt: null },
    include: {
      filial: true,
      stoliki: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: {
          uchastniki: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
        },
      },
      uchastniki: {
        where: { deletedAt: null, stolikId: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!sezon) notFound();

  const roles = (await prisma.rol.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } })).map(
    (r) => r.name
  );

  const status = getSezonStatus(sezon.startDate, sezon.endDate);

  return (
    <div className="space-y-8">
      <Link href={`/filials/${sezon.filialId}`} className="text-sm font-medium text-gray-400 hover:text-gray-700">
        ← {sezon.filial.name}
      </Link>

      <SeasonEditor filialId={sezon.filialId} sezon={sezon} status={status} />

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1a1a1a]">Столики</h2>
        {sezon.stoliki.map((stolik) => (
          <StolikCard
            key={stolik.id}
            sezonId={sezon.id}
            stolik={stolik}
            participants={stolik.uchastniki}
            roles={roles}
            deleteStolikAction={softDeleteStolik.bind(null, stolik.id, sezon.id)}
            deleteParticipantActions={Object.fromEntries(
              stolik.uchastniki.map((u) => [u.id, softDeleteUchastnik.bind(null, u.id, sezon.id)])
            )}
          />
        ))}
        {sezon.stoliki.length === 0 && <p className="text-sm text-gray-500">Столиков пока нет.</p>}
        <ToggleSection closedLabel="+ Добавить столик">
          <CreateStolikForm sezonId={sezon.id} />
        </ToggleSection>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1a1a1a]">Команда вне столиков</h2>
        <p className="text-sm text-gray-500">Медиа, кухня, дети, молитва, музыкальное сопровождение и другие роли.</p>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {sezon.uchastniki.map((participant) => (
            <ParticipantRow
              key={participant.id}
              sezonId={sezon.id}
              stolikId={null}
              roles={roles}
              participant={participant}
              deleteAction={softDeleteUchastnik.bind(null, participant.id, sezon.id)}
            />
          ))}
          {sezon.uchastniki.length === 0 && <p className="py-1 text-sm text-gray-500">Пока никого нет.</p>}
        </div>
        <ToggleSection closedLabel="+ Добавить участника">
          <UchastnikForm mode="create" sezonId={sezon.id} stolikId={null} roles={roles} />
        </ToggleSection>
      </section>
    </div>
  );
}
