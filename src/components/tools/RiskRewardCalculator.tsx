"use client";
// RiskRewardCalculator — 风险回报比 (交易策略评估)
// 输入: 入场价 / 止损价 / 止盈价 / 仓位手数
// 输出: R:R 比率 + 潜在盈亏 + 建议 (≥ 1:2 是常见门槛)
import { useState } from "react";

type Direction = "long" | "short";

export function RiskRewardCalculator() {
  const [entry,      setEntry]      = useState("3320.00");
  const [stopLoss,   setStopLoss]   = useState("3310.00");
  const [takeProfit, setTakeProfit] = useState("3340.00");
  const [direction,  setDirection]  = useState<Direction>("long");

  const e  = parseFloat(entry);
  const sl = parseFloat(stopLoss);
  const tp = parseFloat(takeProfit);
  const valid = !isNaN(e) && !isNaN(sl) && !isNaN(tp) && e > 0 && sl > 0 && tp > 0;

  // 风险距离 (亏损)
  const riskDist = valid ? Math.abs(e - sl) : 0;
  // 回报距离 (盈利)
  const rewardDist = valid ? Math.abs(tp - e) : 0;
  // R:R 比率
  const ratio = valid && riskDist > 0 ? rewardDist / riskDist : 0;
  // 评级
  const rating = !valid ? "" : ratio >= 3 ? "★ 极佳 (≥ 1:3)" : ratio >= 2 ? "★ 良好 (≥ 1:2)" : ratio >= 1 ? "○ 可接受 (≥ 1:1)" : "✗ 差 (< 1:1)";
  const ratingColor = !valid ? "text-text-muted" : ratio >= 2 ? "text-accent-up" : ratio >= 1 ? "text-accent-gold" : "text-accent-down";
  // 方向校验
  const isLongValid = valid && (direction === "long" ? sl < e && tp > e : sl > e && tp < e);

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">入场价 (Entry)</label>
            <input
              type="number" step="0.01" value={entry} onChange={(e) => setEntry(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">方向</label>
            <div className="flex">
              <button
                onClick={() => setDirection("long")}
                className={`flex-1 py-2 text-sm border ${direction === "long" ? "bg-accent-up/20 border-accent-up text-accent-up" : "border-border text-text-secondary hover:bg-bg-tertiary"}`}
              >
                做多 (Long)
              </button>
              <button
                onClick={() => setDirection("short")}
                className={`flex-1 py-2 text-sm border-l-0 border ${direction === "short" ? "bg-accent-down/20 border-accent-down text-accent-down" : "border-border text-text-secondary hover:bg-bg-tertiary"}`}
              >
                做空 (Short)
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">止损价 (Stop Loss)</label>
            <input
              type="number" step="0.01" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
            <p className="text-[10px] text-text-muted mt-1">做多止损 &lt; 入场价 / 做空止损 &gt; 入场价</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">止盈价 (Take Profit)</label>
            <input
              type="number" step="0.01" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
            <p className="text-[10px] text-text-muted mt-1">做多止盈 &gt; 入场价 / 做空止盈 &lt; 入场价</p>
          </div>
        </div>
        {valid && !isLongValid && (
          <p className="text-xs text-accent-down mt-3">
            ⚠ 止损止盈方向与开仓方向不符:{" "}
            {direction === "long" ? "做多需要 止损 &lt; 入场 &lt; 止盈" : "做空需要 止盈 &lt; 入场 &lt; 止损"}
          </p>
        )}
      </div>

      {valid && isLongValid && (
        <div className="card-base overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-bg-tertiary text-sm font-semibold text-text-primary">
            风险回报评估
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">风险距离</div>
              <div className="text-2xl num font-bold text-accent-down">-{riskDist.toFixed(2)}</div>
              <div className="text-[10px] text-text-muted mt-1">潜在亏损 (点)</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">回报距离</div>
              <div className="text-2xl num font-bold text-accent-up">+{rewardDist.toFixed(2)}</div>
              <div className="text-[10px] text-text-muted mt-1">潜在盈利 (点)</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">R:R 比率</div>
              <div className={`text-3xl num font-bold ${ratingColor}`}>
                1 : {ratio.toFixed(2)}
              </div>
              <div className={`text-xs mt-1 ${ratingColor}`}>
                {rating}
              </div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border bg-bg-tertiary text-[10px] text-text-muted leading-relaxed">
            <strong>实战标准:</strong> 常见门槛是 R:R ≥ 1:2 (盈利是亏损的 2 倍才开仓)。
            顶级交易者只做 R:R ≥ 1:3 的机会。R:R &lt; 1:1 的策略即使胜率高, 长期期望值仍为负。
          </div>
        </div>
      )}
    </div>
  );
}
