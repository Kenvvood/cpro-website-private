import Link from "next/link";
import { ArrowRight, Users, TrendingUp } from "lucide-react";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { Footer } from "@/components/layout/footer";

// L4 v1.9 激进档 (PM 2026-08-05 15:42 拍板):
// 7 区块首页 + 2 引导入口 (众筹 + 创作者)
// 1.Ticker 2.Hero (6 钩) 3.StatsBar (3 KPI) 4.ProductGrid (MT4/MT5+风险)
// 5.众筹入口 6.工作流 3 步 + 创作者引导 7.会员 3 档 8.Footer
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-12 space-y-12 lg:space-y-16">
        {/* 区块 1: Hero (6 钩 + 零 emoji + 真实数据) */}
        <Hero />

        {/* 区块 2: Stats Bar (3 KPI: 商品/教程/编译成功率) */}
        <StatsBar />

        {/* 区块 3: 产品中心 (8 个 EA + MT4/MT5 标签 + 风险等级 + 公开回测按钮) */}
        <ProductSection />

        {/* 区块 4: 众筹入口 (借 erbotapp, 引导到 /crowdfunding) */}
        <CrowdfundingSection />

        {/* 区块 5: 工作流 (3 步: 浏览 / 订阅 / 部署) + 创作者申请引导 */}
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
        subtitle="严选可商用 EA · MQL4 / MQL5 源码可读 · 含回测报告"
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
        subtitle="3 档纯付费 USDT · 无免费试用 · 失败可换其他 EA"
        href="/membership"
      />
      <PricingTable />
    </section>
  );
}

function CrowdfundingSection() {
  return (
    <section>
      <SectionHeader
        title="EA 众筹"
        subtitle="可验证策略 · 联合采购 · 失败可申请退款"
        href="/crowdfunding"
      />
      <div className="card-base p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-accent-blue/10 shrink-0">
            <TrendingUp size={18} className="text-accent-blue" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              平台验证 · 观摩账户 · 链上付款
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              首批 4 个众筹项目进行中：AveragingBySignal Pro / EURUSD London Breakout / GBPUSD News Trader / Multi-Pair Grid V2。
            </p>
          </div>
        </div>
        <Link
          href="/crowdfunding"
          className="btn-primary inline-flex items-center gap-2 text-sm shrink-0"
        >
          查看众筹项目
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
