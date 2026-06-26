"use client";

import { motion } from "motion/react";
import { SPRING } from "@/components/motion/transitions";

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={SPRING}
      className="flex h-full flex-col items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white px-4 py-5 text-center shadow-sm will-change-transform"
    >
      <motion.p className="text-3xl font-bold text-[#E63946]" whileHover={{ scale: 1.06 }} transition={SPRING}>
        {value}
      </motion.p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </motion.div>
  );
}
