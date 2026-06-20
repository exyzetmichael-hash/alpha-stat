import { useEffect, type RefObject } from "react";

type DraftField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isDraftField(element: Element): element is DraftField {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
}

function setNativeValue(element: DraftField, value: string) {
  element.value = value;
  const eventType = element instanceof HTMLSelectElement ? "change" : "input";
  element.dispatchEvent(new Event(eventType, { bubbles: true }));
}

export function clearDraft(storageKey: string) {
  localStorage.removeItem(storageKey);
}

// Сохраняет вводимые данные формы в localStorage с debounce и восстанавливает
// их при повторном открытии — чтобы короткий обрыв связи (5-15 сек) не стирал
// уже введённый текст (см. ТЗ 6.1/8.6). Полей с type="hidden" не трогаем —
// это защищает скрытые id/sezonId от случайной перезаписи устаревшим черновиком.
//
// extraDeps нужен для форм, которые не размонтируются при переключении
// режима показа (например, SeasonEditor показывает то просмотр, то форму
// в одном компоненте) — без этого эффект не перезапустится, когда <form>
// реально появляется в DOM, и восстановление черновика не сработает.
export function useDraftAutosave(
  storageKey: string,
  formRef: RefObject<HTMLFormElement | null>,
  extraDeps: ReadonlyArray<unknown> = []
) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    let draft: Record<string, string>;
    try {
      draft = JSON.parse(raw);
    } catch {
      return;
    }

    const fill = () => {
      for (const element of Array.from(form.elements)) {
        if (!isDraftField(element) || element instanceof HTMLInputElement && element.type === "hidden") continue;
        if (!element.name || !(element.name in draft)) continue;
        setNativeValue(element, draft[element.name]);
      }
    };

    fill();
    // Выбор select'а (например, роль "Другое...") может условно показать
    // дополнительное текстовое поле только на следующем тике рендера —
    // повторяем заполнение, чтобы восстановить и его.
    setTimeout(fill, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formRef, storageKey, ...extraDeps]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const save = () => {
      const data: Record<string, string> = {};
      for (const element of Array.from(form.elements)) {
        if (!isDraftField(element) || (element instanceof HTMLInputElement && element.type === "hidden")) continue;
        if (!element.name) continue;
        data[element.name] = element.value;
      }
      const hasContent = Object.values(data).some((value) => value !== "");
      if (hasContent) {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } else {
        localStorage.removeItem(storageKey);
      }
    };

    const scheduleSave = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(save, 1200);
    };

    form.addEventListener("input", scheduleSave);
    form.addEventListener("change", scheduleSave);

    return () => {
      if (timeout) clearTimeout(timeout);
      form.removeEventListener("input", scheduleSave);
      form.removeEventListener("change", scheduleSave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formRef, storageKey, ...extraDeps]);
}
