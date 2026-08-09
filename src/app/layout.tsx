import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { BRAND } from "@/config/brand";

// v22.0 Phase 1: 字体借鉴 cn.investing.com / fxssi.com
// Inter (拉丁) + Noto Sans SC (中文) - Next.js build 时自托管, 运行时零外部依赖
// 探查 (outbox/probe_fonts.log): ECS build 可访问 fonts.googleapis.com
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});
const notoSC = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
  variable: '--font-noto-sc',
});

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
    <html lang="zh-CN" className={`${inter.variable} ${notoSC.variable}`}>
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
