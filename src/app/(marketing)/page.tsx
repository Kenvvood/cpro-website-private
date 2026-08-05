import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { CompileStatus } from "@/components/features/CompileStatus";
import { TopGold } from "@/components/features/TopGold";
import { Footer } from "@/components/layout/footer";

// L4 v1.10: 试 3 块 (PM 决策 2026-08-05, C 方案 · 半天最快验证)
// 1.Hero (XAUUSD 聚焦 + 跨品种对冲 + 右 EA 展示)
// 2.CompileStatus (持续完善, 脉冲点, 不暴露数字)
// 3.TopGold (Top 4 黄金策略, mock 示例)
// 删 v1.8.2 的 StatsBar (商品总数) + ProductSection (8 个 EA) + HowItWorks + Pricing
// 原因: PM 决策 "不要暴露我们有多少产品" + 半天最快验证
// 后续 v1.10 增量: 试完 3 块再补跨品种对冲区 / Top 10 收益榜 / 风险分布
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-12 space-y-12 lg:space-y-16">
        {/* 区块 1: Hero — 黄金聚焦 + 跨品种对冲 */}
        <Hero />

        {/* 区块 2: 编译状态 — 持续完善, 不暴露产品数量 */}
        <CompileStatus />

        {/* 区块 3: Top 4 黄金策略 (mock 示例, 后续接真实回测) */}
        <TopGold />
      </main>

      <Footer />
    </div>
  );
}
