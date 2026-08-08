import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { Footer } from "@/components/layout/footer";

// task068 部署修复: 首页含 DB 查询, Vercel prerender 时 SQLite 表可能不存在
// force-dynamic 改为运行时渲染, 避免构建时 SQLITE_ERROR
export const dynamic = "force-dynamic";

// L4 v1.7: 5 区块首页 (修回简洁, 黄金外汇专精)
// 1.Ticker 2.Hero 3.StatsBar 4.ProductGrid 5.HowItWorks 6.Pricing 7.Footer
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

        {/* 区块 3: 产品中心 (8 个 EA) */}
        <ProductSection />

        {/* 区块 4: 工作流 (3 步: 浏览 / 订阅 / 部署) */}
        <HowItWorks />

        {/* 区块 5: 会员订阅 3 档 */}
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
