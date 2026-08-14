import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { TickerBar } from "@/components/layout/TickerBar";
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

// v22.0 Phase 7.24 BATCH 15 PATCH 12: metadataBase 绝对 URL (2026-08-13)
// 之前 og:image 渲染 http://localhost:3000/og-image.png (Next.js 默认), 微信/LinkedIn 抓不到
// 加 metadataBase 后 og:image 自动渲染 https://www.cprotrading.com/og-image.png
const SITE_URL = 'https://www.cprotrading.com';
const ogImageUrl = '/og-image.png';
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${BRAND.name.zh} - ${BRAND.slogan.zh}`,
  description: BRAND.slogan.en,
  keywords: ['CProTrading', '城诺科技', 'MTT', '量化交易', 'MT4', 'MT5', 'XAUUSD', 'MQL5', 'EA', '外汇黄金'],
  authors: [{ name: 'CProTrading 城诺科技' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.cprotrading.com',
    siteName: 'CProTrading 城诺科技',
    title: `${BRAND.name.zh} - ${BRAND.slogan.zh}`,
    description: BRAND.slogan.en,
    images: [
      {
        // v22.0 PATCH 12: 显式绝对 URL, 跟 metadataBase 一起保险
        url: `${SITE_URL}${ogImageUrl}`,
        width: 1200,
        height: 630,
        alt: 'CProTrading 城诺科技 - 量化交易基础设施',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name.zh} - ${BRAND.slogan.zh}`,
    description: BRAND.slogan.en,
    images: [ogImageUrl],
  },
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
      {/* BATCH 15 PATCH 3: body overflow-x-hidden 兜底, 防 /membership 移动端 18px 横向溢出
          (Playwright 验证 scrollW=393 > clientW=375, 来自邀请奖励卡 / FAQ grid 等固定列宽) */}
      <body className="overflow-x-hidden">
        {/* BATCH 15 PATCH 2: 撤掉 main pt-[108px] - 避免跟 Hero pt 叠加成 220+px 漏白
            - Header sticky 108px 自身管 0 漏白 (跟 TickerBar 紧贴)
            - 各 page/section 内部自己管 padding-top (Hero 等组件自带 pt)
            - 滚动时 Header + TickerBar 永远黏在顶部 */}
        <Header />
        <main>
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
