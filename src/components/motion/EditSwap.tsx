"use client";

import { AnimatePresence, motion } from "motion/react";
import { FADE } from "./transitions";

// Мягкий кроссфейд между режимом просмотра и режимом редактирования строки.
export function EditSwap({
  editing,
  edit,
  view,
}: {
  editing: boolean;
  edit: React.ReactNode;
  view: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={editing ? "edit" : "view"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={FADE}
      >
        {editing ? edit : view}
      </motion.div>
    </AnimatePresence>
  );
}
