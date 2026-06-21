-- AlterTable: роль участника становится списком ролей (можно несколько).
-- Конвертируем тип на месте, сохраняя текущую роль как первый элемент списка.
ALTER TABLE "uchastniki"
  ALTER COLUMN "roleName" TYPE TEXT[]
    USING (CASE WHEN "roleName" IS NULL OR "roleName" = '' THEN '{}'::TEXT[] ELSE ARRAY["roleName"] END);

ALTER TABLE "uchastniki" ALTER COLUMN "roleName" DROP NOT NULL;

ALTER TABLE "uchastniki" RENAME COLUMN "roleName" TO "roleNames";
