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
import { SezonTabs, type SezonTab } from "@/components/SezonTabs";
import { StolikiSearch } from "@/components/StolikiSearch";
import { ToggleSection } from "@/components/ToggleSection";
import { VehaRow } from "@/components/VehaRow";
import { VehaForm } from "@/components/VehaForm";
import { BudjetRow } from "@/components/BudjetRow";
import { BudjetForm } from "@/components/BudjetForm";
import { ReklamaRow } from "@/components/ReklamaRow";
import { ReklamaForm } from "@/components/ReklamaForm";
import { VypuskniySearch } from "@/components/VypuskniySearch";
import { ZametkaRow } from "@/components/ZametkaRow";
import { ZametkaForm } from "@/components/ZametkaForm";
import { ExportLink } from "@/components/ExportLink";
import { formatDateTimeRu } from "@/lib/format-date";

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

  const deleteStolikActions = Object.fromEntries(
    sezon.stoliki.map((s) => [s.id, softDeleteStolik.bind(null, s.id, sezon.id)])
  );
  const deleteParticipantActions = Object.fromEntries(
    [...sezon.stoliki.flatMap((s) => s.uchastniki), ...sezon.uchastniki].map((u) => [
      u.id,
      softDeleteUchastnik.bind(null, u.id, sezon.id),
    ])
  );

  const auditLog = await prisma.auditLog.findMany({
    where: { sezonId: sezon.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const tabs: SezonTab[] = [
    {
      id: "stoliki",
      label: "Столики",
      content: (
        <div className="space-y-3">
          <div className="flex justify-end">
            <ExportLink href={`/api/sezony/${sezon.id}/export/uchastniki`} />
          </div>
          <StolikiSearch
            sezonId={sezon.id}
            stoliki={sezon.stoliki}
            komanda={sezon.uchastniki}
            stolikRoles={stolikRoles}
            komandaRoles={komandaRoles}
            deleteStolikActions={deleteStolikActions}
            deleteParticipantActions={deleteParticipantActions}
          />
        </div>
      ),
    },
    {
      id: "budjet",
      label: "Бюджет",
      content: (
        <section className="space-y-3">
          <div className="flex justify-end">
            <ExportLink href={`/api/sezony/${sezon.id}/export/budjet`} />
          </div>
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
      ),
    },
    {
      id: "vehi",
      label: "Вехи",
      content: (
        <section className="space-y-3">
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
      ),
    },
    {
      id: "reklama",
      label: "Реклама",
      content: (
        <section className="space-y-3">
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
      ),
    },
    {
      id: "vypuskniki",
      label: "Выпускники",
      content: (
        <div className="space-y-3">
          <div className="flex justify-end">
            <ExportLink href={`/api/sezony/${sezon.id}/export/vypuskniki`} />
          </div>
          <VypuskniySearch
            sezonId={sezon.id}
            vypuskniki={sezon.vypuskniki}
            deleteActions={Object.fromEntries(
              sezon.vypuskniki.map((v) => [v.id, softDeleteVypusknik.bind(null, v.id, sezon.id)])
            )}
          />
        </div>
      ),
    },
    {
      id: "idei",
      label: "Идеи",
      content: (
        <section className="space-y-3">
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
      ),
    },
    {
      id: "istoriya",
      label: "История",
      content: (
        <section className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {auditLog.map((entry) => (
              <div key={entry.id} className="border-b border-gray-100 py-2 last:border-none">
                <p className="text-sm text-[#241A13]">{entry.summary}</p>
                <p className="mt-0.5 text-xs text-gray-400">{formatDateTimeRu(entry.createdAt)}</p>
              </div>
            ))}
            {auditLog.length === 0 && <p className="py-1 text-sm text-gray-500">Изменений пока нет.</p>}
          </div>
        </section>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href={`/filials/${sezon.filialId}`}
        className="-mx-1.5 -my-1 inline-block rounded-lg px-1.5 py-1 text-sm font-medium text-gray-400 transition-colors hover:text-gray-700"
      >
        ← {sezon.filial.name}
      </Link>

      <SeasonEditor filialId={sezon.filialId} sezon={sezon} status={status} />

      <SezonTabs tabs={tabs} />

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
