// src/app/(marketing)/tools/page.tsx
// v22.0 Phase 4.1: 工具区首页 (6 工具卡片网格入口)
// v22.0 Phase 2.1-E: 去 6 卡片 → 1 张密集表格 (反 AI 卡片感)
// 借鉴 dailyfx.com.hk 的工具列表 (密集行 + 1px 底边线)
import Link from "next/link";
import { TOOLS } from "./layout";

export const metadata = {
  title: "交易者工具箱 - CProTrading",
  description: "XAUUSD 与外汇主流对的实战计算工具: 斐波那契回撤 / 枢轴点 / 持仓规模 / 点值&盈亏 / 风险回报比 / 汇率换算",
};

export default function ToolsPage() {
  return (
    <div className="space-y-8">
      {/* 头部: 行业细节 (去卡片, left-aligned) */}
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

      {/* 1 张密集表格 (6 行, dailyfx 工具列表风格) */}
      <div className="border-y border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
              <th className="text-left py-2 px-2 font-normal w-12">#</th>
              <th className="text-left py-2 px-2 font-normal">工具</th>
              <th className="text-left py-2 px-2 font-normal hidden sm:table-cell">类别</th>
              <th className="text-left py-2 px-2 font-normal hidden md:table-cell">简介</th>
              <th className="text-right py-2 px-2 font-normal w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {TOOLS.map((t, i) => (
              <tr
                key={t.slug}
                className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors group cursor-pointer"
                onClick={() => window.location.href = `/tools/${t.slug}`}
              >
                <td className="py-3 px-2 text-text-muted num text-xs w-12">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="py-3 px-2">
                  <Link
                    href={`/tools/${t.slug}`}
                    className="text-text-primary font-medium group-hover:text-accent-blue transition-colors"
                  >
                    {t.name}
                  </Link>
                </td>
                <td className="py-3 px-2 text-xs text-text-secondary hidden sm:table-cell">
                  {t.category}
                </td>
                <td className="py-3 px-2 text-xs text-text-muted hidden md:table-cell">
                  {t.desc}
                </td>
                <td className="py-3 px-2 text-right text-xs text-accent-blue group-hover:underline">
                  进入 →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部提示: 工具使用注意 (保留) */}
      <div className="text-xs text-text-muted border-t border-border pt-6 leading-relaxed">
        工具按实战场景排序。斐波那契 / 枢轴点用于技术分析入场判断；持仓规模 / 点值&盈亏 / 风险回报比用于风险管理；汇率换算为基础工具。
        所有计算在客户端运行，数据不上传服务器。
      </div>
    </div>
  );
}
