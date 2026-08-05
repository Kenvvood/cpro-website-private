/**
 * app/products/[id]/page.tsx — PDP 商品详情页
 * task052 L4: TV 化 · 接入 hasActiveMembership · Sticky 下载面板（已含 DownloadPaywall 集成）
 */
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasActiveMembership } from '@/lib/membership';
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

  // task052 L4: 接入 v11.0 三级门禁（task-051 PAYMENT-REBUILD）
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const hasAccess = userId
    ? await hasActiveMembership(userId, product.requiredPlan as any)
    : false;

  return (
    <div className="min-h-screen bg-bg-primary">
      <article className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-blue transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回商品库
        </Link>

        <header className="pb-6 mb-8 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <TierBadge tier={product.tier ?? undefined} />
            <span className="text-xs text-text-muted">{product.category}</span>
            {product.requiredPlan && (
              <span className="text-xs px-2 py-0.5 bg-bg-tertiary text-text-secondary rounded-sm">
                {product.requiredPlan}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 tracking-tight">
            {product.name}
          </h1>
          {product.subcategory && (
            <p className="text-sm text-text-secondary">{product.subcategory}</p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MainContent
              product={{
                positioning: product.positioning ?? '',
                productHighlights: product.productHighlights ?? undefined,
                algorithmicCore: product.algorithmicCore ?? undefined,
                practicalApplication: product.practicalApplication ?? undefined,
                riskControl: product.riskControl ?? undefined,
                capabilityTags: parseJsonArray(product.capabilityTags),
              }}
            />
          </div>

          <div className="lg:col-span-1">
            <StickyActionPanel
              product={{
                tier: product.tier ?? 'N/A',
                requiredPlan: product.requiredPlan,
                capabilityTags: parseJsonArray(product.capabilityTags) ?? [],
                rating: Number(product.rating ?? 0),
                ratingCount: product.ratingCount ?? 0,
                downloadCount: product.downloadCount ?? 0,
              }}
              hasAccess={hasAccess}
              onCheckout={() => {
                // DownloadPaywall 已嵌入 StickyActionPanel 内（task-051），由前端组件触发 CheckoutModal
              }}
            />
          </div>
        </div>
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