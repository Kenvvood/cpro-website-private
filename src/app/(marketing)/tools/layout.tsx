// src/app/(marketing)/tools/layout.tsx
// v22.0 Phase 4: 工具区共享 layout (减少 AI 感的对称布局 → 侧栏导航 + 内容区)
// 借鉴 dailyfx.com.hk 的两列布局 (左侧分类导航 + 右侧工具内容)
// v22.0 Phase 7.24 Batch 10: 加 useCase 实战场景段
import { Footer } from "@/components/layout/footer";

const TOOLS = [
  {
    slug: "fibonacci",
    name: "斐波那契回撤",
    desc: "23.6 / 38.2 / 50 / 61.8 / 78.6 关键位",
    category: "技术分析",
    useCase: "实战中, 斐波那契常用于判断回调结束位。例: 黄金 1H 图, 价格从 2300 上涨到 2400 后回调, 多数情况下会落在 0.382 (2366) 或 0.5 (2350) 附近。这两个位置是 1H 趋势的入场点, 配合蜡烛形态确认反转即可挂单。",
  },
  {
    slug: "pivot-point",
    name: "枢轴点",
    desc: "R1-R3 / S1-S3 支撑阻力",
    category: "技术分析",
    useCase: "枢轴点适合日内交易。伦敦开盘 (北京时间 16:00) 用前一交易日数据计算当日 PP / R1-R3 / S1-S3, 价格突破 R1 看多, 跌破 S1 看空, PP 附近震荡观望。XAUUSD 在 R1/S1 突破后的 1-2 根 1H K 线, 80% 会走出 100-300 点行情。",
  },
  {
    slug: "position-size",
    name: "持仓规模",
    desc: "XAUUSD 一标准手 = 100 oz",
    category: "风险管理",
    useCase: "核心公式: 仓位 = 账户余额 × 风险比例 ÷ (止损点数 × 点值)。例: 1 万 USDT 账户, 风险 1% (100 USDT), 止损 50 点, 点值 1 USD/点 → 仓位 = 0.02 手。这是单笔交易的最大安全仓位, 超过即违规风控。",
  },
  {
    slug: "pip-value",
    name: "点值 & 盈亏",
    desc: "每点价值 + 多空盈亏",
    category: "风险管理",
    useCase: "XAUUSD 1 标准手每点 1 USD, 0.01 手每点 0.1 USD。例: 0.05 手做多 2300, 平仓 2350 (盈利 500 点), 实际盈利 0.05 × 500 × 1 = 25 USD。反向亦然, 500 点亏损 = -25 USD。配合止损位可提前算出最大亏损。",
  },
  {
    slug: "risk-reward",
    name: "风险回报比",
    desc: "止损止盈 R:R 评估",
    category: "风险管理",
    useCase: "R:R < 1:2 的单子不建议入场。专业 EA 普遍要求 R:R ≥ 1:2, 1:3 更佳。例: 止损 50 点, 止盈 150 点 = 1:3, 即便胜率只有 40%, 长期仍盈利 (40%×150 - 60%×50 = 60 - 30 = +30 点/单)。R:R 是风控最核心的指标。",
  },
  {
    slug: "forex-calculator",
    name: "汇率换算",
    desc: "9 币种实时换算",
    category: "基础工具",
    useCase: "出金换算最常用。例: 1 笔 1000 USDT 分润, 您希望换算成 USD 直接出金 (避免二次换汇损失), 或换算成 CNY 看实际到手。本工具支持 USD / EUR / GBP / JPY / AUD / CAD / CHF / HKD / CNY 9 币种实时换算, 汇率每 30 分钟更新。",
  },
];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
          {/* 左侧工具导航 (简洁版, 跟 /guides 大卡片风格匹配) */}
          <aside className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-text-muted">
              工具导航
            </div>
            <nav className="border-y border-border">
              {TOOLS.map((t, i) => (
                <a
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="flex items-baseline gap-2 px-2 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border-b border-border last:border-0 transition-colors group"
                >
                  <span className="text-[10px] text-text-muted num font-mono w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium truncate">{t.name}</span>
                </a>
              ))}
            </nav>
            <div className="text-[10px] text-text-muted leading-relaxed">
              客户端计算 · 数据不上传 · 实盘前请以 MT4/MT5 终端报价为准。
            </div>
          </aside>
          {/* 右侧内容区 */}
          <div>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export { TOOLS };
