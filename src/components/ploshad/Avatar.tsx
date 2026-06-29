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

        {/* Фигура-стикмен: голова-кольцо, торс, руки, ноги (прямые или «сидя»). */}
        <StickFigure color={color} sitting={sitting} walking={walking} />
      </motion.div>
    </div>
  );
}

// Шаг ходьбы: руки/ноги качаются вокруг плеча/бедра в противофазе (как при
// реальной походке — левая нога вперёд вместе с правой рукой). Колени/локти
// не сгибаем — стикмен прямой, поэтому покачивание делаем поворотом самой
// линии вокруг её верхней точки.
const WALK_TRANSITION = { duration: 0.55, repeat: Infinity, ease: "easeInOut" } as const;
const limbBox = { transformBox: "view-box" as const };

function StickFigure({
  color,
  sitting,
  walking,
}: {
  color: string;
  sitting: boolean;
  walking: boolean;
}) {
  const legLeft = walking ? { rotate: [18, -18, 18] } : { rotate: 0 };
  const legRight = walking ? { rotate: [-18, 18, -18] } : { rotate: 0 };
  const armLeft = walking ? { rotate: [-14, 14, -14] } : { rotate: 0 };
  const armRight = walking ? { rotate: [14, -14, 14] } : { rotate: 0 };

  return (
    <svg width="16" height="26" viewBox="0 0 16 26" fill="none" className={walking ? "ploshad-bob" : ""}>
      {/* Голова — кольцо без заливки */}
      <circle cx="8" cy="4" r="3" stroke={color} strokeWidth="1.6" />
      {/* Торс */}
      <line x1="8" y1="7" x2="8" y2="16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Руки качаются от плеча (8,10) */}
      <motion.g style={{ ...limbBox, transformOrigin: "8px 10px" }} animate={armLeft} transition={WALK_TRANSITION}>
        <line x1="8" y1="10" x2="3" y2="14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
      <motion.g style={{ ...limbBox, transformOrigin: "8px 10px" }} animate={armRight} transition={WALK_TRANSITION}>
        <line x1="8" y1="10" x2="13" y2="14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
      {/* Ноги: сидя — колено вперёд (статично); иначе качаются от бедра (8,16) */}
      {sitting ? (
        <>
          <line x1="8" y1="16" x2="4" y2="18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="4" y1="18" x2="4" y2="23" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="8" y1="16" x2="12" y2="18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="12" y1="18" x2="12" y2="23" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <motion.g style={{ ...limbBox, transformOrigin: "8px 16px" }} animate={legLeft} transition={WALK_TRANSITION}>
            <line x1="8" y1="16" x2="4" y2="23" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          </motion.g>
          <motion.g style={{ ...limbBox, transformOrigin: "8px 16px" }} animate={legRight} transition={WALK_TRANSITION}>
            <line x1="8" y1="16" x2="12" y2="23" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          </motion.g>
        </>
      )}
    </svg>
  );
}
