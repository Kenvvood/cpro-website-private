// scripts/prebuild-db.js — Vercel 部署专用: 强制以 schema 为准建库
// (架构师 DEBUG 修复: prisma migrate deploy 在 Vercel 临时 SQLite 上不稳定
// 改用 db push --accept-data-loss 强制同步, 无视历史迁移冲突)
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.resolve(process.cwd(), "prisma", "dev.db");

try {
  if (!fs.existsSync(DB_PATH)) {
    console.log("[prebuild-db] dev.db 不存在 (Vercel 新机器), 直接 db push 建库");
  } else {
    console.log("[prebuild-db] dev.db 已存在 (本地), 删除后重新 db push 保证 schema 一致");
    fs.unlinkSync(DB_PATH);
    // 顺便删除 journal 文件
    const journalPath = DB_PATH + "-journal";
    if (fs.existsSync(journalPath)) fs.unlinkSync(journalPath);
  }

  // 强制以 schema.prisma 为准建库, 无视迁移历史冲突
  // task073 v2: Prisma 7 移除 --skip-generate (db push 默认就不 generate, 重复了)
  // 之前写 --skip-generate 会触发 "unknown or unexpected option" → db push 失败
  // → dev.db 不存在 → 所有动态路由 SQLITE_CANTOPEN (14) → server 500
  console.log("[prebuild-db] 执行 prisma db push --accept-data-loss");
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
  });
  console.log("[prebuild-db] db push 完成");
} catch (e) {
  console.error("[prebuild-db] 错误:", e.message || e);
  // 不让 prebuild 失败阻塞 build
  console.warn("[prebuild-db] 继续 build (DB 错误不影响编译)");
  process.exit(0);
}