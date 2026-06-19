export type SezonStatus = "upcoming" | "active" | "completed";

export const SEZON_STATUS_LABELS: Record<SezonStatus, string> = {
  upcoming: "Предстоящий",
  active: "Активный",
  completed: "Завершённый",
};

export function getSezonStatus(startDate: Date, endDate: Date, now = new Date()): SezonStatus {
  if (now < startDate) return "upcoming";
  if (now > endDate) return "completed";
  return "active";
}
