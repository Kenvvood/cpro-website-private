// src/lib/seo.ts - SEO metadata 工具函数 (v22.0 Phase 7.24 Batch 13)
// 复用 og / twitter / canonical, 避免 3 个新页面重复代码
import type { Metadata } from "next";
import { BRAND } from "@/config/brand";

interface SeoOptions {
  title: string;
  description: string;
  path: string;                    // e.g. "/wealth" (不要 domain)
  image?: string;                  // e.g. "/og-wealth.png", 默认 /og-image.png
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;          // ISO
}

export function buildSeoMetadata({
  title,
  description,
  path,
  image,
  keywords = [],
  type = "website",
  publishedTime,
}: SeoOptions): Metadata {
  const ogImage = image ?? "/og-image.png";
  const fullUrl = `https://${BRAND.domain}${path}`;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `https://${BRAND.domain}${ogImage}`;
  return {
    title,
    description,
    keywords: [...keywords, "CProTrading", "MTT", "城诺科技", "量化交易", "XAUUSD", "黄金", "MQL5"].join(", "),
    authors: [{ name: `${BRAND.name.zh} 投研` }],
    creator: BRAND.name.zh,
    publisher: BRAND.name.zh,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: BRAND.name.zh,
      locale: "zh_CN",
      type,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      publishedTime,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: { canonical: fullUrl },
    robots: { index: true, follow: true },
  };
}
