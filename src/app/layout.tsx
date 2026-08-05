import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { BRAND } from "@/config/brand";

// task052 L1 C8: 字体 → Microsoft YaHei (CSS var 驱动, 无 next/font/google 离线依赖)

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
