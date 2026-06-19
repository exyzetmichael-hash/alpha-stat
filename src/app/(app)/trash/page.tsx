import { prisma } from "@/lib/db";
import { restoreFilial } from "@/lib/actions/filial";
import { restoreSezon } from "@/lib/actions/sezon";
import { restoreStolik } from "@/lib/actions/stolik";
import { restoreUchastnik } from "@/lib/actions/uchastnik";
import { RestoreButton } from "@/components/RestoreButton";

function TrashRow({ title, subtitle, action }: { title: string; subtitle?: string; action: () => Promise<void> }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div>
        <p className="font-medium text-[#1a1a1a]">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <RestoreButton action={action} />
    </div>
  );
}

export default async function TrashPage() {
  const [filials, sezony, stoliki, uchastniki] = await Promise.all([
    prisma.filial.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } }),
    prisma.sezon.findMany({
      where: { deletedAt: { not: null } },
      include: { filial: true },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.stolik.findMany({
      where: { deletedAt: { not: null } },
      include: { sezon: { include: { filial: true } } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.uchastnik.findMany({
      where: { deletedAt: { not: null } },
      include: { sezon: { include: { filial: true } }, stolik: true },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  const isEmpty =
    filials.length === 0 && sezony.length === 0 && stoliki.length === 0 && uchastniki.length === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">Корзина</h1>
      <p className="text-sm text-gray-500">
        Здесь лежит всё, что было удалено. Ничего не пропадает навсегда — нажмите «Восстановить», чтобы вернуть
        запись.
      </p>

      {isEmpty && <p className="text-sm text-gray-500">Корзина пуста.</p>}

      {filials.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Филиалы</h2>
          {filials.map((f) => (
            <TrashRow key={f.id} title={f.name} action={restoreFilial.bind(null, f.id)} />
          ))}
        </section>
      )}

      {sezony.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Сезоны</h2>
          {sezony.map((s) => (
            <TrashRow
              key={s.id}
              title={s.name}
              subtitle={s.filial.name}
              action={restoreSezon.bind(null, s.id, s.filialId)}
            />
          ))}
        </section>
      )}

      {stoliki.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Столики</h2>
          {stoliki.map((st) => (
            <TrashRow
              key={st.id}
              title={st.name}
              subtitle={`${st.sezon.filial.name} · ${st.sezon.name}`}
              action={restoreStolik.bind(null, st.id, st.sezonId)}
            />
          ))}
        </section>
      )}

      {uchastniki.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Участники</h2>
          {uchastniki.map((u) => (
            <TrashRow
              key={u.id}
              title={`${u.name} — ${u.roleName}`}
              subtitle={`${u.sezon.filial.name} · ${u.sezon.name}${u.stolik ? ` · ${u.stolik.name}` : ""}`}
              action={restoreUchastnik.bind(null, u.id, u.sezonId)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
