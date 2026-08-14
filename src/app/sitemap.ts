// task060 3.1: sitemap.xml (架构师 8/8 [已批准])
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.cprotrading.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页
  // v22.0 Phase 7.23: 删 /open-source (合并到 /content), 大航海时代升 priority 0.6→0.9
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/products`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/tutorials`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/membership`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/content`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/download`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/legal/gpl-notice`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // 动态商品页 (上限 1000 条, 避免 sitemap 过大)
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  });
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // v22.0 Phase 7.23: 删 releaseRoutes (源码专区 /open-source 入口已删, 详情页 /open-source/[id] 仍可用但不放 sitemap)
  // 动态教程页
  const tutorials = await prisma.openSourceTutorial.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
  const tutorialRoutes: MetadataRoute.Sitemap = tutorials.map((t) => ({
    url: `${SITE_URL}/tutorials/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...tutorialRoutes];
}