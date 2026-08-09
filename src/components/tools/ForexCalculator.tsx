"use client";
// ForexCalculator — 汇率换算 (基础工具)
// 9 币种实时换算 (USD/EUR/GBP/JPY/AUD/CAD/CHF/HKD/CNY)
import { useState } from "react";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "HKD", "CNY"] as const;
type Currency = (typeof CURRENCIES)[number];

// 静态参考汇率 (相对 USD, v22.0 演示用, v23.0 接实时 API)
const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  HKD: 7.82,
  CNY: 7.21,
};

export function ForexCalculator() {
  const [amount, setAmount] = useState("1000");
  const [from,   setFrom]   = useState<Currency>("USD");
  const [to,     setTo]     = useState<Currency>("CNY");

  const amt = parseFloat(amount);
  const valid = !isNaN(amt) && amt >= 0;
  const inUSD = valid ? amt / RATES[from] : 0;
  const result = valid ? inUSD * RATES[to] : 0;

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">金额</label>
            <input
              type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">从 (From)</label>
            <select
              value={from} onChange={(e) => setFrom(e.target.value as Currency)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">到 (To)</label>
            <select
              value={to} onChange={(e) => setTo(e.target.value as Currency)}
              className="w-full bg-bg-tertiary border border-border px-3 py-2 text-base num text-text-primary focus:outline-none focus:border-accent-blue"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-3">
          汇率为参考价, 实时报价以经纪商 / 银行终端为准。
        </p>
      </div>

      {valid && (
        <div className="card-base overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-bg-tertiary text-sm font-semibold text-text-primary">
            换算结果
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">原始</div>
              <div className="text-2xl num font-bold text-text-secondary">{amt.toFixed(2)}</div>
              <div className="text-[10px] text-text-muted mt-1">{from}</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">汇率</div>
              <div className="text-2xl num font-bold text-text-primary">{(RATES[to] / RATES[from]).toFixed(4)}</div>
              <div className="text-[10px] text-text-muted mt-1">1 {from} = {(RATES[to] / RATES[from]).toFixed(4)} {to}</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">换算后</div>
              <div className="text-2xl num font-bold text-accent-blue">{result.toFixed(2)}</div>
              <div className="text-[10px] text-text-muted mt-1">{to}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
