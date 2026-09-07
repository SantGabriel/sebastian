-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descriptionHash" TEXT NOT NULL,
    "descriptionText" TEXT NOT NULL,
    "normalizedLength" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "tituloKey" TEXT NOT NULL,
    "companyId" TEXT,
    "lang" TEXT,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seenCount" INTEGER NOT NULL DEFAULT 1,
    "discardedAt" DATETIME,
    "discardReason" TEXT,
    "tokenizerVersion" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "JobPosting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceJobId" TEXT NOT NULL,
    "postingId" TEXT NOT NULL,
    "companyId" TEXT,
    "titulo" TEXT NOT NULL,
    "tituloKey" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'pt',
    "link" TEXT,
    "modalidade" TEXT,
    "contratacao" TEXT,
    "cidadeVaga" TEXT,
    "candidaturaAviso" TEXT,
    "candidaturaUrl" TEXT,
    "fit" JSONB NOT NULL,
    "fitScore" REAL,
    "cv" JSONB,
    "cl" JSONB,
    "candidate" JSONB NOT NULL,
    "appliedAt" DATETIME NOT NULL,
    "currentStage" TEXT NOT NULL DEFAULT 'CURRICULO',
    "currentStageAt" DATETIME NOT NULL,
    "outcome" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "rejectionReason" TEXT,
    "notes" TEXT,
    "tokenizerVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "JobPosting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StageEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StageEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "relPath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Term" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "n" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PostingTerm" (
    "postingId" TEXT NOT NULL,
    "termId" INTEGER NOT NULL,
    "tf" INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY ("postingId", "termId"),
    CONSTRAINT "PostingTerm_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "JobPosting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostingTerm_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApplicationTerm" (
    "applicationId" TEXT NOT NULL,
    "termId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "tf" INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY ("applicationId", "termId", "source"),
    CONSTRAINT "ApplicationTerm_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApplicationTerm_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_nameKey_key" ON "Company"("nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_descriptionHash_key" ON "JobPosting"("descriptionHash");

-- CreateIndex
CREATE INDEX "JobPosting_tituloKey_idx" ON "JobPosting"("tituloKey");

-- CreateIndex
CREATE INDEX "JobPosting_companyId_idx" ON "JobPosting"("companyId");

-- CreateIndex
CREATE INDEX "JobPosting_lastSeenAt_idx" ON "JobPosting"("lastSeenAt");

-- CreateIndex
CREATE INDEX "JobPosting_discardedAt_idx" ON "JobPosting"("discardedAt");

-- CreateIndex
CREATE INDEX "Application_appliedAt_idx" ON "Application"("appliedAt");

-- CreateIndex
CREATE INDEX "Application_currentStage_idx" ON "Application"("currentStage");

-- CreateIndex
CREATE INDEX "Application_currentStageAt_idx" ON "Application"("currentStageAt");

-- CreateIndex
CREATE INDEX "Application_outcome_idx" ON "Application"("outcome");

-- CreateIndex
CREATE INDEX "Application_tituloKey_idx" ON "Application"("tituloKey");

-- CreateIndex
CREATE INDEX "Application_companyId_idx" ON "Application"("companyId");

-- CreateIndex
CREATE INDEX "Application_postingId_idx" ON "Application"("postingId");

-- CreateIndex
CREATE INDEX "Application_sourceJobId_idx" ON "Application"("sourceJobId");

-- CreateIndex
CREATE INDEX "StageEvent_applicationId_occurredAt_idx" ON "StageEvent"("applicationId", "occurredAt");

-- CreateIndex
CREATE INDEX "StageEvent_stage_idx" ON "StageEvent"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "Document_relPath_key" ON "Document"("relPath");

-- CreateIndex
CREATE INDEX "Document_applicationId_idx" ON "Document"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_applicationId_kind_version_key" ON "Document"("applicationId", "kind", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Term_text_key" ON "Term"("text");

-- CreateIndex
CREATE INDEX "Term_n_idx" ON "Term"("n");

-- CreateIndex
CREATE INDEX "PostingTerm_termId_idx" ON "PostingTerm"("termId");

-- CreateIndex
CREATE INDEX "ApplicationTerm_termId_source_idx" ON "ApplicationTerm"("termId", "source");
