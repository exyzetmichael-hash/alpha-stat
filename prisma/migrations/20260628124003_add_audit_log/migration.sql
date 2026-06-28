-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "sezonId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_sezonId_createdAt_idx" ON "audit_log"("sezonId", "createdAt");

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_sezonId_fkey" FOREIGN KEY ("sezonId") REFERENCES "sezony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
