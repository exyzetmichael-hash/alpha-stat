"use client";

import { useState } from "react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { SEZON_STATUS_LABELS, type SezonStatus } from "@/lib/season-status";

export type SeasonListItem = {
  id: string;
  name: string;
  status: SezonStatus;
  dateRangeLabel: string;
  deleteAction: () => Promise<void>;
};

const FILTERS: Array<{ key: "all" | SezonStatus; label: string }> = [
  { key: "all", label: "Все" },
  { key: "active", label: "Активные" },
  { key: "upcoming", label: "Предстоящие" },
  { key: "completed", label: "Завершённые" },
];

const STATUS_BADGE_CLASS: Record<SezonStatus, string> = {
  upcoming: "bg-amber-100 text-amber-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-600",
};

export function SeasonList({ seasons }: { seasons: SeasonListItem[] }) {
  const [filter, setFilter] = useState<"all" | SezonStatus>("all");
  const visible = filter === "all" ? seasons : seasons.filter((s) => s.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === f.key ? "bg-[#E63946] text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((season) => (
          <div
            key={season.id}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
          >
            <Link href={`/sezony/${season.id}`} className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#1a1a1a]">{season.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[season.status]}`}>
                  {SEZON_STATUS_LABELS[season.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500">{season.dateRangeLabel}</p>
            </Link>
            <DeleteButton
              action={season.deleteAction}
              confirmText={`Удалить сезон «${season.name}»? Его можно будет восстановить в Корзине.`}
            />
          </div>
        ))}

        {visible.length === 0 && <p className="text-sm text-gray-500">Нет сезонов в этом фильтре.</p>}
      </div>
    </div>
  );
}
