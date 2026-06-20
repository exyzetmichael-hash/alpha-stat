"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { EASE_OUT } from "./transitions";

// Плавное появление содержимого при каждом переходе между страницами.
// Ключ по pathname перемонтирует блок на навигации, заново проигрывая вход.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
