import type { NextConfig } from "next";
import { resolve } from "path";

const projectRoot = resolve(__dirname);

const nextConfig: NextConfig = {
  // 强制 Next.js 16 Turbopack workspace root = cpro-website
  // (父 G:\CodeBase 有 package-lock.json 干扰)
  turbopack: {
    root: projectRoot,
  },
  // v22.0 PATCH 17.11: 性能优化 (Lighthouse 调优)
  compress: true, // gzip 压缩 (默认 true)
  productionBrowserSourceMaps: false, // 生产不输出 sourcemap (-10% bundle)
  poweredByHeader: false, // 不暴露 X-Powered-By 头 (安全)
  images: {
    // 优先 AVIF → WebP → 原格式 (新一代图片格式, 减小 30-50%)
    formats: ["image/avif", "image/webp"],
    // 远程图片占位 (产品缩略图用 [id].jpg)
    remotePatterns: [],
    // 设备尺寸断点
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  experimental: {
    // 包级别 tree-shake (lucide-react / sonner / 等大库)
    optimizePackageImports: ["lucide-react", "sonner", "date-fns", "lodash"],
  },
  // v22.0 Phase 7.24 Batch 2 PATCH5 HOTFIX: HTML 路由走 no-store
  // v22.0 PATCH 17.8: 加 security headers (HSTS + CSP + X-Frame-Options)
  // v22.0 PATCH 17.11: 静态资源加 max-age 缓存 (1 年 immutable)
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
          // 强制 HTTPS 1 年 (含子域, 预加载列表)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // CSP: self + 当前域的图片/字体/样式/脚本
          // unsafe-inline / unsafe-eval: Next.js 16 + Tailwind v4 + sonner toast 需要
          { key: "Content-Security-Policy", value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data:",
            "connect-src 'self' https://api.cprotrading.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
          ].join("; ") },
          // 防 MIME 嗅探
          { key: "X-Content-Type-Options", value: "nosniff" },
          // 防 clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Referrer 限制
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 权限策略 (禁用不需的浏览器特性)
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), payment=()" },
        ],
      },
      // 静态资源 1 年 immutable 缓存 (Next.js 资源带 hash, 可永久缓存)
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // 图片资源 30 天
      {
        source: "/((?!api).*)\\.(png|jpg|jpeg|svg|gif|webp|avif|ico)$",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
