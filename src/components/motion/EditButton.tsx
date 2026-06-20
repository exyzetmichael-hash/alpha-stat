"use client";

import { motion } from "motion/react";
import { SPRING } from "./transitions";

// Кнопка «Изменить» с лёгкой отдачей при нажатии.
export function EditButton({ onClick, label = "Изменить" }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={SPRING}
      className="rounded-lg px-1.5 py-1 text-sm text-gray-400 transition-colors hover:text-gray-700"
    >
      {label}
    </motion.button>
  );
}
