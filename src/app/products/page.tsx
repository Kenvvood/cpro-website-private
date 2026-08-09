/**
 * app/products/page.tsx — PLP (Product List Page)
 * task052 L3: 替换旧 ProductCard 为内联 card-base (TV 风)
 */
import { Suspense } from 'react';
import Link from 'next/link';
import { FilterPanel } from '@/components/FilterPanel';
import { prisma } from '@/lib/prisma';
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton';
import { getCategoryAliases, t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { tier?: string; type?: string; tag?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border bg-bg-secondary">
        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8">
          <h1 className="h1 mb-3 text-text-primary">产品中心</h1>
          <p className="text-sm text-text-secondary leading-relaxed">严选 MQL 量化武器 · 持续更新中 · 注册会员可下载</p>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel
              currentTier={searchParams.tier}
              currentType={searchParams.type}
              currentTag={searchParams.tag}
            />
          </div>

          <section className="lg:col-span-3">
            <Suspense fallback={<ProductGridSkeleton count={12} />}>
              <ProductGrid searchParams={searchParams} />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}

async function ProductGrid({ searchParams }: Props) {
  // task065: 选「辅助脚本」时同时匹配 Script + Code Snippet
  const categoryAliases = searchParams.type ? getCategoryAliases(searchParams.type) : null;
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(searchParams.tier ? { tier: searchParams.tier } : {}),
      ...(categoryAliases ? { category: { in: categoryAliases as any } } : {}),
      ...(searchParams.tag ? { capabilityTags: { contains: `"${searchParams.tag}"` } } : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 60,
  });

  if (products.length === 0) {
    return (
      <div className="card-base p-12 text-center text-text-muted">
        <p>未找到匹配的产品</p>
        <p className="text-sm mt-2">尝试清除筛选条件</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map((p: Record<string, any>) => {
        let tags: string[] = [];
        try {
          const parsed = JSON.parse(p.capabilityTags);
          if (Array.isArray(parsed)) tags = parsed;
        } catch {}
        return (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="card-base p-4 hover:border-border-focus transition-colors group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs px-2 py-0.5 bg-bg-tertiary text-text-secondary rounded-sm">
                {t.category(p.category).full}
              </span>
              {p.tier && (
                <span className="text-xs text-text-muted">{t.tier(p.tier).short}</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-accent-blue">
              {p.positioning ?? p.name}
            </h3>
            <p className="text-xs text-text-secondary mb-3 line-clamp-2 min-h-[2rem]">
              {tags.slice(0, 3).map(t.tag).join(' · ') || '—'}
            </p>
            <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
              <span className="num">↓ {(p.downloadCount ?? 0).toLocaleString()}</span>
              <span className="text-accent-gold">{t.plan(p.requiredPlan).short}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}