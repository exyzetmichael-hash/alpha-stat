"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT, SPRING } from "@/components/motion/transitions";
import type { EmoteCode, Facing } from "@/lib/ploshad/types";

// Один человечек на сцене. Позиция задаётся долей x (0..1); по горизонтали едет
// CSS-переходом по left — так присутствие из опроса «доходит» пешком, а не прыгает.
export function Avatar({
  name,
  color,
  x,
  facing,
  sitting,
  walking,
  emote,
  emoteKey,
  bubble,
  isYou,
}: {
  name: string;
  color: string;
  x: number;
  facing: Facing;
  sitting: boolean;
  walking: boolean;
  emote: EmoteCode | null;
  emoteKey: number;
  bubble: string | null;
  isYou: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute bottom-1 flex w-0 flex-col items-center"
      style={{ left: `${x * 100}%`, transition: "left 1.2s linear" }}
    >
      {/* Реплика облачком над головой */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="mb-1 max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis rounded-xl border border-gray-200 bg-white px-2 py-1 text-[11px] leading-tight text-[#241A13] shadow-sm"
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Имя */}
      <span
        className={`mb-0.5 max-w-[80px] truncate text-[10px] font-semibold ${
          isYou ? "text-[#E63946]" : "text-gray-600"
        }`}
      >
        {name}
      </span>

      {/* Фигура: прыжок/дай-пять анимируются отдельным слоем, чтобы не конфликтовать с left */}
      <motion.div
        key={emoteKey}
        animate={emote === "jump" ? { y: [0, -16, 0] } : { y: 0 }}
        transition={emote === "jump" ? { duration: 0.5, ease: EASE_OUT } : SPRING}
        className="relative"
        style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}
      >
        {/* Эмодзи «дай пять» над головой */}
        <AnimatePresence>
          {emote === "highfive" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.4, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: -2 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={SPRING}
              className="absolute -top-4 left-1/2 -translate-x-1/2 text-sm"
              style={{ transform: facing === "left" ? "scaleX(-1) translateX(50%)" : "translateX(-50%)" }}
            >
              🙌
            </motion.span>
          )}
        </AnimatePresence>

        {/* Голова + туловище. При «сидит» слегка опускаем. */}
        <div
          className="flex flex-col items-center"
          style={{ transform: sitting ? "translateY(4px)" : undefined }}
        >
          <div
            className={`h-2.5 w-2.5 rounded-full ${walking ? "ploshad-bob" : ""}`}
            style={{ backgroundColor: color }}
          />
          <div
            className="-mt-0.5 h-4 w-3 rounded-t-full rounded-b-sm"
            style={{ backgroundColor: color, height: sitting ? 11 : 16 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
