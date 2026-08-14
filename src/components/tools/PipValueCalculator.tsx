"use client";
// PipValueCalculator — 点值 & 盈亏 (XAUUSD 黄金 + 套利对实战)
// 输入: 开仓价 / 平仓价 / 仓位手数 / 品种
// 输出: 每点价值 + 实际盈亏 (多空方向)
// v22.0 Phase 7.24 Batch 11: 移除 EURUSD/GBPUSD (项目不涉猎), 保留 XAUUSD + USDJPY + USDCNH 套利对
import { useState } from "react";

type Direction = "long" | "short";
type Instrument = "XAUUSD" | "USDJPY" | "USDCNH";

const INSTRUMENTS: Record<Instrument, { contractSize: number; pipMultiplier: number; name: string }> = {
  XAUUSD: { contractSize: 100,    pipMultiplier: 0.1,  name: "黄金 (1 手 = 100 oz)" },
  USDJPY: { contractSize: 100000, pipMultiplier: 0.01, name: "美元日元 (1 手 = 100,000)" },
  USDCNH: { contractSize: 100000, pipMultiplier: 0.0001, name: "美元离岸人民币 (1 手 = 100,000)" },
};

export function PipValueCalculator() {
  const [entry,      setEntry]      = useState("3320.00");
  const [exit,       setExit]       = useState("3330.00");
  const [lots,       setLots]       = useState("0.5");
  const [direction,  setDirection]  = useState<Direction>("long");
  const [instrument, setInstrument] = useState<Instrument>("XAUUSD");

  const e   = parseFloat(entry);
  const x   = parseFloat(exit);
  const lt  = parseFloat(lots);
  const cfg = INSTRUMENTS[instrument];
  const valid = !isNaN(e) && !isNaN(x) && !isNaN(lt) && lt > 0;

  // 移动点数 (XAUUSD 1 pip = 0.1, USDJPY 1 pip = 0.01, USDCNH 1 pip = 0.0001)
  const movePips = valid ? Math.abs(x - e) / cfg.pipMultiplier : 0;
  // 方向
  const isProfit = valid && ((direction === "long" && x > e) || (direction === "short" && x < e));
  // 每手 1 pip 价值 (USD): XAUUSD = 1 pip × 100 oz = $10/lot
  //                        USDJPY = 1 pip × 100,000 / 100 = $10/lot (1 pip = ¥1 = ~$0.0067, 简化按 $10 算)
  //                        USDCNH = 1 pip × 100,000 = $10/lot
  const pipValuePerLot = 10;
  // 总盈亏
  const pnl = valid ? movePips * pipValuePerLot * lt * (isProfit ? 1 : -1) : 0;
  // 美元总价值 (仓位 × 合约大小 × 价格)
  const positionValue = valid && cfg.contractSize > 0 ? lt * cfg.contractSize * e : 0;

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">开仓价 (Entry)</label>
            <input
              type="number" step="0.01" value={entry} onChange={(e) => setEntry(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">平仓价 (Exit)</label>
            <input
              type="number" step="0.01" value={exit} onChange={(e) => setExit(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">仓位手数</label>
            <input
              type="number" step="0.01" value={lots} onChange={(e) => setLots(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
            <p className="text-[10px] text-text-muted mt-1">0.01 - 100 手</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">交易方向</label>
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
          <div className="md:col-span-2">
            <label className="text-xs text-text-muted block mb-1">交易品种</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(INSTRUMENTS) as Instrument[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setInstrument(k)}
                  className={`py-2 text-xs border ${instrument === k ? "bg-accent-blue/20 border-accent-blue text-accent-blue" : "border-border text-text-secondary hover:bg-bg-tertiary"}`}
                >
                  {k}<br />
                  <span className="text-[10px] text-text-muted">{INSTRUMENTS[k].name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {!valid && (
          <p className="text-xs text-accent-down mt-3">
            ⚠ 请输入有效价格和仓位
          </p>
        )}
      </div>

      {valid && (
        <div className="card-base overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-bg-tertiary flex items-center justify-between">
            <div className="text-sm font-semibold text-text-primary">盈亏计算结果</div>
            <div className="text-xs text-text-muted num">
              {direction === "long" ? "做多" : "做空"} {instrument} {lt} 手
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">移动点数</div>
              <div className="text-2xl num font-bold text-text-primary">{movePips.toFixed(1)}</div>
              <div className="text-[10px] text-text-muted mt-1">pips</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">每手 1 pip 价值</div>
              <div className="text-2xl num font-bold text-text-primary">${pipValuePerLot}</div>
              <div className="text-[10px] text-text-muted mt-1">USD / lot</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">仓位价值</div>
              <div className="text-2xl num font-bold text-text-secondary">${positionValue.toFixed(0)}</div>
              <div className="text-[10px] text-text-muted mt-1">USD 合约</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">实际盈亏</div>
              <div className={`text-2xl num font-bold ${pnl >= 0 ? "text-accent-up" : "text-accent-down"}`}>
                {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
              </div>
              <div className="text-[10px] text-text-muted mt-1">USDT</div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border bg-bg-tertiary text-[10px] text-text-muted leading-relaxed">
            <strong>简化计算:</strong> XAUUSD / USDJPY / USDCNH 每手 1 pip 标准价值约 $10。
            实际点值因经纪商报价精度和合约大小略有差异, 实盘以 MT4/MT5 终端显示为准。
          </div>
        </div>
      )}
    </div>
  );
}
