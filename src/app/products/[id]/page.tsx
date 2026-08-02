/**
 * app/products/[id]/page.tsx — PDP 商品详情页
 * 2:1 左右分栏 + 白皮书质感
 */
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TierBadge } from '@/components/TierBadge';
import { MainContent } from '@/components/MainContent';
import { StickyActionPanel } from '@/components/StickyActionPanel';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  // TODO: 鉴权逻辑 (下一阶段)
  const hasAccess = false;

  return (
    <div className="min-h-screen bg-bg-primary">
      <article className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted
            hover:text-accent transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回商品库
        </Link>

        <header className="pb-6 mb-8 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <TierBadge tier={product.tier ?? undefined} />
            <span className="text-xs text-text-muted">{product.category}</span>
            {product.requiredPlan && (
              <span className="text-xs px-2 py-0.5
                bg-bg-tertiary text-text-secondary rounded">
                {product.requiredPlan}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3
            tracking-tight">
            {product.name}
          </h1>
          {product.subcategory && (
            <p className="text-sm text-text-secondary">
              {product.subcategory}
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MainContent product={{
              positioning: product.positioning ?? '',
              productHighlights: product.productHighlights ?? undefined,
              algorithmicCore: product.algorithmicCore ?? undefined,
              practicalApplication: product.practicalApplication ?? undefined,
              riskControl: product.riskControl ?? undefined,
              // ARCHIVE v7.3 (task-0037): capabilityTags 改 String? (JSON 序列化) 适配 SQLite
              // 安全 JSON.parse: 容错降级为空数组
              capabilityTags: (() => {
                if (!product.capabilityTags) return undefined;
                try {
                  const parsed = JSON.parse(product.capabilityTags);
                  return Array.isArray(parsed) ? parsed : undefined;
                } catch {
                  return undefined;
                }
              })(),
            }} />
          </div>

          <div className="lg:col-span-1">
            <StickyActionPanel
              product={{
                tier: product.tier ?? 'N/A',
                requiredPlan: product.requiredPlan,
                // ARCHIVE v7.3: capabilityTags JSON 解析
                capabilityTags: (() => {
                  if (!product.capabilityTags) return [];
                  try {
                    const parsed = JSON.parse(product.capabilityTags);
                    return Array.isArray(parsed) ? parsed : [];
                  } catch {
                    return [];
                  }
                })(),
                rating: Number(product.rating ?? 0),
                ratingCount: product.ratingCount ?? 0,
                downloadCount: product.downloadCount ?? 0,
              }}
              hasAccess={hasAccess}
              onCheckout={() => {
                console.log('Checkout triggered for', product.id);
              }}
            />
          </div>
        </div>
      </article>
    </div>
  );
}