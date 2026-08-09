import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { AuthorInsights } from "@/components/features/AuthorInsights";
import { Footer } from "@/components/layout/footer";

// v22.0 Phase 7.2: 修复大屏分辨率适配 (PM 反馈 "右边有大片留白")
// 之前: max-w-7xl (1280px) 容器 - 在 1920px 屏上居中后右侧留 320px 空白
// 现在: 
//   - Hero 跟随屏宽 (不限 max-w), 大屏 padding 加大 (2xl:px-16) - Hero 视觉张力强, 大屏能铺开
//   - 其他板块 max-w-[1600px] (折中 1280~1920), 大屏加 padding (2xl:px-12)
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      {/* 1. Hero: 跟随屏宽 w-full, 大屏 padding 2xl:px-16 - 不再有大片留白 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-16">
        <Hero />
      </div>

      {/* 2. StatsBar: 全宽浅灰 data strip */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <StatsBar />
        </div>
      </div>

      {/* 3. AuthorInsights: 全宽浅蓝 3% */}
      <div className="w-full bg-accent-blue/[0.03] border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-10">
          <AuthorInsights />
        </div>
      </div>

      {/* 4. ProductSection: 全宽白底, 紧凑 */}
      <section className="w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-10">
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

      {/* 5. HowItWorks: 浅灰底 + max-w-[1600px] (之前 6xl 也是 1152px, 不够) */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-10">
          <HowItWorks />
        </div>
      </div>

      {/* 6. PricingSection: 居中 max-w-4xl (定价居中聚焦) - 保留不变 */}
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
