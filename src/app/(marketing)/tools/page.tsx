// src/app/(marketing)/tools/page.tsx
// v22.0 Phase 4.1: 工具区首页 (6 工具网格入口)
// 借鉴 dailyfx.com.hk 的 2 列 4 排网格布局
import Link from "next/link";
import { TOOLS } from "./layout";

export const metadata = {
  title: "交易者工具箱 - CProTrading",
  description: "XAUUSD 与外汇主流对的实战计算工具: 斐波那契回撤 / 枢轴点 / 持仓规模 / 点值&盈亏 / 风险回报比 / 汇率换算",
};

export default function ToolsPage() {
  return (
    <div className="space-y-8">
      {/* 头部: 不是"AI 演示"式对称, 用 left-aligned + 行业细节 */}
      <header className="border-b border-border pb-6">
        <div className="text-xs uppercase tracking-wider text-text-muted mb-2">
          6 款实战工具
        </div>
        <h1 className="h1 mb-3">交易者工具箱</h1>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          严选 XAUUSD 与外汇主流对日常交易场景的高频计算工具，从技术分析到风险管理。
          每个工具对应一个实战决策环节：开仓前算仓位 / 持仓中算盈亏 / 平仓后复盘 R:R。
        </p>
      </header>

      {/* 6 工具网格: 2 列 × 3 行 (避免"AI 演示"式 3 列对称, 改 2 列减少对称感) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="card-base p-5 hover:border-accent-blue transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                {t.category}
              </span>
              <span className="text-xs text-text-muted group-hover:text-accent-blue transition-colors">
                进入 →
              </span>
            </div>
            <h2 className="h3 mb-2">{t.name}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{t.desc}</p>
          </Link>
        ))}
      </div>

      {/* 底部提示: 不是"广告式", 是"工具使用注意" */}
      <div className="text-xs text-text-muted border-t border-border pt-6 leading-relaxed">
        工具按实战场景排序。斐波那契 / 枢轴点用于技术分析入场判断；持仓规模 / 点值&盈亏 / 风险回报比用于风险管理；汇率换算为基础工具。
        所有计算在客户端运行，数据不上传服务器。
      </div>
    </div>
  );
}
