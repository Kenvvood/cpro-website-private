"use client";
// FibonacciCalculator — 斐波那契回撤/扩展 (K 线核心)
// 输入: high / low / trend (上涨趋势找支撑位 / 下跌趋势找阻力位)
// 输出: 5 个关键回撤位 (23.6% / 38.2% / 50% / 61.8% / 78.6%)
import { useState } from "react";

type Trend = "uptrend" | "downtrend";

const LEVELS = [
  { pct: 0.236, label: "23.6%" },
  { pct: 0.382, label: "38.2%" },
  { pct: 0.5,   label: "50.0%" },
  { pct: 0.618, label: "61.8%" },
  { pct: 0.786, label: "78.6%" },
];

export function FibonacciCalculator() {
  const [high, setHigh] = useState("3350.00");
  const [low,  setLow]  = useState("3280.00");
  const [trend, setTrend] = useState<Trend>("uptrend");

  const h = parseFloat(high);
  const l = parseFloat(low);
  const valid = !isNaN(h) && !isNaN(l) && h > l && h > 0 && l > 0;
  const range = valid ? h - l : 0;

  return (
    <div className="space-y-6">
      {/* 输入区: 不是居中对称, 是表单左对齐 */}
      <div className="card-base p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">最高价 (High)</label>
            <input
              type="number" step="0.01" value={high} onChange={(e) => setHigh(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
              placeholder="3350.00"
            />
            <p className="text-[10px] text-text-muted mt-1">XAUUSD 区间最高点</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">最低价 (Low)</label>
            <input
              type="number" step="0.01" value={low} onChange={(e) => setLow(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
              placeholder="3280.00"
            />
            <p className="text-[10px] text-text-muted mt-1">XAUUSD 区间最低点</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">当前趋势</label>
            <div className="flex">
              <button
                onClick={() => setTrend("uptrend")}
                className={`flex-1 py-2 text-sm border ${trend === "uptrend" ? "bg-accent-up/20 border-accent-up text-accent-up" : "border-border text-text-secondary hover:bg-bg-tertiary"}`}
              >
                上涨 (Uptrend)
              </button>
              <button
                onClick={() => setTrend("downtrend")}
                className={`flex-1 py-2 text-sm border-l-0 border ${trend === "downtrend" ? "bg-accent-down/20 border-accent-down text-accent-down" : "border-border text-text-secondary hover:bg-bg-tertiary"}`}
              >
                下跌 (Downtrend)
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1">回撤 / 反弹方向</p>
          </div>
        </div>
        {!valid && (
          <p className="text-xs text-accent-down mt-3">
            ⚠ 请输入有效价格: 最高价 &gt; 最低价 &gt; 0
          </p>
        )}
      </div>

      {/* 输出区: 5 个关键位 (简洁表格, 不像 AI 演示的"卡片堆叠") */}
      {valid && (
        <div className="card-base overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-bg-tertiary flex items-center justify-between">
            <div className="text-sm font-semibold text-text-primary">
              {trend === "uptrend" ? "回撤支撑位 (Retracement Support)" : "反弹阻力位 (Rebound Resistance)"}
            </div>
            <div className="text-xs text-text-muted num">
              区间: {range.toFixed(2)} | {h.toFixed(2)} - {l.toFixed(2)}
            </div>
          </div>
          <div className="divide-y divide-border">
            {LEVELS.map((lv) => {
              // 上涨趋势: 关键位 = high - range*pct (向下回撤)
              // 下跌趋势: 关键位 = low + range*pct (向上反弹)
              const price = trend === "uptrend" ? h - range * lv.pct : l + range * lv.pct;
              const isKeyLevel = lv.pct === 0.5 || lv.pct === 0.618;
              return (
                <div
                  key={lv.pct}
                  className={`px-5 py-3 flex items-center justify-between ${
                    isKeyLevel ? "bg-accent-blue/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm num text-text-primary w-16">{lv.label}</div>
                    <div className="text-[10px] text-text-muted">
                      {isKeyLevel ? "★ 关键位" : "辅助位"}
                    </div>
                  </div>
                  <div className="text-lg num font-semibold text-accent-blue">
                    {price.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-border bg-bg-tertiary text-[10px] text-text-muted leading-relaxed">
            <strong>实战用法:</strong> 上涨趋势中价格回调到 50% / 61.8% 是常见买入点; 下跌趋势中价格反弹到 50% / 61.8% 是常见做空点。
            50% 不是数学斐波那契数, 但因市场心理惯性被广泛使用。
          </div>
        </div>
      )}
    </div>
  );
}
