import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { AuthorInsights } from "@/components/features/AuthorInsights";
import { Footer } from "@/components/layout/footer";

// v22.0 Phase 7.1: 修复 Phase 7.0 留白过多问题
// 之前: py-12 lg:py-16 / py-16 lg:py-20 (PM 反馈"上下结构战线拉的过长, 留白过多")
// 现在: py-6 lg:py-8 / py-8 lg:py-10 (紧凑) - 5 维度破节奏保留 (宽度/底色/分隔/标题位置/内部元素)
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      {/* 1. Hero: max-w-7xl 全宽, 紧凑 padding (之前 max-w-4xl 把左右 2 栏压扁) */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Hero />
        </div>
      </div>

      {/* 2. StatsBar: 全宽浅灰 data strip - 紧凑 padding */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <StatsBar />
        </div>
      </div>

      {/* 3. AuthorInsights: 全宽浅蓝 3% - 紧凑 padding */}
      <div className="w-full bg-accent-blue/[0.03] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-10">
          <AuthorInsights />
        </div>
      </div>

      {/* 4. ProductSection: 全宽白底, 紧凑 */}
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-10">
          <div className="flex justify-between items-end mb-4">
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

      {/* 5. HowItWorks: 浅灰底 + max-w-6xl - 紧凑 padding */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <HowItWorks />
        </div>
      </div>

      {/* 6. PricingSection: 居中 max-w-4xl - 紧凑 padding */}
      <section className="w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
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
