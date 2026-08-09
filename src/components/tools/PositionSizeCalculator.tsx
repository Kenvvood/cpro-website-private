"use client";
// PositionSizeCalculator — 持仓规模 (XAUUSD 实战必用)
// 输入: 账户余额 / 单笔风险% / 入场价 / 止损价
// 输出: 仓位手数 (XAUUSD 1 标准手 = 100 oz)
import { useState } from "react";

export function PositionSizeCalculator() {
  const [balance,     setBalance]     = useState("10000");
  const [riskPct,     setRiskPct]     = useState("1.0");
  const [entry,       setEntry]       = useState("3320.00");
  const [stopLoss,    setStopLoss]    = useState("3310.00");
  const [instrument,  setInstrument]  = useState<"XAUUSD" | "EURUSD">("XAUUSD");

  const bal  = parseFloat(balance);
  const risk = parseFloat(riskPct);
  const e    = parseFloat(entry);
  const sl   = parseFloat(stopLoss);
  const valid = !isNaN(bal) && !isNaN(risk) && !isNaN(e) && !isNaN(sl) && bal > 0 && risk > 0 && risk <= 100 && e > 0 && sl > 0;

  // 风险金额
  const riskAmount = valid ? (bal * risk) / 100 : 0;
  // 每手合约大小: XAUUSD = 100 oz, EURUSD = 100000
  const contractSize = instrument === "XAUUSD" ? 100 : 100000;
  // 止损距离 (点数)
  const stopDistance = valid ? Math.abs(e - sl) : 0;
  // 1 手 1 点的价值 (USD): XAUUSD 1 点 = $1/oz × 100 oz = $100/手
  //                       EURUSD 1 点 = $10/lot (100000 × 0.0001)
  const pipValuePerLot = instrument === "XAUUSD" ? 1 * contractSize * 1 : 10;
  // 1 手 止损总价值
  const lossPerLot = valid ? stopDistance * pipValuePerLot : 0;
  // 仓位手数
  const lots = valid && lossPerLot > 0 ? riskAmount / lossPerLot : 0;
  // 仓位 oz (XAUUSD)
  const oz = lots * contractSize;

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">账户余额 (USDT)</label>
            <input
              type="number" step="100" value={balance} onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
            <p className="text-[10px] text-text-muted mt-1">实盘账户余额</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">单笔风险 (%)</label>
            <input
              type="number" step="0.1" min="0.1" max="100" value={riskPct} onChange={(e) => setRiskPct(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
            <p className="text-[10px] text-text-muted mt-1">建议 0.5% - 2%, 激进交易者不超过 5%</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">入场价 (Entry)</label>
            <input
              type="number" step="0.01" value={entry} onChange={(e) => setEntry(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
            <p className="text-[10px] text-text-muted mt-1">计划开仓价</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">止损价 (Stop Loss)</label>
            <input
              type="number" step="0.01" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
            <p className="text-[10px] text-text-muted mt-1">必填: 风控核心</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-text-muted block mb-1">交易品种</label>
            <div className="flex">
              <button
                onClick={() => setInstrument("XAUUSD")}
                className={`flex-1 py-2 text-sm border ${instrument === "XAUUSD" ? "bg-accent-blue/20 border-accent-blue text-accent-blue" : "border-border text-text-secondary hover:bg-bg-tertiary"}`}
              >
                XAUUSD 黄金 (1 手 = 100 oz)
              </button>
              <button
                onClick={() => setInstrument("EURUSD")}
                className={`flex-1 py-2 text-sm border-l-0 border ${instrument === "EURUSD" ? "bg-accent-blue/20 border-accent-blue text-accent-blue" : "border-border text-text-secondary hover:bg-bg-tertiary"}`}
              >
                EURUSD 欧元 (1 手 = 100,000)
              </button>
            </div>
          </div>
        </div>
        {!valid && (
          <p className="text-xs text-accent-down mt-3">
            ⚠ 请输入有效数值
          </p>
        )}
      </div>

      {valid && (
        <div className="card-base overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-bg-tertiary text-sm font-semibold text-text-primary">
            仓位计算结果
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">单笔风险</div>
              <div className="text-2xl num font-bold text-accent-down">{riskAmount.toFixed(2)}</div>
              <div className="text-[10px] text-text-muted mt-1">USDT</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">止损距离</div>
              <div className="text-2xl num font-bold text-text-primary">{stopDistance.toFixed(2)}</div>
              <div className="text-[10px] text-text-muted mt-1">{instrument === "XAUUSD" ? "美元 / oz" : "点 (pip)"}</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">建议仓位</div>
              <div className="text-2xl num font-bold text-accent-blue">{lots.toFixed(2)}</div>
              <div className="text-[10px] text-text-muted mt-1">手 (lot)</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">实际 oz</div>
              <div className="text-2xl num font-bold text-accent-up">{oz.toFixed(0)}</div>
              <div className="text-[10px] text-text-muted mt-1">{instrument === "XAUUSD" ? "oz 黄金" : "基础货币"}</div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border bg-bg-tertiary text-[10px] text-text-muted leading-relaxed">
            <strong>风控原则:</strong> 建议单笔风险不超过账户余额 1-2%, 单日累计风险不超过 5%。
            仓位计算后实际下单时建议四舍五入到 0.01 手, MT4/MT5 终端会显示对应合约大小。
          </div>
        </div>
      )}
    </div>
  );
}
