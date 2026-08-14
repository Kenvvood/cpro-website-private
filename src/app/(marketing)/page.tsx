import Link from "next/link";
import { Hero } from "@/components/features/Hero";
import { StatsBar } from "@/components/features/StatsBar";
import { ProductGrid } from "@/components/features/ProductGrid";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PricingTable } from "@/components/features/PricingTable";
import { AuthorInsights } from "@/components/features/AuthorInsights";
import { AuthorSidebar } from "@/components/features/AuthorSidebar";
import { Footer } from "@/components/layout/footer";

// v22.0 Phase 7.10: 架构重排 - PM 决策
// 1) 顶部紧凑: TickerBar 紧跟 Header (无大留白), Hero padding py-2/3/4
// 2) 板块顺序重排: TickerBar → Hero → StatsBar → Pricing+Product (插入到 D 后) → AuthorInsights(左) + HowItWorks(左下) + AuthorSidebar(右) → Footer
// 3) E/F 深度合并: xl 起 1fr_2fr - 左 70% (作者分享 + 工作流 上下分布, 工作流宽度对齐) / 右 30% 侧栏 (高度对齐左)
// 4) Hero 比例紧凑: 1.3fr_1fr → 1.1fr_1fr, gap-14 → gap-8 (减中间留白)
// 5) Hero 钩子紧凑: 数字承诺 "6 款实战工具" → "实战工具集" (反硬编码)
// v22.0 Phase 7.24 BATCH 14 PATCH: TickerBar 提到 layout.tsx 跟 Header 一起 sticky, 消除导航-滚动条之间 280px 空白
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* v22.0 Phase 7.24 BATCH 15 PATCH 7: 修 8px spacing 基准理解 (PM: 280px 漏白真根因)
          - BUG: globals.css --spacing: 8px (8px 基准), pt-N 渲染 = N * 8px (不是 Tailwind 默认 4px)
          - PATCH 4: pt-2 sm:pt-20 lg:pt-28 = 16 / 160 / 224px (224px 远超 Header 108 + items-center 居中 = 335px 漏白)
          - PATCH 7: pt-2 sm:pt-12 lg:pt-14 = 16 / 96 / 112px (跟 Header 108 紧贴)
          - 配合 Hero items-center → items-start (PATCH 7): h1 立刻顶到 pt 下方, 漏白从 335 → 112px
          - 桌面移动端统一紧贴 Header, 不再 "矫枉过正" (PATCH 5 pt-8/12 太激进 + 误删 div 包裹 → Hero 完全没渲染)
          - pb-3 sm:pb-4 lg:pb-5 = 24/32/40px (跟 pt 对称, 适配 8px 基准)
          - 移动 (< sm 640): pt-2 (16px) 紧跟 TickerBar 21.5, 桌面 (sm+ ≥ 640): pt-12 (96) / lg:pt-14 (112)
          - Hero items-start 后 h1 顶部 y = Header 108 + pt 96-112 = 204-220px (vs PATCH 4 的 443)
          - 配合 TickerBar py-0.5 (21.5px) + 顶部间距 96px 桌面 = y=204, 紧贴 Hero 起始 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 pt-2 sm:pt-12 lg:pt-14 pb-3 sm:pb-4 lg:pb-5">
        <Hero />
      </div>

      {/* 3. StatsBar: 全宽浅灰 data strip */}
      <div className="w-full bg-bg-secondary border-y border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24">
          <StatsBar />
        </div>
      </div>

      {/* 4. PricingSection (左) + ProductSection (右) - 插入到 D 后 */}
      {/* v22.0 Phase 7.20: 1fr_2fr → 1:1 (PM 决策: 会员订阅和产品中心等宽, 产品列宽按内容调整) */}
      <section className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 sm:py-8 lg:py-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-10">
            <PricingSection />
            <ProductSection />
          </div>
        </div>
      </section>

      {/* 5. AuthorInsights (左上) + HowItWorks (左下) + AuthorSidebar (右) 合并区
            v22.0 Phase 7.12: 比例 2:1 (左 2 份 E+F / 右 1 份 AuthorSidebar), 高度完全一致
            PM: '作者分享和工作流宽度和侧边栏宽度比例调整成 2:1, 作者分享减少一行,
                工作流高度压缩更紧凑, 侧边栏增加一些元素让左右两侧高度完全一致'
            v22.0 Phase 7.24 Batch 1 PATCH: 浅灰父容器 → 白色 (PM 反馈, 跟工作流/侧边栏白底统一) */}
      <div className="w-full bg-white border-y border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 sm:py-8 lg:py-10">
          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 xl:gap-10">
            <div className="flex flex-col gap-6 sm:gap-8">
              <AuthorInsights />
              <HowItWorks />
            </div>
            <AuthorSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ProductSection() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        {/* v22.0 BATCH 16 PATCH 7 (2026-08-14): 5 热门门面化 - "产品中心" → "热门推荐" */}
        <h2 className="h2 mb-1">热门推荐</h2>
        <p className="text-xs text-text-muted">5 款严选核心 EA · 黄金专属 · 跑通可证</p>
      </div>
      <ProductGrid />
      <div className="mt-auto pt-3 border-t border-border text-[11px] text-text-muted text-center">
        <Link href="/products" className="text-accent-blue hover:underline">查看全部 30+ 款 →</Link>
        <span className="mx-1.5">·</span>
        持续更新中 · 每周新增
      </div>
    </div>
  );
}

function PricingSection() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <h2 className="h2 mb-1">会员订阅</h2>
        <p className="text-xs text-text-muted">3 档订阅服务 · 严选品质</p>
      </div>
      <PricingTable />
      <div className="mt-auto pt-3 border-t border-border text-[11px] text-text-muted text-center">
        ✓ 终身质保 · 链上USDT · 4h工单
      </div>
    </div>
  );
}
