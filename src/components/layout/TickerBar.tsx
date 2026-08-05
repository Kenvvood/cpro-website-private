"use client";
// src/components/layout/TickerBar.tsx
// L4 v1.10: 8 XAUUSD 周边品种 (PM 决策 2026-08-05: 聚焦 XAUUSD 黄金 + 跨品种对冲)
// 不显示价格 (避免 mock 假数据) · 等接真实行情源后再启用
const SUPPORTED_SYMBOLS = [
  { sym: "XAUUSD", name: "黄金", tone: "gold" },
  { sym: "XAGUSD", name: "白银", tone: "silver" },
  { sym: "DXY",    name: "美元指数", tone: "neutral" },
  { sym: "EURUSD", name: "欧美", tone: "neutral" },
  { sym: "GBPUSD", name: "镑美", tone: "neutral" },
  { sym: "USDJPY", name: "美日", tone: "neutral" },
  { sym: "AUDUSD", name: "澳美", tone: "neutral" },
  { sym: "USDCHF", name: "美瑞", tone: "neutral" },
] as const;

export function TickerBar() {
  // 重复一次保证滚动无缝
  const loop = [...SUPPORTED_SYMBOLS, ...SUPPORTED_SYMBOLS];

  return (
    <div className="border-b border-border bg-bg-secondary overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2 text-xs">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-border">
            <span
              className={`font-semibold ${
                item.tone === "gold"
                  ? "text-accent-gold"
                  : item.tone === "silver"
                    ? "text-text-secondary"
                    : "text-text-primary"
              }`}
            >
              {item.sym}
            </span>
            <span className="text-text-muted text-[10px]">{item.name}</span>
            <span className="text-text-muted text-[10px]">· 实时报价接入中</span>
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
