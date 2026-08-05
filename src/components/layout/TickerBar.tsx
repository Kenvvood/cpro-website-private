"use client";
// src/components/layout/TickerBar.tsx
// L4 v1.5 fix: 不再用 mock 价格数据 (数字陈旧, 用户反馈"明显不是实时")
// 改为品种 logo 滚动条, 不放价格, 等接真实数据源后 (L4 v1.5+ Phase) 再启用实时报价
const SUPPORTED_SYMBOLS = [
  "XAUUSD", "EURUSD", "USDJPY", "GBPUSD", "BTCUSD", "ETHUSD", "WTI", "USDCNH",
  "XAGUSD", "AUDUSD", "USDCAD", "CHINEX",
];

export function TickerBar() {
  // 重复一次保证滚动无缝
  const loop = [...SUPPORTED_SYMBOLS, ...SUPPORTED_SYMBOLS];

  return (
    <div className="border-b border-border bg-bg-secondary overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2 text-xs">
        {loop.map((sym, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-border">
            <span className="font-semibold text-text-primary">{sym}</span>
            <span className="text-text-muted text-[10px]">实时报价接入中</span>
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
