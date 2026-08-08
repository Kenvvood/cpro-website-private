// next.config.ts
import type { NextConfig } from "next";
import { resolve } from "path";

const projectRoot = resolve(__dirname);

const nextConfig: NextConfig = {
  // 强制 Next.js 16 Turbopack workspace root = cpro-website
  turbopack: {
    root: projectRoot,
  },

  // task073: Vercel Serverless 物理挂载 SQLite 数据库
  // 不配置则 dev.db 被 Vercel Trace 机制丢弃, 导致 SQLITE_CANTOPEN (14)
  // Next.js 16 中此选项已移出 experimental, 直接放顶层
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db"],
    "/api/**/*": ["./prisma/dev.db"],
  },
};

export default nextConfig;