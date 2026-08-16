// src/app/(marketing)/tools/page.tsx
// v22.0 Phase 4.1: 工具区首页 (6 工具卡片网格入口)
// v22.0 Phase 7.24 Batch 10 PATCH: 重做 - 跟 /guides v2 风格对齐 (大卡片 + 缩略图 + 钩子 + 实战场景)
// v22.0 BATCH 19 (2026-08-16 23:00): 3 营销页 hero 排版 + 文案统一
//  - 模板: tag + h1 + 副标 + 4 数字徽章 (跟 /, /products 一致)
//  - 文案: 跟 PM 拍板"首批 50, 后续每周 10" + "5 王牌 + 46 严选" 对齐
//  - 状态日期: 2026-08-16
// v22.0 BATCH 21 (2026-08-16 23:50): 缩略图程序化重做
//  - 旧: 大数字 emoji (𝟐𝟑.𝟔 / 𝐑/𝐒 / 𝟎.𝟎𝟐 / $𝟏 / 𝟏:𝟑 / 𝟗) — AI 艺术大字感
//  - 新: 6 个程序化 SVG (黄金螺旋 / 枢轴点 / 圆环 / 阶梯柱 / 对比柱 / Venn)
//  - 风格: 几何/数据图, 跟 fxssi 工具图一致, 干净清晰, 无 AI 艺术
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOOLS } from "./layout";
import { ToolIcon } from "@/components/tools/ToolIcon";
import { buildSeoMetadata } from "@/lib/seo";

// v22.0 BATCH 22 PATCH B (2026-08-17 00:40): 工具区 SEO 完整
//  - 6 款工具是核心 SEO 资产 (Google 搜索 "斐波那契回撤" / "仓位计算器" 都引流到这)
//  - 客户端计算不上传, 数据安全是核心卖点
export const metadata = buildSeoMetadata({
  title: "6 款实战工具 - 斐波那契 / 枢轴点 / 仓位 / R:R 客户端计算 | CProTrading",
  description:
    "严选 XAUUSD 黄金 + 黄金套利对日常交易场景的高频计算工具: 斐波那契回撤 / 枢轴点 / 持仓规模 / 点值&盈亏 / 风险回报比 / 汇率换算。客户端运行, 数据不上传。",
  path: "/tools",
  keywords: ["斐波那契回撤", "枢轴点", "持仓规模", "点值计算", "风险回报比", "R:R", "XAUUSD", "仓位计算器"],
});

export default function ToolsPage() {
  return (
    <div className="pt-2 sm:pt-12 lg:pt-14 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto space-y-6 lg:space-y-8">
      {/* v22.0 BATCH 19: 紧凑 hero (跟 / 和 /products 一致)
          - 模板: tag + h1 + 副标 + 4 数字徽章
          - 钩子: 6 款 / 客户端 / 数据安全 / 持续更新 */}
      <header className="border-b border-border pb-6 space-y-3">
        {/* 顶部 tag 行: 类目 + 状态徽章 (跟 /, /products 一致) */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-accent-purple tracking-widest uppercase">工具 · TOOLS</span>
          <span className="text-text-muted">客户端计算 · 数据不上传</span>
          <span className="text-text-secondary">·</span>
          <span className="inline-flex items-center gap-1.5 text-text-muted">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-up" />
            <span className="num">2026-08-16</span>
            <span>· 6 款在线 · 持续打磨中</span>
          </span>
        </div>

        {/* h1 + 副标 + CTA (跟 /, /products 一致 3fr_2fr grid) */}
        <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-6 xl:gap-10 items-end">
          <div className="space-y-2">
            <h1 className="h1">
              算得清楚的<br />
              <span className="text-accent-blue">6 款</span>实战工具
            </h1>
            <p className="text-sm lg:text-base text-text-secondary leading-relaxed max-w-3xl">
              严选 XAUUSD 黄金 + 黄金套利对日常交易场景的高频计算工具。
              <span className="block mt-1.5 text-text-muted text-xs">
                每个工具对应一个实战决策环节: 开仓前算仓位 / 持仓中算盈亏 / 平仓后复盘 R:R。
              </span>
            </p>
          </div>
          {/* CTA 区域 (跟 / 一致, 主 + 副) */}
          <div className="flex flex-col sm:flex-row gap-3 xl:justify-end">
            <a
              href="#tools-grid"
              className="btn-primary inline-flex items-center justify-center gap-2 text-base px-7 py-3.5"
            >
              进入工具
              <ArrowRight size={18} />
            </a>
            <Link
              href="/products"
              className="btn-outline inline-flex items-center justify-center gap-2 text-base px-7 py-3.5"
            >
              51 款可商用策略
            </Link>
          </div>
        </div>

        {/* 4 数字徽章 (跟 /, /products 一致) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-border">
          {[
            { value: "6", label: "款在线工具" },
            { value: "客户端", label: "数据不上传" },
            { value: "严选", label: "可商用授权" },
            { value: "持续", label: "打磨中" },
          ].map((m, i) => (
            <div
              key={i}
              className={`px-3 py-2.5 text-center ${i < 3 ? "border-r border-border" : ""}`}
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
      </header>

      {/* 6 卡片 grid (2x3, 跟 /guides v2 风格对齐) */}
      <div id="tools-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {TOOLS.map((t, idx) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="group block border border-border bg-bg-card hover:border-accent-blue transition-colors"
          >
            {/* 缩略图块 (16:9 + 程序化 SVG 钩子 + 类目徽章) - v22.0 BATCH 21 重做 */}
            <div className="relative aspect-[16/9] flex items-center justify-center bg-bg-secondary overflow-hidden p-3">
              <ToolIcon slug={t.slug} className="w-full h-full" />
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
