// task060 3.1: sitemap.xml (架构师 8/8 [已批准])
// task068 v5: Vercel prerender 时 DB 表可能不存在, force-dynamic 跳过 prerender
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.cprotrading.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/products`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/open-source`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tutorials`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/membership`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/content`, changeFrequency: "weekly", priority: 0.6 },
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

  // 动态开源页 (OpenSourceRelease 没有 status 字段, 取全部前 1000 条)
  const releases = await prisma.openSourceRelease.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  });
  const releaseRoutes: MetadataRoute.Sitemap = releases.map((r) => ({
    url: `${SITE_URL}/open-source/${r.id}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

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

  return [...staticRoutes, ...productRoutes, ...releaseRoutes, ...tutorialRoutes];
}