import type { NextConfig } from "next";
import { resolve } from "path";

const projectRoot = resolve(__dirname);

const nextConfig: NextConfig = {
  // 强制 Next.js 16 Turbopack workspace root = cpro-website
  // (父 G:\CodeBase 有 package-lock.json 干扰)
  turbopack: {
    root: projectRoot,
  },
  // v22.0 Phase 7.24 Batch 2 PATCH5 HOTFIX: HTML 路由走 no-store
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
