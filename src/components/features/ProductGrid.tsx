import Link from "next/link";
import { ArrowRight, FileCheck2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

// L4 v1.9 激进档 (PM 决策):
// - 加 MT4/MT5 平台标签 (从 fileUrl 推断: .mq4 → MT4, .mq5 → MT5)
// - 加风险等级徽章 (从 tier 推断: "Tier 1" → 高, "Tier 2" → 中, 其他 → 低)
// - 加 "查看回测" 按钮 → 链到本地 cpro_packages_complete/<slug>.zip
// - 保持 4 列网格, 8 个商品

function inferPlatform(fileUrl: string | null | undefined): "MT4" | "MT5" | null {
  if (!fileUrl) return null;
  const lower = fileUrl.toLowerCase();
  if (lower.endsWith(".mq5") || lower.endsWith(".ex5") || lower.includes("/mt5/")) return "MT5";
  if (lower.endsWith(".mq4") || lower.endsWith(".ex4") || lower.includes("/mt4/")) return "MT4";
  return null;
}

function inferRisk(tier: string | null | undefined): "高" | "中" | "低" {
  if (!tier) return "中";
  if (tier.includes("Tier 1") || tier.toLowerCase().includes("premium")) return "高";
  if (tier.includes("Tier 2") || tier.toLowerCase().includes("pro")) return "中";
  return "低";
}

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
      fileUrl: true,
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
      {products.map((p) => {
        const platform = inferPlatform(p.fileUrl);
        const risk = inferRisk(p.tier);
        return (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="card-base p-4 hover:border-border-focus transition-colors group"
          >
            {/* 平台 + 风险等级 */}
            <div className="flex items-center justify-between mb-2 gap-1">
              <div className="flex items-center gap-1">
                {platform && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-sm font-semibold">
                    {platform}
                  </span>
                )}
                <span className="text-xs px-1.5 py-0.5 bg-bg-tertiary text-text-secondary rounded-sm">
                  {p.category}
                </span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold ${
                  risk === "高"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : risk === "中"
                    ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                    : "bg-accent-up/10 text-accent-up border border-accent-up/20"
                }`}
              >
                {risk} 风险
              </span>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-accent-blue">
              {p.name}
            </h3>
            <p className="text-xs text-text-secondary mb-3 line-clamp-2 min-h-[2rem]">
              {p.positioning ?? "—"}
            </p>
            <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
              <span className="num">↓ {p.downloadCount.toLocaleString()}</span>
              <span className="flex items-center gap-1 text-accent-blue group-hover:underline">
                <FileCheck2 size={11} />
                <span>查看回测</span>
                <ArrowRight size={11} />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
