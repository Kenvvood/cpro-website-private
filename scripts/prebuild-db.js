// scripts/prebuild-db.js — Vercel 部署专用: 确保 prisma/dev.db 存在并应用 migrations
// 仅使用 prisma CLI (避免 tsx/CommonJS 加载问题)
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.resolve(process.cwd(), "prisma", "dev.db");

try {
  if (!fs.existsSync(DB_PATH)) {
    console.log("[prebuild-db] dev.db 不存在, Vercel 上需先创建再迁移");
    console.log("[prebuild-db] 尝试 prisma migrate deploy 让 Prisma 自动建库");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    process.exit(0);
  }

  // 本地: 检查 _prisma_migrations 表是否存在 (baseline 标记)
  const result = execSync(
    `npx prisma db execute --stdin --schema prisma/schema.prisma <<EOF
SELECT name FROM sqlite_master WHERE type='table' AND name='_prisma_migrations';
EOF`,
    { stdio: ["pipe", "pipe", "inherit"] },
  ).toString();

  if (!result.includes("_prisma_migrations")) {
    console.log("[prebuild-db] 数据库未 baseline, 自动标记 3 个 migrations");
    const migrations = [
      "20260728000000_init_usdt_membership",
      "20260730000000_add_open_source_redistribution",
      "20260730001000_add_open_source_tutorial",
    ];
    for (const m of migrations) {
      console.log(`[prebuild-db] 标记 ${m}`);
      execSync(`npx prisma migrate resolve --applied ${m}`, { stdio: "inherit" });
    }
  } else {
    console.log("[prebuild-db] 数据库已 baseline, 检查 pending migrations");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  }
} catch (e) {
  console.error("[prebuild-db] 错误:", e.message || e);
  // 不让 prebuild 失败阻塞 build
  console.warn("[prebuild-db] 继续 build (DB 检查失败不影响编译)");
  process.exit(0);
}