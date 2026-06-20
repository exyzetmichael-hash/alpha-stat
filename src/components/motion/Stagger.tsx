"use client";

import { motion, type Variants } from "motion/react";
import { EASE_OUT, SPRING } from "./transitions";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
};

// Контейнер: дети появляются каскадом, по очереди.
export function StaggerList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

// Элемент списка: всплывает снизу; при hover=true — мягко приподнимается.
export function StaggerItem({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      whileHover={hover ? { y: -3 } : undefined}
      transition={SPRING}
    >
      {children}
    </motion.div>
  );
}
