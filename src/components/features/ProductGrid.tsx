import Link from "next/link";
import { Flame } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

// task052 L2 C15 + task065: 产品中心真实网格 (4 列 · 数据从 DB · 接入 i18n)
// v22.0 Phase 2.1-C: 去 4 列卡片 → 1 张密集表格 + 行 (反 AI 卡片感)
// 借鉴 fxssi / cn.investing / forex.eastmoney 风格: 行 + 1px 底边线 + 表格
// v22.0 BATCH 16 PATCH 7 (2026-08-14): 5 热门门面化 - sort by isFeatured DESC + 热门徽章 (PM: 王牌改热门, 避免二次元)
export async function ProductGrid() {
  const products = await prisma.product.findMany({
    // PATCH 7: 包含 5 王牌 (isFeatured=true, 突破 mtt- 前缀限制)
    where: { isActive: true, OR: [{ id: { startsWith: "mtt-" } }, { isFeatured: true }] },
    orderBy: [{ isFeatured: "desc" }, { score: "desc" }, { publishedAt: "desc" }],
    // PATCH 7: 5 热门 (isFeatured DESC 优先) - 4 → 5 行, 5 款热门都露出
    // 注: 主页 PricingTable 3+1=4 行, 5 热门右栏会高 1 行 (PM 接受, 5 热门优先)
    take: 5,
    select: {
      id: true,
      name: true,
      positioning: true,
      category: true,
      tier: true,
      requiredPlan: true,
      downloadCount: true,
      rating: true,
      isFeatured: true,
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
    // 1 张密集表格 (5 行, fxssi 价格表风格: 表头 + 行)
    // v22.0 Phase 7.4: 移动端 overflow-x-auto + 表格只显示 #/商品 (其他 hidden)
    // v22.0 Phase 7.20: table-fixed + colgroup 显式列宽, 商品列吃剩余, 列宽按内容 (PM: 之前各列突兀)
    // v22.0 BATCH 16 PATCH 7: 热门行 bg-accent-gold/5 浅金底, 商品名文字 accent-gold
    <div className="border-y border-border overflow-x-auto">
      <table className="w-full text-sm table-fixed min-w-[240px] sm:min-w-[420px]">
        <colgroup>
          <col style={{ width: "40px" }} />
          <col />
          <col style={{ width: "80px" }} className="hidden lg:table-column" />
          <col style={{ width: "64px" }} className="hidden sm:table-column" />
          <col style={{ width: "80px" }} className="hidden md:table-column" />
        </colgroup>
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
            <th className="text-left py-2 px-2 font-normal">#</th>
            <th className="text-left py-2 px-2 font-normal">商品</th>
            <th className="text-left py-2 px-2 font-normal hidden lg:table-cell">分类</th>
            <th className="text-right py-2 px-2 font-normal hidden sm:table-cell">下载</th>
            <th className="text-right py-2 px-2 font-normal hidden md:table-cell">订阅</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors group ${
                p.isFeatured ? 'bg-accent-gold/5' : ''
              }`}
            >
              <td className="py-2.5 px-2 text-text-muted num text-xs">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="py-2.5 px-2 overflow-hidden">
                <div className="flex items-center gap-2 min-w-0">
                  <Link
                    href={`/products/${p.id}`}
                    className={`font-medium group-hover:text-accent-blue transition-colors truncate min-w-0 flex-1 ${
                      p.isFeatured ? 'text-accent-gold' : 'text-text-primary'
                    }`}
                  >
                    {p.name}
                  </Link>
                  {p.isFeatured && (
                    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-accent-gold/15 text-accent-gold text-[9px] font-bold tracking-wider uppercase rounded shrink-0">
                      <Flame size={8} className="fill-current" /> 热门
                    </span>
                  )}
                  {p.tier && (
                    <span className="text-[10px] text-text-muted shrink-0">{t.tier(p.tier).short}</span>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-2 text-xs text-text-secondary hidden lg:table-cell truncate">
                {t.category(p.category).full}
              </td>
              <td className="py-2.5 px-2 text-right text-xs num text-text-secondary hidden sm:table-cell">
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
