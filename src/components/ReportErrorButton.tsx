"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { sendErrorReport } from "@/lib/actions/feedback";
import type { ActionState } from "@/lib/actions/filial";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { EASE_OUT, SPRING } from "@/components/motion/transitions";

export function ReportErrorButton() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState<ActionState, FormData>(async (prevState, formData) => {
    const result = await sendErrorReport(prevState, formData);
    if (!result) {
      formRef.current?.reset();
      setSent(true);
    }
    return result;
  }, null);

  // Прячем форму через пару секунд после успешной отправки.
  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => {
      setSent(false);
      setOpen(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [sent]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!open ? (
        <motion.button
          key="trigger"
          type="button"
          onClick={() => setOpen(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={SPRING}
          className="text-sm text-gray-400 underline-offset-2 transition-colors hover:text-[#E63946] hover:underline"
        >
          Сообщить об ошибке
        </motion.button>
      ) : (
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="mx-auto w-full max-w-md space-y-2 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.p
                key="sent"
                role="status"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="text-sm font-medium text-green-700"
              >
                Отправлено, спасибо! Мы разберёмся.
              </motion.p>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                action={formAction}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">Что случилось?</label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Опишите проблему: что вы делали и что пошло не так"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
                />
                <input type="hidden" name="pageUrl" value={pathname} />
                <FormError message={state?.error} />
                <div className="flex items-center gap-2">
                  <SubmitButton pendingLabel="Отправляю...">Отправить</SubmitButton>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-1.5 py-1 text-sm text-gray-400 transition-colors hover:text-gray-600"
                  >
                    Отмена
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
