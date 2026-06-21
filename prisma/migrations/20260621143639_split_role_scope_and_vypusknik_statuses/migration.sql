-- CreateEnum
CREATE TYPE "RolScope" AS ENUM ('STOLIK', 'KOMANDA');

-- AlterTable: добавляем область применения роли (по умолчанию — команда вне столиков)
ALTER TABLE "roli" ADD COLUMN     "scope" "RolScope" NOT NULL DEFAULT 'KOMANDA';

-- Помечаем стандартные роли, которые относятся к столикам. Идемпотентно:
-- на Vercel сид не запускается, поэтому раскладку по областям задаёт миграция.
UPDATE "roli" SET "scope" = 'STOLIK'
WHERE "name" IN ('Лидер', 'Помощник', 'Помощник (сервис)', 'Гость', 'Сопровождающий');

-- AlterTable: статусы выпускников становятся списками (можно отметить несколько).
-- Конвертируем тип на месте, сохраняя уже введённые значения как один элемент списка.
ALTER TABLE "vypuskniki"
  ALTER COLUMN "statusRightAfter" TYPE TEXT[]
    USING (CASE WHEN "statusRightAfter" IS NULL OR "statusRightAfter" = '' THEN '{}'::TEXT[] ELSE ARRAY["statusRightAfter"] END);

ALTER TABLE "vypuskniki"
  ALTER COLUMN "statusSixMonths" TYPE TEXT[]
    USING (CASE WHEN "statusSixMonths" IS NULL OR "statusSixMonths" = '' THEN '{}'::TEXT[] ELSE ARRAY["statusSixMonths"] END);
