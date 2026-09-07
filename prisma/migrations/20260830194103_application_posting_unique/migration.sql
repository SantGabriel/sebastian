-- DropIndex
DROP INDEX "Application_postingId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Application_postingId_key" ON "Application"("postingId");
