import type { NextConfig } from "next";
import { resolve } from "path";

const projectRoot = resolve(__dirname);

const nextConfig: NextConfig = {
  // 强制 Next.js 16 Turbopack workspace root = cpro-website
  // (父 G:\CodeBase 有 package-lock.json 干扰)
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
