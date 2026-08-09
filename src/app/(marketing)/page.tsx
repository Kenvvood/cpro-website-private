import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { AuthorInsights } from "@/components/features/AuthorInsights";
import { Footer } from "@/components/layout/footer";

// v22.0 Phase 7.5: 板块重构 - PricingSection + ProductSection 左右并列
// PM 反馈: '产品中心和会员订阅调整成左右并列, 会员订阅放左侧, 产品中心放右侧,
//          商品名称不需要占两行, 描述那一列也可以删掉, 两者并列显示更合适'
// 之前: ProductSection + PricingSection 上下堆叠 (各占满宽), 表格 6 列含描述
// 现在: xl 起左右并列 (1fr_2fr 比例, 左侧价格窄 右侧产品宽), ProductGrid 5 列 (删描述)
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

      {/* 4. HowItWorks: 浅灰底, 紧凑 padding */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 sm:py-8 lg:py-10">
          <HowItWorks />
        </div>
      </div>

      {/* 5. PricingSection (左) + ProductSection (右) 并列 - xl 起 2 栏 (1fr_2fr 比例) */}
      <section className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 sm:py-8 lg:py-10">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6 xl:gap-10">
            <PricingSection />
            <ProductSection />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// v22.0 Phase 7.7: ProductSection header 跟 PricingSection 对称 (h2 + p), 链接放 trust 段
// PM 截图: '会员订阅模块没有整体对齐右侧的产品中心模块' - 之前 ProductSection header 多了"全部 30+ 款"链接, 高度不一致
function ProductSection() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <h2 className="h2 mb-1">产品中心</h2>
        <p className="text-xs text-text-muted">严选可商用 EA · MQL4 / MQL5 源码可读</p>
      </div>
      <ProductGrid />
      <div className="mt-auto pt-3 border-t border-border text-[11px] text-text-muted text-center">
        <Link href="/products" className="text-accent-blue hover:underline">全部 30+ 款 →</Link>
        <span className="mx-1.5">·</span>
        持续更新中 · 每周新增
      </div>
    </div>
  );
}

// v22.0 Phase 7.7: 改 trust 段为单行短内容 (避免 wrap), mt-auto 推到底部
// PM 截图: '会员订阅模块没有整体对齐右侧的产品中心模块' - 之前 3 行 trust 段在窄列 wrap 后变成 6-9 行
function PricingSection() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <h2 className="h2 mb-1">会员订阅</h2>
        <p className="text-xs text-text-muted">3 档订阅服务 · 严选品质</p>
      </div>
      <PricingTable />
      <div className="mt-auto pt-3 border-t border-border text-[11px] text-text-muted text-center">
        ✓ 7天退订 · 链上USDT · 4h工单
      </div>
    </div>
  );
}
