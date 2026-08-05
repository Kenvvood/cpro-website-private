import Link from "next/link";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { OpenSourceGrid } from "@/components/features/OpenSourceGrid";
import { TutorialGrid } from "@/components/features/TutorialGrid";
import { PricingTable } from "@/components/features/PricingTable";
import { Footer } from "@/components/layout/footer";

// task052 L2 C12: TradingView 风首页 8 区块骨架
// 1. Ticker 2. Hero 3. Stats 4. Products 5. OpenSource 6. Tutorials 7. Pricing 8. Footer
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12 lg:space-y-16">
        {/* 区块 1: Hero (双栏) */}
        <Hero />

        {/* 区块 2: Stats Bar (4 列紧凑数字) */}
        <StatsBar />

        {/* 区块 3: 产品中心 (4 列真实网格) */}
        <section>
          <SectionHeader title="产品中心" href="/products" />
          <ProductGrid />
        </section>

        {/* 区块 4: 开源专区 (4 列双署名卡) */}
        <section>
          <SectionHeader title="开源专区" href="/open-source" />
          <OpenSourceGrid />
        </section>

        {/* 区块 5: 投研教程 (3 列) */}
        <section>
          <SectionHeader title="投研教程" href="/tutorials" />
          <TutorialGrid />
        </section>

        {/* 区块 6: 会员价表 (3 档) */}
        <section>
          <SectionHeader title="会员订阅" href="/membership" />
          <PricingTable />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl lg:text-2xl font-semibold text-text-primary">{title}</h2>
      <Link
        href={href}
        className="text-sm text-accent-blue hover:underline"
      >
        查看全部 →
      </Link>
    </div>
  );
}