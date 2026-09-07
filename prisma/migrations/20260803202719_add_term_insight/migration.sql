-- CreateTable
CREATE TABLE "TermInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "termId" INTEGER NOT NULL,
    "scope" TEXT NOT NULL,
    "df" INTEGER NOT NULL,
    "withTermTotal" INTEGER NOT NULL,
    "withTermInterviewed" INTEGER NOT NULL,
    "withoutTermTotal" INTEGER NOT NULL,
    "withoutTermInterviewed" INTEGER NOT NULL,
    "lift" REAL NOT NULL,
    "wilsonLower" REAL NOT NULL,
    "direction" TEXT NOT NULL,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TermInsight_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TermInsight_scope_direction_idx" ON "TermInsight"("scope", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "TermInsight_termId_scope_key" ON "TermInsight"("termId", "scope");
