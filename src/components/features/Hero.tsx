import Link from "next/link";
import { ArrowRight, Code2, Zap, Calculator, ShieldCheck } from "lucide-react";

// v22.0 BATCH 19 (2026-08-16 23:00): 3 营销页 hero 排版 + 文案统一
//  - 模板: tag + h1 + 副标 + CTA + 4 数字徽章 (跟 /products, /tools 一致)
//  - 文案: 跟 PM 拍板"首批 50, 后续每周 10" + "5 王牌 + 46 严选" 对齐
//  - 状态日期: 2026-08-16
// v22.0 Phase 7.24 Batch 10 PATCH2: 3fr_2fr 比例 + 4 钩子
// v22.0 Phase 7.24 BATCH 15 PATCH 7: items-center → items-start (消除 280px 漏白)
// v22.0 BATCH 19: 标题"看见市场/决策有据" → "看见严选可商用 EA", 副标加 "全 12 品种", 数字徽章 30+→51+
export function Hero() {
  return (
    <section>
      <div className="w-full">
        {/* v22.0 BATCH 19: 3fr_2fr 比例保持
            - 左 60%: tag + h1 + 副标 + 2 CTA
            - 右 40%: tag + MQL5 代码卡 + 4 数字徽章 + 4 钩子 */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-8 xl:gap-12 items-start">
          {/* 左: 文案 + CTA (60% 宽度) */}
          <div className="flex flex-col">
            {/* 顶部 tag 行: 类目 + 状态徽章 (跟 /products, /tools 一致) */}
            <div className="flex items-center gap-3 text-xs mb-4">
              <span className="text-accent-purple tracking-widest uppercase">首页 · HOME</span>
              <span className="text-text-muted">严选订阅 · 链上 USDT 结算</span>
              <span className="text-text-secondary">·</span>
              <span className="inline-flex items-center gap-1.5 text-text-muted">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-up" />
                <span className="num">2026-08-16</span>
                <span>· 首批 50 上线 · 后续每周 10 增量</span>
              </span>
            </div>

            {/* 巨型标题 - v22.0 BATCH 19: 跟 /products "严选可商用 EA" 对齐 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold leading-[1.08] tracking-tight mb-4 text-text-primary">
              看见<span className="text-accent-blue">严选</span>
              <br />
              可商用 <span className="text-accent-blue">EA</span>
            </h1>

            {/* 副标: v22.0 BATCH 19: 跟品牌口径对齐 */}
            <p className="text-sm lg:text-base xl:text-lg text-text-secondary mb-6 leading-relaxed">
              <span className="text-text-primary font-semibold num">XAUUSD 黄金</span>
              <span> · </span>
              <span className="text-text-primary font-semibold num">XAUUSD/JPY · XAUUSD/CNH</span>
              <span> 黄金套利对 · </span>
              <span className="text-text-primary font-semibold num">全 12 品种</span>
              <span> · 严选合规再分发 · 持续更新中</span>
              <span className="block mt-2 text-text-muted text-sm">
                <span className="text-text-primary font-semibold num">5 王牌门面 + 46 严选订阅</span>
                <span> · 投研教程 / 工具 · 链上 USDT 订阅 — 一站覆盖</span>
              </span>
            </p>

            {/* CTA: 主 + 次 (跟 /products 一致) */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/membership"
                className="btn-primary inline-flex items-center justify-center gap-2 text-base px-7 py-3.5"
              >
                立即开通
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/products"
                className="btn-outline inline-flex items-center justify-center gap-2 text-base px-7 py-3.5"
              >
                <Code2 size={18} />
                浏览 51 款可商用策略
              </Link>
            </div>
          </div>

          {/* 右: 标题 + MQL5 代码卡 + 4 数字徽章 + 4 钩子 (40% 宽度) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-blue" />
              <span>严选源码片段</span>
              <span className="text-text-secondary">·</span>
              <span className="text-text-primary font-medium">仓位风控核心逻辑</span>
            </div>

            {/* MQL5 代码卡 */}
            <div className="w-full card-base overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-bg-tertiary">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-down/70" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold/70" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-up/70" />
                </div>
                <span className="text-[10px] text-text-muted font-mono truncate">
                  Trade_Manager.mq5
                </span>
              </div>
              <pre className="px-3 py-2.5 text-[10px] xl:text-[11px] 2xl:text-xs leading-snug font-mono text-text-secondary overflow-x-auto">
                <code>
                  <span className="text-text-muted">{"// 仓位风控 - 单笔手数 + 总仓上限 + Magic 校验"}</span>
                  {"\n"}
                  <span className="text-accent-blue">{"input double"}</span>
                  <span className="text-text-primary">{" RiskPercent = "}</span>
                  <span className="text-accent-gold">{"1.0"}</span>
                  <span className="text-text-muted">{";   // 单笔风险 %"}</span>
                  {"\n"}
                  <span className="text-accent-blue">{"input int"}</span>
                  <span className="text-text-primary">{"    MaxPositions = "}</span>
                  <span className="text-accent-gold">{"3"}</span>
                  <span className="text-text-muted">{";     // 总持仓上限"}</span>
                  {"\n"}
                  <span className="text-accent-blue">{"input ulong"}</span>
                  <span className="text-text-primary">{"   EA_MAGIC    = "}</span>
                  <span className="text-accent-gold">{"2025001"}</span>
                  <span className="text-text-muted">{";   // EA 标识"}</span>
                  {"\n\n"}
                  <span className="text-text-muted">{"if (PositionsTotal() >= MaxPositions) {"}</span>
                  {"\n"}
                  <span className="text-accent-down">{"    return"}</span>
                  <span className="text-text-muted">{";  // 仓位硬上限"}</span>
                  {"\n"}
                  <span className="text-text-muted">{"}"}</span>
                </code>
              </pre>
              <div className="px-3 py-1.5 border-t border-border bg-bg-tertiary text-[10px] text-text-muted font-mono flex items-center justify-between">
                <span>MQL5 · v5.0 build 4885</span>
                <span className="text-accent-up">● 已审计</span>
              </div>
            </div>

            {/* 4 数字徽章 (横向填满 40% 宽度) - v22.0 BATCH 19: 30+→51+, 4h 工单/严选授权/链上 USDT 保持 */}
            <div className="grid grid-cols-4 border-y border-border">
              {[
                { value: "51+", label: "款严选策略" },
                { value: "4h", label: "工单响应" },
                { value: "严选", label: "可商用授权" },
                { value: "链上", label: "USDT 结算" },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`px-2 py-2.5 text-center ${
                    i < 3 ? "border-r border-border" : ""
                  }`}
                >
                  <div className="text-base lg:text-lg font-bold text-text-primary num leading-tight">
                    {m.value}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {/* 4 钩子 (从左移到右, 让左更紧凑, 右更有密度) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Code2 size={12} className="text-accent-blue" />
                <span>MQL4 / MQL5 源码可读</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-accent-gold" />
                <span>USDT 周 / 月 / 年付</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calculator size={12} className="text-accent-up" />
                <Link href="/tools" className="hover:text-text-primary transition-colors">
                  6 款实战工具
                </Link>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-accent-up text-[10px]">●</span>
                <span>4h 工单 · 终身质保</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
