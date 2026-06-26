import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSezonStatus } from "@/lib/season-status";
import { softDeleteStolik } from "@/lib/actions/stolik";
import { softDeleteUchastnik } from "@/lib/actions/uchastnik";
import { softDeleteVeha } from "@/lib/actions/veha";
import { softDeleteBudjetZapis } from "@/lib/actions/budjet";
import { softDeleteReklama } from "@/lib/actions/reklama";
import { softDeleteVypusknik } from "@/lib/actions/vypusknik";
import { softDeleteZametka } from "@/lib/actions/zametka";
import { softDeleteSezonAndGoToFilial } from "@/lib/actions/sezon";
import { DeleteButton } from "@/components/DeleteButton";
import { SeasonEditor } from "@/components/SeasonEditor";
import { StolikCard } from "@/components/StolikCard";
import { CreateStolikForm } from "@/components/CreateStolikForm";
import { ToggleSection } from "@/components/ToggleSection";
import { ParticipantRow } from "@/components/ParticipantRow";
import { UchastnikForm } from "@/components/UchastnikForm";
import { VehaRow } from "@/components/VehaRow";
import { VehaForm } from "@/components/VehaForm";
import { BudjetRow } from "@/components/BudjetRow";
import { BudjetForm } from "@/components/BudjetForm";
import { ReklamaRow } from "@/components/ReklamaRow";
import { ReklamaForm } from "@/components/ReklamaForm";
import { VypusknikRow } from "@/components/VypusknikRow";
import { VypusknikForm } from "@/components/VypusknikForm";
import { ZametkaRow } from "@/components/ZametkaRow";
import { ZametkaForm } from "@/components/ZametkaForm";

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
      vehi: { where: { deletedAt: null }, orderBy: { date: "asc" } },
      budjetZapisi: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
      reklama: { where: { deletedAt: null }, orderBy: { date: "asc" } },
      vypuskniki: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
      zametki: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!sezon) notFound();

  // Роли за столиками и роли команды вне столиков — это два разных списка.
  const allRoles = (
    await prisma.rol.findMany({
      where: { deletedAt: null },
      orderBy: [{ isStandard: "desc" }, { name: "asc" }],
    })
  ).map((r) => ({ id: r.id, name: r.name, isStandard: r.isStandard, scope: r.scope }));
  const stolikRoles = allRoles
    .filter((r) => r.scope === "STOLIK")
    .map((r) => ({ id: r.id, name: r.name, isStandard: r.isStandard }));
  const komandaRoles = allRoles
    .filter((r) => r.scope === "KOMANDA")
    .map((r) => ({ id: r.id, name: r.name, isStandard: r.isStandard }));

  const budjetKategorii = await prisma.budjetKategoriya.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
  const rashodCategories = budjetKategorii.filter((k) => k.tip === "RASHOD").map((k) => k.name);
  const dohodCategories = budjetKategorii.filter((k) => k.tip === "DOHOD").map((k) => k.name);

  const rashodZapisi = sezon.budjetZapisi.filter((z) => z.tip === "RASHOD");
  const dohodZapisi = sezon.budjetZapisi.filter((z) => z.tip === "DOHOD");
  const rashodTotal = rashodZapisi.reduce((sum, z) => sum + z.amount, 0);
  const dohodTotal = dohodZapisi.reduce((sum, z) => sum + z.amount, 0);

  const status = getSezonStatus(sezon.startDate, sezon.endDate);

  return (
    <div className="space-y-8">
      <Link
        href={`/filials/${sezon.filialId}`}
        className="-mx-1.5 -my-1 inline-block rounded-lg px-1.5 py-1 text-sm font-medium text-gray-400 transition-colors hover:text-gray-700"
      >
        ← {sezon.filial.name}
      </Link>

      <SeasonEditor filialId={sezon.filialId} sezon={sezon} status={status} />

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#241A13]">Столики</h2>
        {sezon.stoliki.map((stolik) => (
          <StolikCard
            key={stolik.id}
            sezonId={sezon.id}
            stolik={stolik}
            participants={stolik.uchastniki}
            roles={stolikRoles}
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
        <h2 className="text-lg font-bold text-[#241A13]">Команда вне столиков</h2>
        <p className="text-sm text-gray-500">Медиа, кухня, дети, молитва, музыкальное сопровождение и другие роли.</p>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {sezon.uchastniki.map((participant) => (
            <ParticipantRow
              key={participant.id}
              sezonId={sezon.id}
              stolikId={null}
              roles={komandaRoles}
              participant={participant}
              deleteAction={softDeleteUchastnik.bind(null, participant.id, sezon.id)}
            />
          ))}
          {sezon.uchastniki.length === 0 && <p className="py-1 text-sm text-gray-500">Пока никого нет.</p>}
        </div>
        <ToggleSection closedLabel="+ Добавить участника">
          <UchastnikForm mode="create" sezonId={sezon.id} stolikId={null} roles={komandaRoles} />
        </ToggleSection>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#241A13]">Важные вехи / события сезона</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {sezon.vehi.map((veha) => (
            <VehaRow key={veha.id} sezonId={sezon.id} veha={veha} deleteAction={softDeleteVeha.bind(null, veha.id, sezon.id)} />
          ))}
          {sezon.vehi.length === 0 && <p className="py-1 text-sm text-gray-500">Событий пока нет.</p>}
        </div>
        <ToggleSection closedLabel="+ Добавить событие">
          <VehaForm mode="create" sezonId={sezon.id} />
        </ToggleSection>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#241A13]">Бюджет</h2>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Расходы <span className="font-normal text-gray-500">— итого {rashodTotal.toLocaleString("ru-RU")} ₽</span>
          </h3>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {rashodZapisi.map((z) => (
              <BudjetRow
                key={z.id}
                sezonId={sezon.id}
                tip="RASHOD"
                categories={rashodCategories}
                zapis={z}
                deleteAction={softDeleteBudjetZapis.bind(null, z.id, sezon.id)}
              />
            ))}
            {rashodZapisi.length === 0 && <p className="py-1 text-sm text-gray-500">Расходов пока нет.</p>}
          </div>
          <ToggleSection closedLabel="+ Добавить расход">
            <BudjetForm mode="create" sezonId={sezon.id} tip="RASHOD" categories={rashodCategories} />
          </ToggleSection>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Доходы <span className="font-normal text-gray-500">— итого {dohodTotal.toLocaleString("ru-RU")} ₽</span>
          </h3>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {dohodZapisi.map((z) => (
              <BudjetRow
                key={z.id}
                sezonId={sezon.id}
                tip="DOHOD"
                categories={dohodCategories}
                zapis={z}
                deleteAction={softDeleteBudjetZapis.bind(null, z.id, sezon.id)}
              />
            ))}
            {dohodZapisi.length === 0 && <p className="py-1 text-sm text-gray-500">Доходов пока нет.</p>}
          </div>
          <ToggleSection closedLabel="+ Добавить доход">
            <BudjetForm mode="create" sezonId={sezon.id} tip="DOHOD" categories={dohodCategories} />
          </ToggleSection>
        </div>

        <p className="text-sm font-medium text-gray-700">
          Баланс сезона: {(dohodTotal - rashodTotal).toLocaleString("ru-RU")} ₽
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#241A13]">Рекламная кампания</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {sezon.reklama.map((zapis) => (
            <ReklamaRow
              key={zapis.id}
              sezonId={sezon.id}
              zapis={zapis}
              deleteAction={softDeleteReklama.bind(null, zapis.id, sezon.id)}
            />
          ))}
          {sezon.reklama.length === 0 && <p className="py-1 text-sm text-gray-500">Записей пока нет.</p>}
        </div>
        <ToggleSection closedLabel="+ Добавить запись">
          <ReklamaForm mode="create" sezonId={sezon.id} />
        </ToggleSection>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#241A13]">Выпускники</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {sezon.vypuskniki.map((vypusknik) => (
            <VypusknikRow
              key={vypusknik.id}
              sezonId={sezon.id}
              vypusknik={vypusknik}
              deleteAction={softDeleteVypusknik.bind(null, vypusknik.id, sezon.id)}
            />
          ))}
          {sezon.vypuskniki.length === 0 && <p className="py-1 text-sm text-gray-500">Выпускников пока нет.</p>}
        </div>
        <ToggleSection closedLabel="+ Добавить выпускника">
          <VypusknikForm mode="create" sezonId={sezon.id} />
        </ToggleSection>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#241A13]">Идеи и заметки по событиям</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {sezon.zametki.map((zametka) => (
            <ZametkaRow
              key={zametka.id}
              sezonId={sezon.id}
              zametka={zametka}
              deleteAction={softDeleteZametka.bind(null, zametka.id, sezon.id)}
            />
          ))}
          {sezon.zametki.length === 0 && <p className="py-1 text-sm text-gray-500">Заметок пока нет.</p>}
        </div>
        <ToggleSection closedLabel="+ Добавить заметку">
          <ZametkaForm mode="create" sezonId={sezon.id} />
        </ToggleSection>
      </section>

      <div className="border-t border-gray-200 pt-4">
        <DeleteButton
          action={softDeleteSezonAndGoToFilial.bind(null, sezon.id, sezon.filialId)}
          confirmText={`Удалить сезон «${sezon.name}» со всем его содержимым? Его можно будет восстановить в Корзине.`}
          label="Удалить сезон"
        />
      </div>
    </div>
  );
}
