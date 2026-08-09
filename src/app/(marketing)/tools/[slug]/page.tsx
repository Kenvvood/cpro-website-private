// src/app/(marketing)/tools/[slug]/page.tsx
// v22.0 Phase 4.2: 工具详情页 (动态路由 + 6 工具分发)
import { notFound } from "next/navigation";
import { TOOLS } from "../layout";
import { FibonacciCalculator } from "@/components/tools/FibonacciCalculator";
import { PivotPointCalculator } from "@/components/tools/PivotPointCalculator";
import { PositionSizeCalculator } from "@/components/tools/PositionSizeCalculator";
import { PipValueCalculator } from "@/components/tools/PipValueCalculator";
import { RiskRewardCalculator } from "@/components/tools/RiskRewardCalculator";
import { ForexCalculator } from "@/components/tools/ForexCalculator";

const CALCULATORS: Record<string, React.ComponentType> = {
  fibonacci: FibonacciCalculator,
  "pivot-point": PivotPointCalculator,
  "position-size": PositionSizeCalculator,
  "pip-value": PipValueCalculator,
  "risk-reward": RiskRewardCalculator,
  "forex-calculator": ForexCalculator,
};

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return { title: "工具未找到 - CProTrading" };
  return {
    title: `${tool.name} - CProTrading 交易者工具箱`,
    description: `${tool.name}: ${tool.desc}`,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const Calculator = CALCULATORS[slug];
  if (!Calculator) notFound();

  const tool = TOOLS.find((t) => t.slug === slug)!;

  return (
    <div className="space-y-6">
      {/* 工具头部: 行业细节 + 类目标签 (避免 AI 演示的居中对称) */}
      <header className="border-b border-border pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-text-muted border border-border px-2 py-0.5">
            {tool.category}
          </span>
          <span className="text-[10px] text-text-muted">
            客户端计算 · 数据不上传
          </span>
        </div>
        <h1 className="h1 mb-2">{tool.name}</h1>
        <p className="text-sm text-text-secondary leading-relaxed">{tool.desc}</p>
      </header>

      {/* 工具计算器主体 */}
      <Calculator />

      {/* 工具使用提示: 不是"广告", 是"实战场景" */}
      <div className="text-xs text-text-muted border-t border-border pt-4 leading-relaxed">
        <strong className="text-text-secondary">使用注意:</strong>{" "}
        所有计算结果为参考, 实盘前请以 MT4/MT5 终端报价为准。计算逻辑基于行业标准公式, 不构成投资建议。
      </div>
    </div>
  );
}
