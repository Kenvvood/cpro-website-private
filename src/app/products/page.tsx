/**
 * app/products/page.tsx — PLP (Product List Page)
 * 整合 FilterPanel + ProductCard + Hero Banner
 */
import { Suspense } from 'react';
import { FilterPanel } from '@/components/FilterPanel';
import { ProductCard } from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { tier?: string; type?: string; tag?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <HeroBanner />

      <main className="max-w-7xl mx-auto px-6 py-8">
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
  // ARCHIVE v7.3 (task-0037): capabilityTags 改 String (JSON) 适配 SQLite
  // PostgreSQL 的 { has: ... } 数组查询在 SQLite 不可用, 改用 LIKE 全字段扫描
  // Top 60 上限下性能可接受; 大规模场景应建虚拟表 + 触发器同步
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(searchParams.tier ? { tier: searchParams.tier } : {}),
      ...(searchParams.type ? { category: searchParams.type as any } : {}),
      ...(searchParams.tag ? { capabilityTags: { contains: `"${searchParams.tag}"` } } : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 60,
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-text-muted">
        <p>未找到匹配的产品</p>
        <p className="text-sm mt-2">尝试清除筛选条件</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map((p: Record<string, any>) => <ProductCard key={p.id} product={{
        id: p.id,
        positioning: p.positioning ?? p.name,
        category: p.category,
        tier: p.tier ?? 'N/A',
        // ARCHIVE v7.3: capabilityTags JSON 解析
        capabilityTags: (() => {
          if (!p.capabilityTags) return [];
          try {
            const parsed = JSON.parse(p.capabilityTags);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })(),
      }} />)}
    </div>
  );
}

function HeroBanner() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg-primary">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-2/5" />
      <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4
          tracking-tight">
          CProTrading 策略与极客资产库
        </h1>
        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto">
          19,328 种量化武器，武装你的交易终端
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-text-muted">
          <span className="px-2 py-1 bg-bg-secondary border border-border rounded">MT4</span>
          <span className="px-2 py-1 bg-bg-secondary border border-border rounded">MT5</span>
          <span className="px-2 py-1 bg-accent/10 border border-accent/30 text-accent rounded">USDT 会员</span>
        </div>
      </div>
    </section>
  );
}