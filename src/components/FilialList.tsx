"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { DeleteButton } from "@/components/DeleteButton";
import { EASE_OUT, SPRING_SOFT } from "@/components/motion/transitions";

export type FilialListItem = {
  id: string;
  name: string;
  sezonCount: number;
  deleteAction: () => Promise<void>;
};

export function FilialList({ filials }: { filials: FilialListItem[] }) {
  if (filials.length === 0) {
    return <p className="text-sm text-gray-500">Филиалов пока нет.</p>;
  }

  return (
    <motion.div layout className="space-y-3">
      <AnimatePresence initial={false} mode="popLayout">
        {filials.map((filial, index) => (
          <motion.div
            key={filial.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE_OUT, delay: index * 0.05, layout: SPRING_SOFT }}
            whileHover={{ y: -3 }}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
          >
            <Link href={`/filials/${filial.id}`} className="flex-1">
              <p className="font-semibold text-[#1a1a1a]">{filial.name}</p>
              <p className="text-sm text-gray-500">
                {filial.sezonCount} {filial.sezonCount === 1 ? "сезон" : "сезонов"}
              </p>
            </Link>
            <DeleteButton
              action={filial.deleteAction}
              confirmText={`Удалить филиал «${filial.name}»? Его можно будет восстановить в Корзине.`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
