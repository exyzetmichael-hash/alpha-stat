"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SPRING } from "@/components/motion/transitions";

export function RestoreButton({ action }: { action: () => Promise<void> }) {
  const [pending, setPending] = useState(false);

  return (
    <motion.button
      type="button"
      disabled={pending}
      whileHover={pending ? undefined : { scale: 1.04 }}
      whileTap={pending ? undefined : { scale: 0.95 }}
      transition={SPRING}
      onClick={async () => {
        setPending(true);
        await action();
        setPending(false);
      }}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
    >
      {pending ? "Восстанавливаю..." : "Восстановить"}
    </motion.button>
  );
}
