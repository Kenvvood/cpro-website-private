-- Phase 1: all CREATE TABLE (no FK)
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "wechatOpenid" TEXT,
    "wechatUnionid" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "kycVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycDocUrl" TEXT,
    "totalSpent" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startAt" DATETIME NOT NULL,
    "expireAt" DATETIME NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "paidAmount" DECIMAL NOT NULL,
    "paymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membership_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDT',
    "channel" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "txHash" TEXT,
    "blockNumber" BIGINT,
    "plan" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "confirmedAt" DATETIME,
    "failedAt" DATETIME,
    "refundedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Refund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "txHash" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "ex5Url" TEXT,
    "ex4Url" TEXT,
    "version" TEXT,
    "requiredPlan" TEXT NOT NULL DEFAULT 'FREE_TRIAL',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "rating" DECIMAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT,
    "score" INTEGER,
    "positioning" TEXT,
    "productHighlights" TEXT,
    "algorithmicCore" TEXT,
    "practicalApplication" TEXT,
    "riskControl" TEXT,
    "subcategory" TEXT,
    "capabilityTags" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "DownloadRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "downloadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DownloadRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DownloadRecord_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "dimensions" TEXT,
    "content" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ReviewReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "reward" TEXT NOT NULL DEFAULT 'PRO_7DAYS',
    "rewardSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Referral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "author" TEXT DEFAULT 'CPro Trading',
    "fileUrl" TEXT NOT NULL,
    "icon" TEXT,
    "isRunnable" BOOLEAN NOT NULL DEFAULT true,
    "requiresMT5" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "parameters" TEXT,
    "dependencies" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "EAConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "configJson" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "EAConfigModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eaConfigId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "parameters" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "EAConfigModule_eaConfigId_fkey" FOREIGN KEY ("eaConfigId") REFERENCES "EAConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EAConfigModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "EARunSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eaConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "runMode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "initialCapital" REAL,
    "totalPnl" REAL NOT NULL DEFAULT 0,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winRate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EARunSession_eaConfigId_fkey" FOREIGN KEY ("eaConfigId") REFERENCES "EAConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "EARunLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "moduleName" TEXT,
    "message" TEXT NOT NULL,
    CONSTRAINT "EARunLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "EARunSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "EAPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "volume" REAL NOT NULL,
    "openPrice" REAL NOT NULL,
    "currentPrice" REAL NOT NULL DEFAULT 0,
    "stopLoss" REAL,
    "takeProfit" REAL,
    "pnl" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    CONSTRAINT "EAPosition_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "EARunSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OpenSourceRelease_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "OpenSourceAccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "releaseId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OpenSourceAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OpenSourceAccessLog_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "OpenSourceRelease" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "UpgradeConversion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fromReleaseId" TEXT,
    "toProductId" TEXT NOT NULL,
    "convertedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UpgradeConversion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UpgradeConversion_toProductId_fkey" FOREIGN KEY ("toProductId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Phase 2: all CREATE INDEX
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

CREATE INDEX "User_email_idx" ON "User"("email");

CREATE INDEX "User_phone_idx" ON "User"("phone");

CREATE INDEX "User_role_idx" ON "User"("role");

CREATE INDEX "User_status_idx" ON "User"("status");

CREATE UNIQUE INDEX "Membership_paymentId_key" ON "Membership"("paymentId");

CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

CREATE INDEX "Membership_status_expireAt_idx" ON "Membership"("status", "expireAt");

CREATE INDEX "Membership_userId_status_idx" ON "Membership"("userId", "status");

CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

CREATE INDEX "Order_status_expiresAt_idx" ON "Order"("status", "expiresAt");

CREATE INDEX "Order_orderNo_idx" ON "Order"("orderNo");

CREATE INDEX "Order_txHash_idx" ON "Order"("txHash");

CREATE UNIQUE INDEX "Refund_orderId_key" ON "Refund"("orderId");

CREATE INDEX "Refund_userId_status_idx" ON "Refund"("userId", "status");

CREATE INDEX "Refund_status_idx" ON "Refund"("status");

CREATE INDEX "Product_category_isActive_idx" ON "Product"("category", "isActive");

CREATE INDEX "Product_requiredPlan_idx" ON "Product"("requiredPlan");

CREATE INDEX "Product_isActive_publishedAt_idx" ON "Product"("isActive", "publishedAt");

CREATE INDEX "Product_tier_idx" ON "Product"("tier");

CREATE INDEX "DownloadRecord_userId_idx" ON "DownloadRecord"("userId");

CREATE INDEX "DownloadRecord_productId_idx" ON "DownloadRecord"("productId");

CREATE UNIQUE INDEX "DownloadRecord_userId_productId_key" ON "DownloadRecord"("userId", "productId");

CREATE INDEX "Review_productId_status_idx" ON "Review"("productId", "status");

CREATE INDEX "Review_userId_idx" ON "Review"("userId");

CREATE INDEX "Review_productId_rating_idx" ON "Review"("productId", "rating");

CREATE INDEX "ReviewReply_reviewId_idx" ON "ReviewReply"("reviewId");

CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

CREATE UNIQUE INDEX "Referral_referrerId_refereeId_key" ON "Referral"("referrerId", "refereeId");

CREATE INDEX "Module_category_idx" ON "Module"("category");

CREATE INDEX "EAConfig_userId_idx" ON "EAConfig"("userId");

CREATE INDEX "EAConfig_isPublished_idx" ON "EAConfig"("isPublished");

CREATE UNIQUE INDEX "EAConfigModule_eaConfigId_moduleId_key" ON "EAConfigModule"("eaConfigId", "moduleId");

CREATE INDEX "EARunSession_eaConfigId_idx" ON "EARunSession"("eaConfigId");

CREATE INDEX "EARunSession_status_idx" ON "EARunSession"("status");

CREATE INDEX "EARunLog_sessionId_idx" ON "EARunLog"("sessionId");

CREATE INDEX "EAPosition_sessionId_idx" ON "EAPosition"("sessionId");

CREATE INDEX "EAPosition_status_idx" ON "EAPosition"("status");

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

-- Phase 3: all ALTER TABLE (FK, after all tables exist)
