import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

// task052 L2 C15 + task065: 产品中心真实网格 (4 列 · 数据从 DB · 接入 i18n)
export async function ProductGrid() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 8,
    select: {
      id: true,
      name: true,
      positioning: true,
      category: true,
      tier: true,
      requiredPlan: true,
      downloadCount: true,
      rating: true,
    },
  });

  if (products.length === 0) {
    return (
      <div className="card-base p-12 text-center text-text-muted">
        暂无商品（DB 已重置, seed 数据准备中）
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
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
            {p.name}
          </h3>
          <p className="text-xs text-text-secondary mb-3 line-clamp-2 min-h-[2rem]">
            {p.positioning ?? "—"}
          </p>
          <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
            <span className="num">↓ {p.downloadCount.toLocaleString()}</span>
            <span className="text-accent-gold">{t.plan(p.requiredPlan).short}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}