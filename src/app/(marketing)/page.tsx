import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { MarketOverview } from "@/components/features/MarketOverview";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { WhyUs } from "@/components/features/WhyUs";
import { OpenSourceGrid } from "@/components/features/OpenSourceGrid";
import { TutorialGrid } from "@/components/features/TutorialGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { Footer } from "@/components/layout/footer";

// L4 v1.6: 9 区块首页 (借 TradingView cn.tradingview.com 风格钩子)
// 1.Ticker 2.Hero 3.MarketOverview 4.StatsBar 5.ProductGrid
// 6.WhyUs 7.OpenSource 8.Tutorial 9.HowItWorks 10.Pricing 11.Footer
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12 lg:space-y-20">
        {/* 区块 1: Hero (巨型 + 渐变 + 右侧图表占位) */}
        <Hero />

        {/* 区块 2: 市场覆盖 (12 品种 × 4 分类) */}
        <MarketOverview />

        {/* 区块 3: Stats Bar (4 列数字, 0 诚实) */}
        <StatsBar />

        {/* 区块 4: 产品中心 (8 个 EA, 0 时显示空态) */}
        <ProductSection />

        {/* 区块 5: 为什么选 CProTrading (4 特性) */}
        <WhyUs />

        {/* 区块 6: 开源专区 (双署名卡) */}
        <OpenSourceSection />

        {/* 区块 7: 投研教程 (3 列) */}
        <TutorialSection />

        {/* 区块 8: 工作流 4 步 (借 TV onboarding) */}
        <HowItWorks />

        {/* 区块 9: 会员订阅 3 档 */}
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}

// 区块包装器 (统一标题 + 副标 + 查看全部链接)
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
        <h2 className="text-xl lg:text-2xl font-semibold text-text-primary mb-1">
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

function OpenSourceSection() {
  return (
    <section>
      <SectionHeader
        title="开源专区"
        subtitle="合规再分发协议 · GPL / MIT / BSD 严格标注"
        href="/open-source"
      />
      <OpenSourceGrid />
    </section>
  );
}

function TutorialSection() {
  return (
    <section>
      <SectionHeader
        title="投研教程"
        subtitle="策略逻辑 + 风险评级 + 市场环境标签"
        href="/tutorials"
      />
      <TutorialGrid />
    </section>
  );
}

function PricingSection() {
  return (
    <section>
      <SectionHeader
        title="会员订阅"
        subtitle="3 档纯付费 USDT · 无免费试用 · 工作室级售后"
        href="/membership"
      />
      <PricingTable />
    </section>
  );
}
