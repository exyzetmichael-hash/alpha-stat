"use client";

import { MotionConfig } from "motion/react";
import { EASE_OUT } from "./transitions";

// Глобально уважаем системную настройку «уменьшить движение»: для таких
// пользователей Motion сам отключает transform/layout-анимации и оставляет
// только мягкое изменение прозрачности.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: EASE_OUT }}>
      {children}
    </MotionConfig>
  );
}
