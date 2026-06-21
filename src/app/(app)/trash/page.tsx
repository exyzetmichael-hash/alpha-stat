import { prisma } from "@/lib/db";
import { restoreFilial, hardDeleteFilial } from "@/lib/actions/filial";
import { restoreSezon, hardDeleteSezon } from "@/lib/actions/sezon";
import { restoreStolik } from "@/lib/actions/stolik";
import { restoreUchastnik } from "@/lib/actions/uchastnik";
import { restoreVeha } from "@/lib/actions/veha";
import { restoreBudjetZapis } from "@/lib/actions/budjet";
import { restoreReklama } from "@/lib/actions/reklama";
import { restoreVypusknik } from "@/lib/actions/vypusknik";
import { restoreZametka } from "@/lib/actions/zametka";
import { RestoreButton } from "@/components/RestoreButton";
import { DeleteButton } from "@/components/DeleteButton";
import { formatDateRu } from "@/lib/format-date";

// Корзина читает из базы по запросу, а не статически на этапе сборки —
// иначе сборке нужна живая база данных.
export const dynamic = "force-dynamic";

function TrashRow({
  title,
  subtitle,
  action,
  hardDeleteAction,
  hardDeleteConfirm,
}: {
  title: string;
  subtitle?: string;
  action: () => Promise<void>;
  hardDeleteAction?: () => Promise<void>;
  hardDeleteConfirm?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div>
        <p className="font-medium text-[#1a1a1a]">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <RestoreButton action={action} />
        {hardDeleteAction && (
          <DeleteButton
            action={hardDeleteAction}
            confirmText={hardDeleteConfirm ?? "Удалить навсегда? Это действие нельзя отменить."}
            label="Удалить навсегда"
          />
        )}
      </div>
    </div>
  );
}

export default async function TrashPage() {
  const [filials, sezony, stoliki, uchastniki, vehi, budjetZapisi, reklama, vypuskniki, zametki] = await Promise.all([
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
    prisma.veha.findMany({
      where: { deletedAt: { not: null } },
      include: { sezon: { include: { filial: true } } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.budjetZapis.findMany({
      where: { deletedAt: { not: null } },
      include: { sezon: { include: { filial: true } } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.reklama.findMany({
      where: { deletedAt: { not: null } },
      include: { sezon: { include: { filial: true } } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.vypusknik.findMany({
      where: { deletedAt: { not: null } },
      include: { sezon: { include: { filial: true } } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.zametka.findMany({
      where: { deletedAt: { not: null } },
      include: { sezon: { include: { filial: true } } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  const isEmpty =
    filials.length === 0 &&
    sezony.length === 0 &&
    stoliki.length === 0 &&
    uchastniki.length === 0 &&
    vehi.length === 0 &&
    budjetZapisi.length === 0 &&
    reklama.length === 0 &&
    vypuskniki.length === 0 &&
    zametki.length === 0;

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
            <TrashRow
              key={f.id}
              title={f.name}
              action={restoreFilial.bind(null, f.id)}
              hardDeleteAction={hardDeleteFilial.bind(null, f.id)}
              hardDeleteConfirm={`Удалить филиал «${f.name}» навсегда вместе со всеми его сезонами, участниками и бюджетом? Это действие нельзя отменить.`}
            />
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
              hardDeleteAction={hardDeleteSezon.bind(null, s.id, s.filialId)}
              hardDeleteConfirm={`Удалить сезон «${s.name}» навсегда вместе со всеми участниками и бюджетом? Это действие нельзя отменить.`}
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
              title={u.roleNames.length > 0 ? `${u.name} — ${u.roleNames.join(", ")}` : u.name}
              subtitle={`${u.sezon.filial.name} · ${u.sezon.name}${u.stolik ? ` · ${u.stolik.name}` : ""}`}
              action={restoreUchastnik.bind(null, u.id, u.sezonId)}
            />
          ))}
        </section>
      )}

      {vehi.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Вехи / события сезона</h2>
          {vehi.map((v) => (
            <TrashRow
              key={v.id}
              title={`${v.name} — ${formatDateRu(v.date)}`}
              subtitle={`${v.sezon.filial.name} · ${v.sezon.name}`}
              action={restoreVeha.bind(null, v.id, v.sezonId)}
            />
          ))}
        </section>
      )}

      {budjetZapisi.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Бюджет</h2>
          {budjetZapisi.map((z) => (
            <TrashRow
              key={z.id}
              title={`${z.categoryName} — ${z.amount.toLocaleString("ru-RU")} ₽`}
              subtitle={`${z.sezon.filial.name} · ${z.sezon.name}`}
              action={restoreBudjetZapis.bind(null, z.id, z.sezonId)}
            />
          ))}
        </section>
      )}

      {reklama.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Рекламная кампания</h2>
          {reklama.map((r) => (
            <TrashRow
              key={r.id}
              title={`${formatDateRu(r.date)} — ${r.action}`}
              subtitle={`${r.sezon.filial.name} · ${r.sezon.name}`}
              action={restoreReklama.bind(null, r.id, r.sezonId)}
            />
          ))}
        </section>
      )}

      {vypuskniki.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Выпускники</h2>
          {vypuskniki.map((v) => (
            <TrashRow
              key={v.id}
              title={v.name}
              subtitle={`${v.sezon.filial.name} · ${v.sezon.name}`}
              action={restoreVypusknik.bind(null, v.id, v.sezonId)}
            />
          ))}
        </section>
      )}

      {zametki.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Идеи и заметки</h2>
          {zametki.map((z) => (
            <TrashRow
              key={z.id}
              title={z.details || z.idea || "Заметка"}
              subtitle={`${z.sezon.filial.name} · ${z.sezon.name}`}
              action={restoreZametka.bind(null, z.id, z.sezonId)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
