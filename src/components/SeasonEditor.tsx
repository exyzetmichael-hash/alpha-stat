"use client";

import { useActionState, useRef, useState } from "react";
import { updateSezon } from "@/lib/actions/sezon";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { EditSwap } from "@/components/motion/EditSwap";
import { EditButton } from "@/components/motion/EditButton";
import { SEZON_STATUS_LABELS, type SezonStatus } from "@/lib/season-status";
import { formatDateRu } from "@/lib/format-date";
import { useDraftAutosave, clearDraft } from "@/lib/use-draft-autosave";

const STATUS_BADGE_CLASS: Record<SezonStatus, string> = {
  upcoming: "bg-amber-100 text-amber-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-600",
};

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function SeasonEditor({
  filialId,
  sezon,
  status,
}: {
  filialId: string;
  sezon: {
    id: string;
    name: string;
    theme: string | null;
    startDate: Date;
    endDate: Date;
    photoUrl: string | null;
    thoughtsNote: string | null;
    nextSeasonNote: string | null;
  };
  status: SezonStatus;
}) {
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const storageKey = `draft:sezon:edit:${sezon.id}`;
  useDraftAutosave(storageKey, formRef, [editing]);
  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await updateSezon(prevState, formData);
    if (!result) {
      clearDraft(storageKey);
      setEditing(false);
    }
    return result;
  }, null);

  return (
    <EditSwap
      editing={editing}
      view={
        <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">{sezon.name}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}>
            {SEZON_STATUS_LABELS[status]}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {formatDateRu(sezon.startDate)} — {formatDateRu(sezon.endDate)}
        </p>
        {sezon.theme && <p className="text-sm text-gray-700">Тема: {sezon.theme}</p>}
        {sezon.photoUrl && (
          <p className="text-sm">
            <a href={sezon.photoUrl} target="_blank" rel="noreferrer" className="text-[#E63946] underline">
              Фото сезона
            </a>
          </p>
        )}
        {sezon.thoughtsNote && (
          <div>
            <p className="text-sm font-medium text-gray-700">Важные мысли/идеи/впечатления от сезона</p>
            <p className="whitespace-pre-wrap text-sm text-gray-600">{sezon.thoughtsNote}</p>
          </div>
        )}
        {sezon.nextSeasonNote && (
          <div>
            <p className="text-sm font-medium text-gray-700">О чём подумать к следующему сезону</p>
            <p className="whitespace-pre-wrap text-sm text-gray-600">{sezon.nextSeasonNote}</p>
          </div>
        )}
        <EditButton onClick={() => setEditing(true)} label="Изменить сезон" />
      </div>
      }
      edit={
        <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <input type="hidden" name="id" value={sezon.id} />
      <input type="hidden" name="filialId" value={filialId} />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Название сезона</label>
        <input
          type="text"
          name="name"
          defaultValue={sezon.name}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Тема сезона</label>
        <input
          type="text"
          name="theme"
          defaultValue={sezon.theme ?? ""}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Начало</label>
          <input
            type="date"
            name="startDate"
            defaultValue={toDateInputValue(sezon.startDate)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Окончание</label>
          <input
            type="date"
            name="endDate"
            defaultValue={toDateInputValue(sezon.endDate)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Ссылка на облачный диск с фото</label>
        <input
          type="url"
          name="photoUrl"
          defaultValue={sezon.photoUrl ?? ""}
          placeholder="https://..."
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Важные мысли/идеи/впечатления от сезона
        </label>
        <textarea
          name="thoughtsNote"
          defaultValue={sezon.thoughtsNote ?? ""}
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">О чём подумать к следующему сезону</label>
        <textarea
          name="nextSeasonNote"
          defaultValue={sezon.nextSeasonNote ?? ""}
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      <FormError message={state?.error} />
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Сохраняю...">Сохранить</SubmitButton>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Отмена
        </button>
      </div>
    </form>
      }
    />
  );
}
