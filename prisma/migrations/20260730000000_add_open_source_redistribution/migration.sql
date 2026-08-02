-- ============================================================
-- 增量迁移: 路径 D 开源合规再分发 (task-0037 落地)
-- 铁律 #283 (默认拒绝) / #284 (不透明主键代理) / #285 (商品溯源无真空)
-- 仅新增 3 张表 + 索引 + FK, 0 改现有 15 张表
-- ============================================================

-- CreateTable: OpenSourceRelease
CREATE TABLE "OpenSourceRelease" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "sourceFileId" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "originalAuthor" TEXT NOT NULL,
    "originalSource" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "originalFileUrl" TEXT,
    "tier" TEXT,
    "requiredPlan" TEXT NOT NULL DEFAULT 'MONTHLY_16',
    "isFeatured" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable: OpenSourceAccessLog
CREATE TABLE "OpenSourceAccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "releaseId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: UpgradeConversion
CREATE TABLE "UpgradeConversion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fromReleaseId" TEXT,
    "toProductId" TEXT NOT NULL,
    "convertedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "OpenSourceRelease_productId_key" ON "OpenSourceRelease"("productId");
CREATE INDEX "OpenSourceRelease_license_idx" ON "OpenSourceRelease"("license");
CREATE INDEX "OpenSourceRelease_originalSource_idx" ON "OpenSourceRelease"("originalSource");
CREATE INDEX "OpenSourceRelease_requiredPlan_idx" ON "OpenSourceRelease"("requiredPlan");
CREATE INDEX "OpenSourceRelease_isFeatured_publishedAt_idx" ON "OpenSourceRelease"("isFeatured", "publishedAt");
CREATE INDEX "OpenSourceRelease_publishedAt_idx" ON "OpenSourceRelease"("publishedAt");

CREATE INDEX "OpenSourceAccessLog_userId_action_idx" ON "OpenSourceAccessLog"("userId", "action");
CREATE INDEX "OpenSourceAccessLog_releaseId_action_idx" ON "OpenSourceAccessLog"("releaseId", "action");
CREATE INDEX "OpenSourceAccessLog_createdAt_idx" ON "OpenSourceAccessLog"("createdAt");

CREATE INDEX "UpgradeConversion_userId_convertedAt_idx" ON "UpgradeConversion"("userId", "convertedAt");
CREATE INDEX "UpgradeConversion_fromReleaseId_idx" ON "UpgradeConversion"("fromReleaseId");
CREATE INDEX "UpgradeConversion_toProductId_idx" ON "UpgradeConversion"("toProductId");

-- AddForeignKey
ALTER TABLE "OpenSourceRelease" ADD CONSTRAINT "OpenSourceRelease_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OpenSourceAccessLog" ADD CONSTRAINT "OpenSourceAccessLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OpenSourceAccessLog" ADD CONSTRAINT "OpenSourceAccessLog_releaseId_fkey"
    FOREIGN KEY ("releaseId") REFERENCES "OpenSourceRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UpgradeConversion" ADD CONSTRAINT "UpgradeConversion_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UpgradeConversion" ADD CONSTRAINT "UpgradeConversion_toProductId_fkey"
    FOREIGN KEY ("toProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;