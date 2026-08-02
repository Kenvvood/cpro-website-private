-- ============================================================
-- 增量迁移: 投研研报 (Phase 6.2 教程内容引擎)
-- 新增 1 张表 + 1 个 enum, 0 改现有 18 张表
-- ============================================================

-- CreateEnum
CREATE TABLE "TutorialStatus_new" (
  "DRAFT" TEXT NOT NULL,
  "PUBLISHED" TEXT NOT NULL,
  "ARCHIVED" TEXT NOT NULL,
  PRIMARY KEY ("DRAFT")
);

-- CreateTable: OpenSourceTutorial
CREATE TABLE "OpenSourceTutorial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "releaseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "marketRegime" TEXT NOT NULL,
    "symbols" TEXT,
    "timeframe" TEXT,
    "riskLevel" TEXT NOT NULL,
    "maxDrawdownPct" DECIMAL,
    "riskWarnings" TEXT NOT NULL,
    "keyParameters" TEXT NOT NULL,
    "strategyLogic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "productCta" TEXT,
    "author" TEXT NOT NULL DEFAULT 'CProTrading 投研团队',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OpenSourceTutorial_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "OpenSourceRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OpenSourceTutorial_releaseId_key" ON "OpenSourceTutorial"("releaseId");
CREATE UNIQUE INDEX "OpenSourceTutorial_slug_key" ON "OpenSourceTutorial"("slug");
CREATE INDEX "OpenSourceTutorial_status_publishedAt_idx" ON "OpenSourceTutorial"("status", "publishedAt");
CREATE INDEX "OpenSourceTutorial_riskLevel_idx" ON "OpenSourceTutorial"("riskLevel");