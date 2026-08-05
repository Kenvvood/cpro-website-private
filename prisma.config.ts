// prisma.config.ts — Prisma 7 新规范配置
// task051 PAYMENT-REBUILD: SQLite libsql 直连
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: `file:${dbPath}`,
  },
  migrations: {
    seed: "tsx prisma/seed_assets.ts",
  },
});