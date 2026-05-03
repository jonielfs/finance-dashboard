-- 1. Adiciona a coluna
-- evita erro se já existir
-- no postgresql local, pode executar via
-- npx prisma db execute --file database/002_add_start_month.sql --schema=prisma/schema.prisma

ALTER TABLE "Purchase"
ADD COLUMN IF NOT EXISTS "startMonth" TIMESTAMP;

-- 2. Migra os dados existentes
UPDATE "Purchase"
SET "startMonth" = DATE_TRUNC('month', "purchaseDate")
WHERE "startMonth" IS NULL;

-- 3. Garante que não fique nulo
ALTER TABLE "Purchase"
ALTER COLUMN "startMonth" SET NOT NULL;

ALTER TABLE "Purchase"
DROP COLUMN IF EXISTS "purchaseDate";