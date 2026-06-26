"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CHANGELOG, LATEST_CHANGELOG_ID } from "@/lib/changelog";
import { EASE_OUT, SPRING } from "@/components/motion/transitions";

const SEEN_STORAGE_KEY = "changelog:lastSeen";

// «Непрочитанность» обновлений живёт в localStorage — читаем её через
// useSyncExternalStore, чтобы не было рассинхрона при гидрации и не приходилось
// синхронно вызывать setState в эффекте.
const seenListeners = new Set<() => void>();

function subscribeSeen(callback: () => void) {
  seenListeners.add(callback);
  return () => seenListeners.delete(callback);
}

function hasUnseenSnapshot(): boolean {
  try {
    return localStorage.getItem(SEEN_STORAGE_KEY) !== LATEST_CHANGELOG_ID;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, LATEST_CHANGELOG_ID);
  } catch {
    // не критично, если localStorage недоступен
  }
  seenListeners.forEach((listener) => listener());
}

// Круглая кнопка «i» в углу экрана: открывает список последних обновлений.
// Пока пользователь не открыл свежее обновление — на кнопке горит точка.
export function WhatsNewButton() {
  const [open, setOpen] = useState(false);
  // На сервере и при первой гидрации точку не показываем (false), затем
  // useSyncExternalStore сам подтянет реальное значение из localStorage.
  const hasUnseen = useSyncExternalStore(subscribeSeen, hasUnseenSnapshot, () => false);

  // Закрытие по Esc, когда панель открыта.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleOpen() {
    setOpen(true);
    markSeen();
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={handleOpen}
        aria-label="Что нового"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={SPRING}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-semibold text-[#E63946] shadow-md shadow-black/5 transition-colors hover:border-[#E63946]/40"
      >
        <span aria-hidden className="font-serif italic">
          i
        </span>
        {hasUnseen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRING}
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#E63946]"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Что нового"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="text-lg font-bold text-[#241A13]">Что нового</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                  className="-mr-1.5 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5 overflow-y-auto px-5 py-4">
                {CHANGELOG.map((entry) => (
                  <section key={entry.date} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {entry.dateLabel}
                    </p>
                    <ul className="space-y-1.5">
                      {entry.items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span aria-hidden className="mt-0.5 shrink-0 text-[#E63946]">
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
