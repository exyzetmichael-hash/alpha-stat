// Статичная «сцена» площади и общие константы. Реквизит — чистая косметика,
// в БД не хранится: позиции фиксированы и одинаковы для всех.

export type Prop = {
  type: "bench" | "tree" | "lamp";
  x: number; // 0..1 вдоль сцены
};

// Декор площади. Лавки — это ещё и «места», рядом с которыми человечек присаживается.
export const PROPS: Prop[] = [
  { type: "tree", x: 0.08 },
  { type: "bench", x: 0.24 },
  { type: "lamp", x: 0.42 },
  { type: "tree", x: 0.6 },
  { type: "bench", x: 0.74 },
  { type: "tree", x: 0.93 },
];

// Куда можно «присесть» (доли x лавок) и насколько близко для этого нужно стоять.
export const BENCH_XS = PROPS.filter((p) => p.type === "bench").map((p) => p.x);
export const SIT_THRESHOLD = 0.04; // если стоишь ближе и не двигаешься — садишься

// Тайминги опроса и «свежести». Опрос вместо WebSocket: компромисс — задержка до ~2 с.
export const POLL_INTERVAL_MS = 1500; // как часто шлём heartbeat
export const PEER_FRESH_MS = 15000; // кого считаем «онлайн»
export const EMOTE_PLAY_MS = 1800; // как долго проигрывается эмоция
export const BUBBLE_VISIBLE_MS = 5000; // как долго реплика висит облачком над головой
export const MAX_MESSAGE_LEN = 200;

// Шаг перемещения стрелками (доля ширины сцены за нажатие).
export const STEP = 0.06;
