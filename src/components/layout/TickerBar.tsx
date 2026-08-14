"use client";
// TickerBar — 实时报价滚动条 (v22.0 Phase 7.24 Batch 11 + 14A 优化)
// 数据源: /api/quotes (后端代理新浪 hf 接口, 30 分钟 server cache)
// 客户端: useEffect 轮询 300s (PM 拍板: "可以省略数据压力每小时一次, 没负担就尽量实时")
//         + 右上角"🕐 X 分钟前更新"角标 (解决 PM 反馈"看不出数据新旧")
// 品种范围: XAUUSD 黄金 + 套利对 (USDJPY / USDCNH) + BTC + 白银, 严格遵守 "项目只做 XAUUSD + 套利对"
// v22.0 Phase 7.24 Batch 11 PATCH2 (PM 反馈 2026-08-12): 滚动宽度只占半页面
// 修复: 4 份重复 (24 items) + translateX(-25%) + min-w-max
// 之前 2 份 (12 items) + translateX(-50%) → 移动 1 段后视口右半空白

import { useEffect, useState } from "react";

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  updatedAt: string;
  source: "sina" | "eastmoney" | "fallback";
}

interface QuotesResponse {
  ok: boolean;
  source: string;
  fetchedAt: string;
  quotes: Quote[];
  error?: string;
}

// 5 个主力品种 (跟 /api/quotes 对齐, 移除 ETHUSD — sina+东财都不支持)
const FALLBACK_QUOTES: Quote[] = [
  { symbol: "XAUUSD", name: "黄金现货",  price: 0, change: 0, changePct: 0, updatedAt: "", source: "fallback" },
  { symbol: "USDJPY", name: "美元日元",  price: 0, change: 0, changePct: 0, updatedAt: "", source: "fallback" },
  { symbol: "USDCNH", name: "美元离岸人民币", price: 0, change: 0, changePct: 0, updatedAt: "", source: "fallback" },
  { symbol: "BTCUSD", name: "比特币",    price: 0, change: 0, changePct: 0, updatedAt: "", source: "fallback" },
  { symbol: "XAGUSD", name: "白银现货",  price: 0, change: 0, changePct: 0, updatedAt: "", source: "fallback" },
];

// 数字格式化 (黄金 2 位小数, 日元 3 位, 离岸人民币 4 位, BTC 整数)
function formatPrice(symbol: string, price: number): string {
  if (price <= 0) return "—";
  if (symbol === "XAUUSD") return price.toFixed(2);
  if (symbol === "USDJPY") return price.toFixed(3);
  if (symbol === "USDCNH") return price.toFixed(4);
  if (symbol === "BTCUSD") {
    return price >= 1000 ? price.toFixed(0) : price.toFixed(2);
  }
  if (symbol === "XAGUSD") return price.toFixed(3);
  return price.toFixed(2);
}

// 计算 "X 分钟前更新" 角标文案
function ageText(fetchedAt: string): string {
  if (!fetchedAt) return "—";
  const ageMs = Date.now() - new Date(fetchedAt).getTime();
  const ageMin = Math.floor(ageMs / 60_000);
  if (ageMin < 1) return "刚刚";
  if (ageMin < 60) return `${ageMin} 分钟前更新`;
  const ageH = Math.floor(ageMin / 60);
  return `${ageH} 小时前更新`;
}

export function TickerBar() {
  const [quotes, setQuotes] = useState<Quote[]>(FALLBACK_QUOTES);
  const [stale, setStale] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [, force] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/quotes", { cache: "no-store" });
        const data: QuotesResponse = await res.json();
        if (cancelled) return;
        if (data.ok && data.quotes.length > 0) {
          setQuotes(data.quotes);
          setFetchedAt(data.fetchedAt);
          setStale(false);
        } else {
          // 接口失败 - 保留上次数据但标记 stale
          setStale(true);
        }
      } catch {
        if (!cancelled) setStale(true);
      }
    }

    // 首次拉取
    poll();
    // 300s (5 分钟) 轮询 - PM 拍板 Batch 14A
    const timer = setInterval(poll, 300_000);

    // 1 分钟刷一次角标 (让 "X 分钟前更新" 实时变化)
    const ageTimer = setInterval(() => force((n) => n + 1), 60_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
      clearInterval(ageTimer);
    };
  }, []);

  // 4 份重复 (24 items) + translateX(-25%): 总宽 ~6000px 远超 1920 视口, 移动 1 段长度 = 6 items
  // 这样视口始终被内容填满, 不会出现"右半空白"
  const REPEAT = 4;
  const loop = Array(REPEAT).fill(0).flatMap(() => quotes);

  return (
    <div className="border-b border-border bg-bg-secondary overflow-hidden w-full relative">
      {/* v22.0 Phase 7.24 BATCH 15 PATCH 7: TickerBar 再压 (PM 反馈 PATCH 6 还高)
          - PATCH 6: py-1 (4+4=8) + text-[11px] (11) = ~33.5px (含 border 1, line-height 1.5)
          - PATCH 7: py-0.5 (2+2=4) + text-[11px] (11) = ~21.5px (含 border, -12px)
          - Header sticky 总高度: 78 (nav) + ~22 (ticker) = ~100px (跟 PATCH 4 的 108px 差 8px)
          - 紧跟 Hero pt-12 (96px) 或 pt-14 (112px), 顶部更紧 */}
      <div className="flex animate-marquee whitespace-nowrap py-0.5 text-[11px] min-w-max">
        {loop.map((q, i) => {
          const up   = q.change > 0;
          const down = q.change < 0;
          const flat = q.change === 0 || q.price === 0;
          const color = flat
            ? "text-text-muted"
            : up
            ? "text-accent-up"
            : "text-accent-down";
          const sign = up ? "+" : "";
          return (
            <div key={i} className="flex items-center gap-2 px-5 border-r border-border shrink-0">
              <span className="font-semibold text-text-primary num">{q.symbol}</span>
              {flat ? (
                <span className="text-text-muted text-[11px] num">— · 实时报价接入中</span>
              ) : (
                <>
                  <span className={`num font-semibold ${color}`}>{formatPrice(q.symbol, q.price)}</span>
                  <span className={`num text-[10px] ${color}`}>
                    {sign}{q.changePct.toFixed(2)}%
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
      {/* 角标: 实时更新于 X 分钟前 (PM 拍板 Batch 14A: 让用户看出数据新旧) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <span className={`text-[9px] num ${stale ? "text-red-500 font-semibold" : "text-text-muted"}`}>
          {stale ? "stale · 数据获取失败" : `🕐 ${ageText(fetchedAt)}`}
        </span>
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-25%); }  /* -100% / REPEAT (REPEAT=4) */
        }
        .animate-marquee {
          animation: marquee 90s linear infinite;  /* 60s → 90s (内容变长, 速度放慢保证可读) */
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
