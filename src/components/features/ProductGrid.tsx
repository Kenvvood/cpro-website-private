import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

// task052 L2 C15 + task065: 产品中心真实网格 (4 列 · 数据从 DB · 接入 i18n)
// v22.0 Phase 2.1-C: 去 4 列卡片 → 1 张密集表格 + 行 (反 AI 卡片感)
// 借鉴 fxssi / cn.investing / forex.eastmoney 风格: 行 + 1px 底边线 + 表格
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
      <div className="text-center text-text-muted text-sm py-8 border-y border-border">
        暂无商品 (DB 已重置, seed 数据准备中)
      </div>
    );
  }

  return (
    // 1 张密集表格 (8 行, fxssi 价格表风格: 表头 + 行)
    // v22.0 Phase 7.4: 移动端 overflow-x-auto + 表格只显示 #/商品 (其他 hidden)
    <div className="border-y border-border overflow-x-auto">
      <table className="w-full text-sm min-w-[240px] sm:min-w-[360px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
            <th className="text-left py-2 px-2 font-normal w-10">#</th>
            <th className="text-left py-2 px-2 font-normal">商品</th>
            <th className="text-left py-2 px-2 font-normal hidden lg:table-cell">分类</th>
            <th className="text-right py-2 px-2 font-normal hidden sm:table-cell w-16">下载</th>
            <th className="text-right py-2 px-2 font-normal hidden md:table-cell">订阅</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr
              key={p.id}
              className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors group"
            >
              <td className="py-2.5 px-2 text-text-muted num text-xs w-10">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="py-2.5 px-2 max-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Link
                    href={`/products/${p.id}`}
                    className="text-text-primary font-medium group-hover:text-accent-blue transition-colors truncate"
                  >
                    {p.name}
                  </Link>
                  {p.tier && (
                    <span className="text-[10px] text-text-muted shrink-0">{t.tier(p.tier).short}</span>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-2 text-xs text-text-secondary hidden lg:table-cell">
                {t.category(p.category).full}
              </td>
              <td className="py-2.5 px-2 text-right text-xs num text-text-secondary hidden sm:table-cell w-16">
                ↓ {p.downloadCount.toLocaleString()}
              </td>
              <td className="py-2.5 px-2 text-right text-xs text-accent-gold hidden md:table-cell">
                {t.plan(p.requiredPlan).short}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
