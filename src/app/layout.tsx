// Cache Buster: 2026-08-08 v1.4 — 强制 Vercel 重新打包, 刺穿 CDN 缓存
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { BRAND } from "@/config/brand";

// task052 L1 C8: 字体 → Microsoft YaHei (CSS var 驱动, 无 next/font/google 离线依赖)

// task071 防御性渲染: 即使外部 CSS 加载失败, 页面也保持 TradingView 深色基调
// (防 Vercel CDN 缓存同步延迟导致的 FOUC / 裸奔)
const CRITICAL_CSS = `
  html, body {
    background-color: #131722;
    color: #E0E0E0;
    margin: 0;
    padding: 0;
    font-family: 'Microsoft YaHei', 'Arial Black', sans-serif;
  }
  * { box-sizing: border-box; }
`;

export const metadata: Metadata = {
  title: `${BRAND.name.zh} - ${BRAND.slogan.zh}`,
  description: BRAND.slogan.en,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* task071: 内联 critical CSS — 防 FOUC, 保证深色基调永远先于外部 CSS 渲染 */}
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
      </head>
      <body>
        {/* task052 L1: 删除左上角 glossy-badge 浮窗 (违和感, 已被 Header 替代) */}
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}