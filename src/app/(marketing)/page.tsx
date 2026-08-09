import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { AuthorInsights } from "@/components/features/AuthorInsights";
import { Footer } from "@/components/layout/footer";

// L4 v1.7: 5 区块首页 (修回简洁, 黄金外汇专精)
// v22.0 Phase 2.1: 6 区块 (作者分享从底部移到中部, 借鉴 forex.eastmoney 嵌入风格)
// 1.Ticker 2.Hero 3.StatsBar 4.AuthorInsights 5.ProductGrid 6.HowItWorks 7.Pricing 8.Footer
// 删 v1.6 的 MarketOverview (12品种) + WhyUs (4特性套话)
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-12 space-y-12 lg:space-y-16">
        {/* 区块 1: Hero (简洁版, 黄金外汇专精) */}
        <Hero />

        {/* 区块 2: Stats Bar (2 卡: 商品总数 + 教程研报) */}
        <StatsBar />

        {/* 区块 3: 作者分享 (v22.0 Phase 2.1 重构) - 借鉴 forex.eastmoney 中部嵌入 */}
        <AuthorInsights />

        {/* 区块 4: 产品中心 (8 个 EA) */}
        <ProductSection />

        {/* 区块 5: 工作流 (3 步: 浏览 / 订阅 / 部署) */}
        <HowItWorks />

        {/* 区块 6: 会员订阅 3 档 */}
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href: string;
}) {
  return (
    <div className="flex justify-between items-end mb-6">
      <div>
        <h2 className="h2 mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-text-muted">{subtitle}</p>
        )}
      </div>
      <Link
        href={href}
        className="text-sm text-accent-blue hover:underline shrink-0"
      >
        查看全部 →
      </Link>
    </div>
  );
}

function ProductSection() {
  return (
    <section>
      <SectionHeader
        title="产品中心"
        subtitle="严选可商用 EA · MQL4 / MQL5 源码可读"
        href="/products"
      />
      <ProductGrid />
    </section>
  );
}

function PricingSection() {
  return (
    <section>
      <SectionHeader
        title="会员订阅"
        subtitle="3 档订阅服务 · 严选品质 · 工作室级保障"
        href="/membership"
      />
      <PricingTable />
    </section>
  );
}
