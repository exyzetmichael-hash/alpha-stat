"use client";

import { useFormStatus } from "react-dom";
import { motion } from "motion/react";
import { SPRING } from "@/components/motion/transitions";

export function SubmitButton({
  children,
  pendingLabel = "Сохраняю...",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileHover={pending ? undefined : { scale: 1.03 }}
      whileTap={pending ? undefined : { scale: 0.96 }}
      transition={SPRING}
      className={`rounded-xl bg-[#E63946] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${className}`}
    >
      {pending ? pendingLabel : children}
    </motion.button>
  );
}
