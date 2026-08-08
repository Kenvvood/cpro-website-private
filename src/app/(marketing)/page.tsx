import { Suspense } from "react";
import { TickerBar } from "@/components/layout/TickerBar";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { Footer } from "@/components/layout/footer";

// task068 部署修复 v2: 首页 prerender 时 SQLite 表不存在
// 方案: 不在 prerender 阶段执行 DB 查询, 用 Suspense 把数据区段包裹为客户端动态加载
// 1. 顶部 Hero/Ticker/HowItWorks/Pricing 都是纯静态, 直接渲染
// 2. 中部 StatsBar + ProductGrid 用 Suspense 包住, prerender 时不执行 server component
export const dynamic = "force-dynamic";

// L4 v1.7: 5 区块首页 (修回简洁, 黄金外汇专精)
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TickerBar />

      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-12 space-y-12 lg:space-y-16">
        {/* 区块 1: Hero (纯静态, 不依赖 DB) */}
        <Hero />

        {/* 区块 2+3: 数据驱动 (Suspense 包住, prerender 时跳过) */}
        <Suspense
          fallback={
            <div className="space-y-12">
              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                <div className="card-base p-4 lg:p-6 h-24 animate-pulse" />
                <div className="card-base p-4 lg:p-6 h-24 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card-base p-4 h-40 animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <DataSections />
        </Suspense>

        {/* 区块 4: 工作流 (纯静态) */}
        <HowItWorks />

        {/* 区块 5: 会员订阅 (PricingTable 内已有 dynamic) */}
        <PricingTable />
      </main>

      <Footer />
    </div>
  );
}

async function DataSections() {
  return (
    <>
      {/* 区块 2: Stats Bar */}
      <StatsBar />
      {/* 区块 3: 产品中心 */}
      <ProductGrid />
    </>
  );
}