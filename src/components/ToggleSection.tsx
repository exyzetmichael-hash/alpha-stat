"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT, SPRING } from "@/components/motion/transitions";

export function ToggleSection({
  closedLabel,
  openLabel = "Свернуть",
  children,
}: {
  closedLabel: string;
  openLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AnimatePresence initial={false} mode="wait">
      {open ? (
        <motion.div
          key="open"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="overflow-hidden"
        >
          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            {children}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-1.5 py-1 text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              {openLabel}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="closed"
          type="button"
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={SPRING}
          className="rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-[#E63946]/40 hover:text-[#E63946]"
        >
          {closedLabel}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
