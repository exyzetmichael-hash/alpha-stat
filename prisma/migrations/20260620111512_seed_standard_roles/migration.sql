-- Стандартные роли участников. На Vercel сид (seed.ts) не запускается —
-- выполняется только `prisma migrate deploy`, поэтому стандартные роли
-- заносим в базу миграцией. Идемпотентно: при конфликте по имени роль
-- помечается стандартной и восстанавливается из удалённых.
INSERT INTO "roli" ("id", "name", "isStandard", "createdAt", "deletedAt")
VALUES
  (gen_random_uuid()::text, 'Ведущий', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Помощник', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Участник', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Медиа', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Кухня', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Дети', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Молитва', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Музыкальное сопровождение', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Отпуск', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Лидер', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Помощник (сервис)', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Гость', true, CURRENT_TIMESTAMP, NULL),
  (gen_random_uuid()::text, 'Сопровождающий', true, CURRENT_TIMESTAMP, NULL)
ON CONFLICT ("name") DO UPDATE
  SET "isStandard" = true,
      "deletedAt" = NULL;
