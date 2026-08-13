// src/app/(marketing)/tools/page.tsx
// v22.0 Phase 4.1: 工具区首页 (6 工具卡片网格入口)
// v22.0 Phase 7.24 Batch 10 PATCH: 重做 - 跟 /guides v2 风格对齐 (大卡片 + 缩略图 + 钩子 + 实战场景)
import Link from "next/link";
import { TOOLS } from "./layout";

// 每个工具的 emoji 图标 (钩子)
const TOOL_ICON: Record<string, string> = {
  fibonacci: "𝟐𝟑.𝟔",
  "pivot-point": "𝐑/𝐒",
  "position-size": "𝟎.𝟎𝟐",
  "pip-value": "$𝟏",
  "risk-reward": "𝟏:𝟑",
  "forex-calculator": "𝟗",
};

export default function ToolsPage() {
  return (
    <div className="space-y-8 pt-2 sm:pt-12 lg:pt-14 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
      {/* 头部: 钩子 + 节奏 */}
      <header className="border-b border-border pb-6">
        <div className="text-xs uppercase tracking-wider text-text-muted mb-3">
          6 款实战工具
        </div>
        <h1 className="h1 mb-4">
          6 款算得清楚的<br />
          <span className="text-accent-blue">实战工具</span>。
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl leading-[24px]">
          严选 XAUUSD 黄金与黄金套利对日常交易场景的高频计算工具。
          每个工具对应一个实战决策环节: 开仓前算仓位 / 持仓中算盈亏 / 平仓后复盘 R:R。
        </p>
      </header>

      {/* 6 卡片 grid (2x3, 跟 /guides v2 风格对齐) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {TOOLS.map((t, idx) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="group block border border-border bg-bg-card hover:border-accent-blue transition-colors"
          >
            {/* 缩略图块 (16:9 + 大数字钩子 + 类目徽章) */}
            <div className="relative aspect-[16/9] flex items-center justify-center bg-bg-secondary overflow-hidden">
              <div className="text-5xl lg:text-6xl font-bold text-text-muted opacity-40 group-hover:opacity-60 transition-opacity font-mono">
                {TOOL_ICON[t.slug] ?? "•"}
              </div>
              <div className="absolute top-2 left-2">
                <span className="inline-block px-2 py-0.5 border border-accent-blue/30 text-accent-blue text-[10px]">
                  {t.category}
                </span>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] num font-mono">
                {String(idx + 1).padStart(2, "0")} / 06
              </div>
            </div>
            {/* 卡片内容 */}
            <div className="p-4 lg:p-5">
              <h3 className="text-base lg:text-lg font-semibold text-text-primary leading-snug mb-2 group-hover:text-accent-blue transition-colors">
                {t.name}
              </h3>
              <p className="text-sm text-text-secondary leading-[22px] line-clamp-2 mb-3">
                {t.desc}
              </p>
              <div className="flex items-center justify-between text-[10px] text-text-muted pt-3 border-t border-border">
                <span>客户端计算 · 数据不上传</span>
                <span className="text-accent-blue group-hover:underline">
                  进入 →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 底部提示: 工具使用注意 (1px 底边线 + 实战场景列点) */}
      <div className="border-t border-border pt-6 space-y-3">
        <div className="text-xs uppercase tracking-wider text-text-muted">
          工具使用注意
        </div>
        <ul className="text-sm text-text-secondary leading-[24px] space-y-1">
          <li>· 斐波那契 / 枢轴点用于技术分析入场判断</li>
          <li>· 持仓规模 / 点值&盈亏 / 风险回报比用于风险管理</li>
          <li>· 汇率换算为基础工具</li>
          <li>· 所有计算在客户端运行, 数据不上传服务器</li>
          <li>· 实盘前请以 MT4/MT5 终端报价为准</li>
        </ul>
      </div>
    </div>
  );
}
