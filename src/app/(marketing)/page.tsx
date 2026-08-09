import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { AuthorInsights } from "@/components/features/AuthorInsights";
import { Footer } from "@/components/layout/footer";

// L4 v1.7: 5 区块首页
// v22.0 Phase 2.1: 6 区块 (作者分享中部嵌入)
// v22.0 Phase 7.0: 板块排版创造性重构 - 错落有致不呆板 (PM 反馈 "首页排版比较呆板")
// 关键: 不删内容模块, 只重排版节奏
//   - 板块宽度变化: max-w-3xl/4xl/5xl/6xl/全宽 5 档交替
//   - 板块底色穿插: 白 / 浅灰 / 浅蓝 3 色交替
//   - 板块分隔变化: border-b / 留白 / border-y 浅灰底色
//   - 标题位置变化: 居中 / 左对齐 / 上下都有 / 不需要标题
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      {/* 1. Hero: max-w-4xl 居中 + 已有 2 栏布局 (保留) */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <Hero />
        </div>
      </div>

      {/* 2. StatsBar: 全宽浅灰 data strip - 破白底单调 */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <StatsBar />
        </div>
      </div>

      {/* 3. AuthorInsights: 全宽 + 浅蓝 3% 底色 (破灰/白单调) */}
      <div className="w-full bg-accent-blue/[0.03] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-12 lg:py-16">
          <AuthorInsights />
        </div>
      </div>

      {/* 4. ProductSection: 全宽白底, 紧凑 mb (不抢节奏) */}
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-12 lg:py-16">
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

      {/* 5. HowItWorks: 浅灰底 + 2 栏 (左 30% 标题 + 右 70% 表格) - 杂志风破节奏 */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <HowItWorks />
        </div>
      </div>

      {/* 6. PricingSection: 居中 max-w-4xl + 标题居中 - 收尾聚焦 */}
      <section className="w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-8 space-y-2">
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
