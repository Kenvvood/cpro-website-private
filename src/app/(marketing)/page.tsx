import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { AuthorInsights } from "@/components/features/AuthorInsights";
import { Footer } from "@/components/layout/footer";

// v22.0 Phase 7.3: 真正的响应式设计 - 不用 max-w 拉宽, 用渐进 padding + 内容自然延伸
// PM 反馈: 'Phase 7.2 max-w-[1600px] 勉强拉宽显得突兀'
// 修复思路:
//   1. 不用 max-w 容器 - 全 w-full, 靠 padding 控制边距
//   2. 渐进 padding: sm px-6 / lg px-8 / xl px-12 / 2xl px-16 / 3xl px-24
//   3. 板块内部 lg/xl/2xl 多种 grid 断点 (大屏启用 2 栏 / 3 栏)
//   4. 字号断点跟随: text-2xl sm:3xl lg:4xl xl:5xl 2xl:6xl
// 借鉴 cn.investing 头条区: 不用'拉宽容器'思路, 用'大屏 = 更宽 padding + 多列内容密度'思路
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      {/* 1. Hero: 跟随屏宽, 大屏 padding 加大 - 内部 grid 改 lg/xl 多断点 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
        <Hero />
      </div>

      {/* 2. StatsBar: 全宽浅灰 data strip - 大屏时间戳右对齐自然 */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
          <StatsBar />
        </div>
      </div>

      {/* 3. AuthorInsights: 全宽浅蓝 3% - 大屏侧栏更宽 (300px → 320px → 360px) */}
      <div className="w-full bg-accent-blue/[0.03] border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-8 lg:py-10">
          <AuthorInsights />
        </div>
      </div>

      {/* 4. ProductSection: 全宽白底, 紧凑 - 大屏表格加列显示 */}
      <section className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-8 lg:py-10">
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

      {/* 5. HowItWorks: 浅灰底 - 大屏启用 2 栏 (xl 才启用, lg 保持单列堆叠) */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-8 lg:py-10">
          <HowItWorks />
        </div>
      </div>

      {/* 6. PricingSection: 居中 - 大屏 max-w 渐宽 (4xl / 5xl / 6xl) */}
      <section className="w-full">
        <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
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
