import Link from "next/link";
import { ArrowRight, Code2, Zap, Calculator } from "lucide-react";
import { BRAND } from "@/config/brand";

// L4 v1.7: 修回简洁 (PM 反馈 v1.6 过度拟合)
// - 删装饰 K 线 SVG (22 根假蜡烛视觉污染)
// - 删 2 浮卡 (XAUUSD 回测 +2.34% 是假数据)
// - 删 .gradient-hero 径向辉光 → 改纯色 bg-bg-primary
// - 文案聚焦: XAUUSD 黄金 / EURUSD · GBPUSD 外汇主流对
// - 钩子从 4 缩到 2 (MQL 源码可读 + USDT 周月年付)
export function Hero() {
  return (
    <section>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-10 items-center">
          {/* 左: 文案 + CTA */}
          <div className="flex flex-col">
            {/* 状态徽章 - v22.0 Phase 2.1-A: 去边框 + 去底色 → 纯文字 (cn.investing 顶部风格, 反 AI 卡片感) */}
            <div className="flex items-center gap-2 mb-6 text-xs text-text-muted">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-up" />
              <span className="num">2026-08-09</span>
              <span className="text-text-secondary">·</span>
              <span>首批精选 · 已上线 · 持续更新 · 严选订阅服务</span>
            </div>

            {/* 巨型标题 - FXSSI 调性: 客户视角 + 行动引导 + 决策辅助 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-4 text-text-primary">
              看见<span className="text-accent-blue">市场</span>
              <br />
              决策有据
            </h1>

            {/* 副标: 黄金外汇专精 + 情绪辅助 */}
            <p className="text-sm lg:text-base text-text-secondary mb-6 max-w-xl leading-relaxed">
              <span className="text-text-primary font-semibold num">XAUUSD 黄金</span>
              <span> · </span>
              <span className="text-text-primary font-semibold num">EURUSD / GBPUSD</span>
              <span> 外汇主流对</span>
              <span className="block mt-2 text-text-muted text-sm">
                严选合规再分发 · 持续更新中 · {BRAND.slogan.zh}
              </span>
            </p>

            {/* 单 CTA (主) + 次 CTA - FXSSI 调性: 行动闭环 */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Link
                href="/membership"
                className="btn-primary inline-flex items-center justify-center gap-2 text-base px-6 py-3"
              >
                立即开通
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/products"
                className="btn-outline inline-flex items-center justify-center gap-2 text-base px-6 py-3"
              >
                <Code2 size={18} />
                浏览可商用策略
              </Link>
            </div>

            {/* 2 钩子 (v1.6 是 4 个) - 客户视角 + 价值传递 */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted">
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
            </div>
          </div>

          {/* 右: MQL5 EA 代码高亮卡 (task060 2.1 - 替代 PM 占位) */}
          <div className="flex items-center justify-center">
            <div className="w-full card-base overflow-hidden">
              {/* 终端标题条 */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-bg-tertiary">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-down/70" />
                  <span className="w-2 h-2 rounded-full bg-accent-gold/70" />
                  <span className="w-2 h-2 rounded-full bg-accent-up/70" />
                </div>
                <span className="text-[10px] text-text-muted font-mono">
                  peterthomet/Trade_Manager.mq5
                </span>
              </div>
              {/* 代码块 */}
              <pre className="px-4 py-3 text-[11px] leading-relaxed font-mono text-text-secondary overflow-x-auto">
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
              {/* 底部状态 */}
              <div className="px-4 py-2 border-t border-border bg-bg-tertiary text-[10px] text-text-muted font-mono flex items-center justify-between">
                <span>MQL5 · v5.0 build 4885</span>
                <span className="text-accent-up">● 已审计</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
