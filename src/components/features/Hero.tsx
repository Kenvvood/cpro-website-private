import Link from "next/link";
import { ArrowRight, Code2, Zap, Calculator, ShieldCheck } from "lucide-react";
import { BRAND } from "@/config/brand";

// L4 v1.7: 修回简洁 (PM 反馈 v1.6 过度拟合)
// v22.0 Phase 7.24 Batch 10 PATCH: 1fr_1fr 平衡左右密度 (PM 反馈 2fr_1fr 左挤右空)
// v22.0 Phase 7.24 Batch 10 PATCH2: 3:2 比例 + 4 钩子移到右侧 (PM 反馈 1:1 中间空, 左 5 块 vs 右 3 块密度差)
export function Hero() {
  return (
    <section>
      <div className="w-full">
        {/* v22.0 Phase 7.24 Batch 10 PATCH2: 3fr_2fr (60:40) 比例
            - 左 60%: 状态 + 标题 + 副标 + 2 CTA (减 4 钩子)
            - 右 40%: 小标 + MQL5 代码卡 + 4 数字徽章 + 4 钩子 (新增)
            - 左右密度平衡, 中间不空 */}
        {/* v22.0 Phase 7.24 BATCH 15 PATCH 5: items-center → items-start
            (PM 反馈 PATCH 1-4 没消除 280px 漏白, 根因: items-center 把内容垂直居中到 750px 高 grid 父 div)
            (Playwright 实测: Header 108 + items-center 居中 = h1 y=443, 漏白 335px)
            (改 items-start 后 h1 紧跟 pt 顶部, 漏白立刻从 335 → 64px)
            (PM 拍板: "LOGO 字号 11/20, 滚动条下空白能否消除" — 一行改, 不改 Hero 内部布局) */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-8 xl:gap-12 items-start">
          {/* 左: 文案 + CTA (60% 宽度) */}
          <div className="flex flex-col">
            {/* 状态徽章 */}
            <div className="flex items-center gap-2 mb-4 text-xs text-text-muted">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-up" />
              <span className="num">2026-08-09</span>
              <span className="text-text-secondary">·</span>
              <span>首批精选 · 已上线 · 持续更新 · 严选订阅服务</span>
            </div>

            {/* 巨型标题 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold leading-[1.08] tracking-tight mb-4 text-text-primary">
              看见<span className="text-accent-blue">市场</span>
              <br />
              决策有据
            </h1>

            {/* 副标: 2 句 (v22.0 Phase 7.24 Batch 11: EURUSD/GBPUSD → 套利对, 项目只涉猎 XAUUSD + 套利对) */}
            <p className="text-sm lg:text-base xl:text-lg text-text-secondary mb-6 leading-relaxed">
              <span className="text-text-primary font-semibold num">XAUUSD 黄金</span>
              <span> · </span>
              <span className="text-text-primary font-semibold num">XAUUSD/JPY · XAUUSD/CNH</span>
              <span> 黄金套利对 · 严选合规再分发 · 持续更新中</span>
              <span className="block mt-2 text-text-muted text-sm">
                可商用 EA 策略 · 投研教程 / 工具 · 链上 USDT 订阅 — 一站覆盖
                <span className="text-text-primary font-semibold"> 严选、再分发、可审计</span>
              </span>
            </p>

            {/* 单 CTA (主) + 次 CTA */}
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
                浏览可商用策略
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

            {/* 4 数字徽章 (横向填满 40% 宽度) */}
            <div className="grid grid-cols-4 border-y border-border">
              {[
                { value: "30+", label: "款策略" },
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
                  实战工具集
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
