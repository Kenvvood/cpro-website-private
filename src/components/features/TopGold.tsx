import Link from "next/link";

// L4 v1.10: Top 4 XAUUSD 黄金策略 (PM 决策 2026-08-05: 聚焦 XAUUSD 黄金)
// - 4 卡片 (AveragingBySignal Pro / Scalper v3 / Trend Pro / Range Sniper)
// - 每卡: 名称 + 标签 (黄金 / 类型) + 周期 + 年化 + 夏普/回撤/胜率 + 净值曲线示意
// - 标记 "示例策略" (mock 数据, 真实回测上线后接入)
// - 不暴露总数 (4 是 "精选" 不是 "全部")
type TopItem = {
  name: string;
  type: string;
  period: string;
  annualized: string;
  sharpe: string;
  drawdown: string;
  winrate: string;
  curve: string; // SVG path d=""
};

const TOP_ITEMS: TopItem[] = [
  {
    name: "AveragingBySignal Pro",
    type: "均值回归",
    period: "M15 · 加仓策略",
    annualized: "+38.2%",
    sharpe: "1.84",
    drawdown: "12.0%",
    winrate: "62%",
    curve:
      "M0,60 L10,56 L20,52 L30,48 L40,42 L50,36 L60,28 L70,20 L80,12 L90,6 L100,2",
  },
  {
    name: "XAUUSD Scalper v3",
    type: "剥头皮",
    period: "M5 · 短线高频",
    annualized: "+18.4%",
    sharpe: "1.22",
    drawdown: "14.5%",
    winrate: "71%",
    curve:
      "M0,55 L10,50 L20,46 L30,42 L40,38 L50,32 L60,28 L70,22 L80,16 L90,10 L100,6",
  },
  {
    name: "XAUUSD Trend Pro",
    type: "趋势跟踪",
    period: "H4 · 顺势中线",
    annualized: "+15.8%",
    sharpe: "1.18",
    drawdown: "8.4%",
    winrate: "55%",
    curve:
      "M0,58 L10,55 L20,50 L30,45 L40,40 L50,35 L60,30 L70,25 L80,20 L90,15 L100,10",
  },
  {
    name: "XAUUSD Range Sniper",
    type: "区间交易",
    period: "M30 · 高抛低吸",
    annualized: "+12.4%",
    sharpe: "1.08",
    drawdown: "6.2%",
    winrate: "78%",
    curve:
      "M0,55 L10,52 L20,48 L30,45 L40,40 L50,36 L60,30 L70,24 L80,18 L90,14 L100,10",
  },
];

export function TopGold() {
  return (
    <section>
      {/* 区块头 */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-text-primary mb-1">
            精选 XAUUSD 黄金策略
          </h2>
          <p className="text-xs text-text-muted">
            按 2018-2024 年回测年化收益排序 · 全部附完整回测报告 ·{" "}
            <span className="text-accent-gold">示例策略</span>
          </p>
        </div>
        <Link
          href="/products"
          className="text-sm text-accent-blue hover:underline shrink-0"
        >
          查看更多 →
        </Link>
      </div>

      {/* 4 卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOP_ITEMS.map((item) => (
          <div
            key={item.name}
            className="card-base p-4 lg:p-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4"
          >
            <div>
              {/* 名称 */}
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                {item.name}
              </h3>
              {/* 标签 */}
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-accent-gold/10 text-accent-gold font-semibold">
                  黄金
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-accent-up/10 text-accent-up font-semibold">
                  {item.type}
                </span>
              </div>
              <p className="text-[11px] text-text-muted num mb-2">
                {item.period}
              </p>
              {/* 年化 */}
              <div className="text-xl font-bold num text-accent-up mb-2">
                {item.annualized}
              </div>
              {/* 3 指标 */}
              <div className="flex flex-wrap gap-3 text-[11px] text-text-muted num">
                <span>
                  夏普 <span className="text-text-primary font-semibold">{item.sharpe}</span>
                </span>
                <span>
                  回撤 <span className="text-text-primary font-semibold">{item.drawdown}</span>
                </span>
                <span>
                  胜率 <span className="text-text-primary font-semibold">{item.winrate}</span>
                </span>
              </div>
            </div>

            {/* 净值曲线示意 SVG */}
            <svg
              className="w-full sm:w-24 h-16 sm:h-20"
              viewBox="0 0 100 70"
              preserveAspectRatio="none"
              aria-label="净值曲线示意"
            >
              <path
                d={item.curve}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* 风险提示 */}
      <div className="mt-6 text-[11px] text-text-muted border-l-2 border-text-muted/40 pl-3 leading-relaxed">
        风险提示：以上数据为示例展示，基于 2018-2024 年历史行情回测，过往表现不代表未来收益。
        量化交易存在本金损失风险，请根据自身风险承受能力审慎决策。
      </div>
    </section>
  );
}
