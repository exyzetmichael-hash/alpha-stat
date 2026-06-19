-- CreateEnum
CREATE TYPE "BudjetTip" AS ENUM ('RASHOD', 'DOHOD');

-- CreateTable
CREATE TABLE "vehi" (
    "id" TEXT NOT NULL,
    "sezonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "participantCount" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vehi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budjet_kategorii" (
    "id" TEXT NOT NULL,
    "tip" "BudjetTip" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "budjet_kategorii_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budjet_zapisi" (
    "id" TEXT NOT NULL,
    "sezonId" TEXT NOT NULL,
    "tip" "BudjetTip" NOT NULL,
    "categoryName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "budjet_zapisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reklama" (
    "id" TEXT NOT NULL,
    "sezonId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "materialsNote" TEXT,
    "effectivenessNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "reklama_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vypuskniki" (
    "id" TEXT NOT NULL,
    "sezonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "statusRightAfter" TEXT,
    "statusSixMonths" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vypuskniki_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zametki" (
    "id" TEXT NOT NULL,
    "sezonId" TEXT NOT NULL,
    "details" TEXT,
    "idea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "zametki_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budjet_kategorii_tip_name_key" ON "budjet_kategorii"("tip", "name");

-- AddForeignKey
ALTER TABLE "vehi" ADD CONSTRAINT "vehi_sezonId_fkey" FOREIGN KEY ("sezonId") REFERENCES "sezony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budjet_zapisi" ADD CONSTRAINT "budjet_zapisi_sezonId_fkey" FOREIGN KEY ("sezonId") REFERENCES "sezony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reklama" ADD CONSTRAINT "reklama_sezonId_fkey" FOREIGN KEY ("sezonId") REFERENCES "sezony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vypuskniki" ADD CONSTRAINT "vypuskniki_sezonId_fkey" FOREIGN KEY ("sezonId") REFERENCES "sezony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zametki" ADD CONSTRAINT "zametki_sezonId_fkey" FOREIGN KEY ("sezonId") REFERENCES "sezony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
