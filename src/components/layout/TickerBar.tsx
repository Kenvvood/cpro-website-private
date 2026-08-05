"use client";
// src/components/layout/TickerBar.tsx
// task052 L2 C11: 首页独有 ticker 滚动条 (TV 金融工具感)
// 数据源: 静态 mock (后续 Phase 接 free API)
import { useEffect, useState } from "react";

interface TickerItem {
  symbol: string;
  price: string;
  change: number;  // 涨跌幅 (%)
}

const MOCK_TICKER: TickerItem[] = [
  { symbol: "XAUUSD", price: "2,345.67", change: 0.45 },
  { symbol: "EURUSD", price: "1.0873", change: -0.12 },
  { symbol: "USDJPY", price: "149.82", change: 0.21 },
  { symbol: "GBPUSD", price: "1.2714", change: -0.08 },
  { symbol: "BTCUSD", price: "67,432.10", change: 1.85 },
  { symbol: "ETHUSD", price: "3,521.45", change: -0.95 },
  { symbol: "WTI", price: "78.45", change: -1.23 },
  { symbol: "USDCNH", price: "7.2415", change: 0.05 },
];

export function TickerBar() {
  const [items, setItems] = useState<TickerItem[]>(MOCK_TICKER);

  // mock: 每 5s 模拟微动价格 (Phase 接 API 时去掉)
  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          price: it.price,
          change: Number((it.change + (Math.random() - 0.5) * 0.1).toFixed(2)),
        }))
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // 重复一次保证滚动无缝
  const loop = [...items, ...items];

  return (
    <div className="border-b border-border bg-bg-secondary overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2 text-xs">
        {loop.map((it, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-border">
            <span className="font-semibold text-text-primary">{it.symbol}</span>
            <span className="num text-text-secondary">{it.price}</span>
            <span className={`num ${it.change >= 0 ? "up" : "down"}`}>
              {it.change >= 0 ? "▲" : "▼"} {Math.abs(it.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}