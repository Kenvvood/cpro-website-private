/**
 * app/products/[id]/page.tsx — PDP 商品详情页
 * v22.0 Phase 7.24 Batch 6 重构:
 *  - 借鉴 fxssi 密集数据 + 横向 list 风
 *  - 适配 mtt- 字段 (positioning/description/capabilityTags)
 *  - 加底部相关推荐 (同 category, 4 个, 按下载数 desc)
 *  - 2 列 grid (主区 1fr + sidebar 360px sticky)
 */
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasActiveMembership } from '@/lib/membership';
import { TierBadge } from '@/components/TierBadge';
import { MainContent } from '@/components/MainContent';
import { StickyActionPanel } from '@/components/StickyActionPanel';
import { RelatedProducts, type RelatedItem } from '@/components/RelatedProducts';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

// 业务过滤: 严选商品 (mtt- 系列)
const whereActive = {
  isActive: true,
  id: { startsWith: 'mtt-' },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true, positioning: true, category: true, tier: true, description: true },
  });
  if (!p || !p.id.startsWith('mtt-')) return { title: "商品未找到 - CProTrading" };
  return {
    title: `${p.name} - CProTrading`,
    description: (p.positioning ?? p.description ?? "严选可商用 MQL4/MQL5 EA").slice(0, 160),
    openGraph: { title: p.name, description: p.positioning ?? undefined, type: "website" },
    alternates: { canonical: `/products/${id}` },
  };
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;

  // 商品主表 (加 mtt- 过滤防止 11k MQL5 占位进来)
  const product = await prisma.product.findFirst({
    where: { ...whereActive, id },
  });
  if (!product) notFound();

  // 同 category 相关推荐 (排除当前, 取 4 个, 按下载数 desc)
  const relatedRaw = await prisma.product.findMany({
    where: { ...whereActive, category: product.category, id: { not: id } },
    orderBy: { downloadCount: 'desc' },
    take: 4,
    select: {
      id: true, name: true, positioning: true, tier: true, category: true,
      downloadCount: true, score: true, capabilityTags: true, isFree: true,
    },
  });
  const related: RelatedItem[] = relatedRaw.map((p) => ({
    ...p,
    capabilityTags: parseJsonArray(p.capabilityTags) ?? [],
  }));

  // task052 L4: 接入 v11.0 三级门禁（task-051 PAYMENT-REBUILD）
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const hasAccess = userId
    ? await hasActiveMembership(userId, product.requiredPlan as any)
    : false;

  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      {/* task060 3.3: Product JSON-LD (SEO 富摘要) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.positioning ?? product.description ?? "",
            category: product.category ?? undefined,
            brand: { "@type": "Brand", name: "CProTrading" },
            offers: {
              "@type": "Offer",
              category: "Membership Subscription",
              priceCurrency: "USDT",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />

      <article className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 lg:py-8 max-w-[1920px] mx-auto">
        {/* Breadcrumb (紧凑返回链接) */}
        <div className="mb-5 flex items-center gap-3 text-sm">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-text-muted
              hover:text-accent-purple transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回产品库
          </Link>
          <span className="text-text-muted/50">/</span>
          <span className="text-text-muted">{product.category}</span>
          <span className="text-text-muted/50">/</span>
          <span className="text-text-primary font-medium truncate max-w-[400px]">
            {product.name}
          </span>
        </div>

        {/* Header (tier + 名称 + 副标) */}
        <header className="pb-5 mb-7 border-b border-border">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <TierBadge tier={product.tier ?? undefined} />
            <span className="text-xs text-text-muted">{product.category}</span>
            {product.requiredPlan && (
              <span className="text-xs px-2 py-0.5 bg-bg-tertiary text-text-secondary rounded-sm">
                {product.requiredPlan}
              </span>
            )}
            {product.isFree && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full
                border border-accent-gold/40 text-accent-gold">
                限免
              </span>
            )}
          </div>
          <h1 className="h1 mb-2">
            {product.name}
          </h1>
          {product.positioning && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {product.positioning}
            </p>
          )}
        </header>

        {/* 主体: 2 列 grid (主区 1fr + sidebar 360px sticky) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* 主区 */}
          <div>
            <MainContent
              product={{
                positioning: product.positioning ?? '',
                description: product.description ?? undefined,
                category: product.category,
                tier: product.tier ?? undefined,
                requiredPlan: product.requiredPlan,
                downloadCount: product.downloadCount,
                score: product.score ?? 0,
                capabilityTags: parseJsonArray(product.capabilityTags),
              }}
            />
          </div>

          {/* Sidebar sticky */}
          <div>
            <StickyActionPanel
              product={{
                id: product.id,
                tier: product.tier ?? 'N/A',
                requiredPlan: product.requiredPlan,
                capabilityTags: parseJsonArray(product.capabilityTags) ?? [],
                score: product.score ?? 0,
                downloadCount: product.downloadCount ?? 0,
              }}
              hasAccess={hasAccess}
              userId={userId}
            />
          </div>
        </div>

        {/* 底部相关推荐 */}
        <RelatedProducts items={related} />
      </article>
    </div>
  );
}

function parseJsonArray(s: string | null | undefined): string[] | undefined {
  if (!s) return undefined;
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
