"use client";
// PivotPointCalculator — 枢轴点 (Floor Pivot Points, K 线日内核心)
// 输入: 昨日 high / low / close
// 输出: PP (枢轴) + R1/R2/R3 (阻力) + S1/S2/S3 (支撑)
import { useState } from "react";

export function PivotPointCalculator() {
  const [high,   setHigh]   = useState("3345.50");
  const [low,    setLow]    = useState("3290.20");
  const [close,  setClose]  = useState("3325.80");

  const h  = parseFloat(high);
  const l  = parseFloat(low);
  const c  = parseFloat(close);
  const valid = !isNaN(h) && !isNaN(l) && !isNaN(c) && h > 0 && l > 0 && c > 0 && h > l;

  // Floor Pivot Points 公式
  const pp = valid ? (h + l + c) / 3 : 0;
  const r1 = valid ? 2 * pp - l : 0;
  const s1 = valid ? 2 * pp - h : 0;
  const r2 = valid ? pp + (h - l) : 0;
  const s2 = valid ? pp - (h - l) : 0;
  const r3 = valid ? h + 2 * (pp - l) : 0;
  const s3 = valid ? l - 2 * (h - pp) : 0;

  const levels = valid
    ? [
        { label: "R3", name: "阻力 3",    price: r3, type: "resistance" as const },
        { label: "R2", name: "阻力 2",    price: r2, type: "resistance" as const },
        { label: "R1", name: "阻力 1",    price: r1, type: "resistance" as const },
        { label: "PP", name: "枢轴 (Pivot)", price: pp, type: "pivot" as const },
        { label: "S1", name: "支撑 1",    price: s1, type: "support" as const },
        { label: "S2", name: "支撑 2",    price: s2, type: "support" as const },
        { label: "S3", name: "支撑 3",    price: s3, type: "support" as const },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <div className="text-xs text-text-muted mb-3">输入昨日 XAUUSD 行情</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">最高价 (High)</label>
            <input
              type="number" step="0.01" value={high} onChange={(e) => setHigh(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">最低价 (Low)</label>
            <input
              type="number" step="0.01" value={low} onChange={(e) => setLow(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">收盘价 (Close)</label>
            <input
              type="number" step="0.01" value={close} onChange={(e) => setClose(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>
        </div>
        {!valid && (
          <p className="text-xs text-accent-down mt-3">
            ⚠ 请输入有效价格: 最高价 &gt; 最低价, 收盘价 &gt; 0
          </p>
        )}
      </div>

      {valid && (
        <div className="card-base overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-bg-tertiary text-sm font-semibold text-text-primary">
            日内枢轴点 (Floor Pivot Points)
          </div>
          <div className="divide-y divide-border">
            {levels.map((lv) => {
              const isPivot = lv.type === "pivot";
              return (
                <div
                  key={lv.label}
                  className={`px-5 py-3 flex items-center justify-between ${
                    isPivot ? "bg-accent-blue/10 border-l-4 border-l-accent-blue" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-sm font-semibold w-10 num ${isPivot ? "text-accent-blue" : "text-text-primary"}`}>
                      {lv.label}
                    </div>
                    <div className={`text-xs ${lv.type === "resistance" ? "text-accent-down" : lv.type === "support" ? "text-accent-up" : "text-text-muted"}`}>
                      {lv.name}
                    </div>
                  </div>
                  <div className={`text-lg num font-semibold ${isPivot ? "text-accent-blue" : "text-text-primary"}`}>
                    {lv.price.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-border bg-bg-tertiary text-[10px] text-text-muted leading-relaxed">
            <strong>实战用法:</strong> 开盘后价格上探 R1/R2 是做空点 (阻力), 下跌到 S1/S2 是买入点 (支撑)。PP 是日内多空分界线。
            适合日内交易者每天开盘前快速计算当日关键位。
          </div>
        </div>
      )}
    </div>
  );
}
