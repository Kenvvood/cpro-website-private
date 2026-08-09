import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { AuthorInsights } from "@/components/features/AuthorInsights";
import { Footer } from "@/components/layout/footer";

// v22.0 Phase 7.4: 移动端排版修复 (PM 反馈 "手机浏览时完全崩塌")
// 之前: 移动端 4 列 + 6 列表格 + sticky 全部崩塌
// 现在: 移动端关键策略
//   1. 移动端 padding 更紧: py-4 sm:py-6 lg:py-8 (之前 py-8 一律)
//   2. StatsBar 移动端 4 列 → 2 列 + 时间戳
//   3. ProductGrid / AuthorInsights 主表加 overflow-x-auto + 移动端隐藏非关键列
//   4. HowItWorks 移除 sticky (移动端不该 sticky)
//   5. 渐进 padding + 大屏 grid 保留 (Phase 7.3)
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      {/* 1. Hero: 移动 padding 紧 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-4 sm:py-6 lg:py-8">
        <Hero />
      </div>

      {/* 2. StatsBar: 全宽浅灰 data strip */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
          <StatsBar />
        </div>
      </div>

      {/* 3. AuthorInsights: 全宽浅蓝 3% */}
      <div className="w-full bg-accent-blue/[0.03] border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 sm:py-8 lg:py-10">
          <AuthorInsights />
        </div>
      </div>

      {/* 4. ProductSection: 全宽白底, 紧凑 */}
      <section className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 sm:py-8 lg:py-10">
          <div className="flex justify-between items-end mb-4 flex-wrap gap-2">
            <div>
              <h2 className="h2 mb-1">产品中心</h2>
              <p className="text-xs text-text-muted">严选可商用 EA · MQL4 / MQL5 源码可读</p>
            </div>
            <Link
              href="/products"
              className="text-sm text-accent-blue hover:underline shrink-0"
            >
              全部 8 款 →
            </Link>
          </div>
          <ProductGrid />
        </div>
      </section>

      {/* 5. HowItWorks: 浅灰底, 紧凑 padding */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 sm:py-8 lg:py-10">
          <HowItWorks />
        </div>
      </div>

      {/* 6. PricingSection: 居中紧凑 */}
      <section className="w-full">
        <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="text-center mb-6 space-y-1">
            <h2 className="h2">会员订阅</h2>
            <p className="text-sm text-text-secondary">3 档订阅服务 · 严选品质 · 工作室级保障</p>
          </div>
          <PricingTable />
        </div>
      </section>

      <Footer />
    </div>
  );
}
