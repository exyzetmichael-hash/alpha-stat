"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { SPRING } from "./transitions";

const MotionLink = motion.create(Link);

// Ссылка с тактильной отдачей: чуть подрастает при наведении и проседает
// при нажатии. Используется в шапке для бренда и пунктов меню.
export function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <MotionLink
      href={href}
      className={className}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={SPRING}
    >
      {children}
    </MotionLink>
  );
}
