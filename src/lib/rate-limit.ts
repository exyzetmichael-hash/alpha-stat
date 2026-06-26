// Простой rate-limit в памяти процесса — без внешних зависимостей (Redis и
// т.п. избыточны для внутреннего инструмента с считанными пользователями).
// На серверless-платформах счётчик живёт только в рамках одного инстанса,
// но это всё равно поднимает порог для подбора пароля/спама обратной связи.
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}
