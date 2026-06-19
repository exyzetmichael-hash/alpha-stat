-- CreateTable
CREATE TABLE "filials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "filials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sezony" (
    "id" TEXT NOT NULL,
    "filialId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "photoUrl" TEXT,
    "thoughtsNote" TEXT,
    "nextSeasonNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "sezony_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stoliki" (
    "id" TEXT NOT NULL,
    "sezonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "stoliki_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roli" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uchastniki" (
    "id" TEXT NOT NULL,
    "sezonId" TEXT NOT NULL,
    "stolikId" TEXT,
    "name" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "uchastniki_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roli_name_key" ON "roli"("name");

-- AddForeignKey
ALTER TABLE "sezony" ADD CONSTRAINT "sezony_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stoliki" ADD CONSTRAINT "stoliki_sezonId_fkey" FOREIGN KEY ("sezonId") REFERENCES "sezony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uchastniki" ADD CONSTRAINT "uchastniki_sezonId_fkey" FOREIGN KEY ("sezonId") REFERENCES "sezony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uchastniki" ADD CONSTRAINT "uchastniki_stolikId_fkey" FOREIGN KEY ("stolikId") REFERENCES "stoliki"("id") ON DELETE SET NULL ON UPDATE CASCADE;
