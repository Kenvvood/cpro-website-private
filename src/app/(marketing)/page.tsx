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

// v22.0 Phase 7.5: ProductSection 不再用 max-w 居中, 让 page.tsx 的 grid 决定宽度
// 表格列 5 列 (# / 商品 / 分类 / 下载 / 订阅) - 删了"描述"列
function ProductSection() {
  return (
    <div>
      <div className="flex justify-between items-end mb-3 flex-wrap gap-2">
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
  );
}

// v22.0 Phase 7.5: PricingSection 不再用 max-w-4xl 居中, 让 page.tsx 的 grid 决定宽度
function PricingSection() {
  return (
    <div>
      <div className="mb-3">
        <h2 className="h2 mb-1">会员订阅</h2>
        <p className="text-xs text-text-muted">3 档订阅服务 · 严选品质</p>
      </div>
      <PricingTable />
    </div>
  );
}
