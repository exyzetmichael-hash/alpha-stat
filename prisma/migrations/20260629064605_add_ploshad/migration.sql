-- CreateTable
CREATE TABLE "presence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "facing" TEXT NOT NULL DEFAULT 'right',
    "emote" TEXT,
    "emoteAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ploshad_message" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ploshad_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "presence_updatedAt_idx" ON "presence"("updatedAt");

-- CreateIndex
CREATE INDEX "ploshad_message_createdAt_idx" ON "ploshad_message"("createdAt");
