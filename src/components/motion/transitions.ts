import type { Transition } from "motion/react";

// Единые тайминги и физика для всех анимаций — чтобы движение по всему
// приложению ощущалось согласованно. Анимируем только transform/opacity (GPU).

// Мягкое затухание «как у Apple» — для появления элементов.
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Основная пружина для жестов (hover/tap) — быстрая и упругая.
export const SPRING: Transition = { type: "spring", stiffness: 400, damping: 30, mass: 0.7 };

// Более мягкая пружина для layout-перестроений (когда соседи сдвигаются).
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 280, damping: 30 };

// Короткое появление/исчезновение (кроссфейды, ошибки форм).
export const FADE: Transition = { duration: 0.18, ease: EASE_OUT };
