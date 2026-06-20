"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/components/motion/transitions";

export function FormError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          key={message}
          role="alert"
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="overflow-hidden text-sm text-red-600"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
