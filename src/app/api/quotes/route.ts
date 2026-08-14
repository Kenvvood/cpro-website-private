// /api/quotes/route.ts — 实时报价 (v22.0 Phase 7.24 Batch 11 PATCH3 + Batch 14A 优化)
// PM 反馈 2026-08-12:
//   PATCH3: "实时数据并不准" — 字段映射错位 + 移除 sina 没数据的品种
//   BATCH14: "可以省略数据压力每小时一次, 如果无负担尽量实时" — PM 拍板 5 分钟轮询
// 数据源:
//   - 新浪 hf 接口 (XAUUSD / XAGUSD / BTCUSD) — 国内快, 字段 [0]=current [7]=lastClose
//   - 东方财富 push2 接口 (USDJPY / USDCNH) — 国内快, 字段 f43=current f60=lastClose
// 缓存: Next.js fetch cache 30 分钟 (PM 拍板, 省资源)
// 失败 fallback: 静态参考价 (前端显示 "—" 但不报错)
// 价格校验: XAUUSD < 3000 || > 5000 视为异常, 走 fallback (PM 防止数据源异常)

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// v22.0 BATCH 15 PATCH 8: 30 分钟 → 60s server cache (PM 修完 code 立刻看到新价, 之前 30min 修完要等)
// 30 分钟太长, 报价失真, 60s 是 sina 行情更新频率的合理值
export const revalidate = 60;

// 价格合理性校验 (防止数据源异常导致显示离谱价)
const PRICE_RANGES: Record<string, [number, number]> = {
  XAUUSD: [3000, 5000],    // 黄金 2024-2026 区间 $1800-$5000, 限制 [3000,5000] 防止异常
  XAGUSD: [10, 100],        // 白银 $10-$100
  BTCUSD: [30000, 200000],  // BTC $30k-$200k
  USDJPY: [120, 200],       // 美元日元 120-200
  USDCNH: [6.0, 8.0],       // 离岸人民币 6-8
};

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;       // 涨跌额
  changePct: number;    // 涨跌幅 %
  updatedAt: string;
  source: 'sina' | 'eastmoney' | 'fallback';
}

interface RawConfig {
  symbol: string;
  name: string;
  dec: number;          // 价格小数位
  source: 'sina' | 'eastmoney';
  // sina: list=hf_GC 字段顺序 (实际): [0]name [1]current [2]=空 [3]open [4]high [5]low [6]time [7]lastClose ...
  // eastmoney: f43=current f60=lastClose f169=change f170=changePct
  code: string;         // sina hf_GC 或 eastmoney secid (101.GC00Y)
  scale?: number;       // eastmoney 缩放因子 (USDJPY=10000, GC=100)
}

const CONFIG: RawConfig[] = [
  // 黄金 (新浪 + 东方财富双源备份, 主用 sina)
  { symbol: 'XAUUSD', name: '黄金现货',  dec: 2, source: 'sina', code: 'hf_XAU' },  // v22.0 BATCH 15 PATCH 8: hf_GC (COMEX 期货 4450+) → hf_XAU (伦敦金现货 4393 < 4400) - PM 反馈"标的错误"
  // 白银 - v22.0 BATCH 15 PATCH 8: hf_SI (期货 65.34) → hf_XAG (伦敦银现货 65.14) - 价差 0.20 美元, 严谨起见
  { symbol: 'XAGUSD', name: '白银现货',  dec: 3, source: 'sina', code: 'hf_XAG' },
  // 比特币 - sina 没现货 hf_XBT 是空数据, hf_BTC 是 CME 期货 (跟现货价差 < 0.5%, 业内通用)
  { symbol: 'BTCUSD', name: '比特币',    dec: 2, source: 'sina', code: 'hf_BTC' },
  // 美元日元 (东方财富)
  { symbol: 'USDJPY', name: '美元日元',  dec: 3, source: 'eastmoney', code: '119.USDJPY', scale: 10000 },
  // 美元离岸人民币 (东方财富)
  { symbol: 'USDCNH', name: '美元离岸人民币', dec: 4, source: 'eastmoney', code: '133.USDCNH', scale: 10000 },
];

const FALLBACK: Omit<Quote, 'updatedAt' | 'source'>[] = CONFIG.map(c => ({
  symbol: c.symbol,
  name: c.name,
  price: 0,
  change: 0,
  changePct: 0,
}));

// 解析新浪一行: var hq_str_hf_GC="4471.651,,4470.100,4470.600,4484.200,4421.400,18:57:25,4441.100,4430.000,...";
// 真实字段: [0]current [1]空 [2]? [3]? [4]high [5]low [6]time [7]lastClose [8]open
// 之前我以为是 [1]=current, 实际是 [0]=current
function parseSinaLine(line: string, cfg: RawConfig): Quote | null {
  const m = line.match(/="([^"]+)"/);
  if (!m) return null;
  const fields = m[1].split(',');
  if (fields.length < 8) return null;

  const current = parseFloat(fields[0]);   // [0]=current
  const lastClose = parseFloat(fields[7]);  // [7]=lastClose
  if (isNaN(current) || current <= 0) return null;

  // 涨跌额 (lastClose 为 0 时跳过)
  const change = lastClose > 0 ? current - lastClose : 0;
  const changePct = lastClose > 0 ? (change / lastClose) * 100 : 0;

  return {
    symbol: cfg.symbol,
    name: cfg.name,
    price: current,
    change: parseFloat(change.toFixed(cfg.dec)),
    changePct: parseFloat(changePct.toFixed(2)),
    updatedAt: fields[6] || '',
    source: 'sina',
  };
}

// 价格合理性校验 (Batch 14A): 超出范围视为异常, 走 fallback
function isValidPrice(symbol: string, price: number): boolean {
  const range = PRICE_RANGES[symbol];
  if (!range) return true;  // 没定义范围 = 放行
  const [min, max] = range;
  return price >= min && price <= max;
}

async function fetchFromSina(): Promise<Quote[]> {
  const codes = CONFIG.filter(c => c.source === 'sina').map(c => c.code);
  const url = `https://hq.sinajs.cn/list=${codes.join(',')}`;

  const res = await fetch(url, {
    headers: {
      'Referer': 'https://finance.sina.com.cn',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    // @ts-ignore - Next.js cache control
    next: { revalidate: 30 },
  });

  if (!res.ok) throw new Error(`sina http ${res.status}`);
  const text = await res.text();

  const quotes: Quote[] = [];
  for (const cfg of CONFIG.filter(c => c.source === 'sina')) {
    const re = new RegExp(`var hq_str_${cfg.code}="([^"]+)"`);
    const m = text.match(re);
    if (m && m[1].length > 0) {
      const fullLine = `var hq_str_${cfg.code}="${m[1]}"`;
      const q = parseSinaLine(fullLine, cfg);
      // Batch 14A: 价格合理性校验, 异常跳过
      if (q && isValidPrice(q.symbol, q.price)) {
        quotes.push(q);
      } else if (q) {
        console.warn(`[quotes] ${q.symbol} 价格异常 ${q.price}, 跳过`);
      }
    }
  }
  if (quotes.length === 0) throw new Error('sina no valid quotes');
  return quotes;
}

async function fetchFromEastmoney(cfg: RawConfig): Promise<Quote | null> {
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${cfg.code}&fields=f43,f44,f45,f46,f60,f169,f170`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    // @ts-ignore
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.data) return null;

  const d = data.data;
  const scale = cfg.scale || 1;
  const current = (d.f43 || 0) / scale;
  const lastClose = (d.f60 || 0) / scale;
  if (current <= 0) return null;
  // Batch 14A: 价格合理性校验
  if (!isValidPrice(cfg.symbol, current)) {
    console.warn(`[quotes] eastmoney ${cfg.symbol} 价格异常 ${current}, 跳过`);
    return null;
  }

  const change = d.f169 != null ? d.f169 / scale : (lastClose > 0 ? current - lastClose : 0);
  const changePct = d.f170 != null ? d.f170 / 100 : (lastClose > 0 ? (change / lastClose) * 100 : 0);

  return {
    symbol: cfg.symbol,
    name: cfg.name,
    price: current,
    change: parseFloat(change.toFixed(cfg.dec)),
    changePct: parseFloat((changePct).toFixed(2)),
    updatedAt: new Date().toISOString(),
    source: 'eastmoney',
  };
}

export async function GET() {
  const now = new Date().toISOString();
  try {
    const quotes: Quote[] = [];

    // 1. 新浪 (XAUUSD / XAGUSD / BTCUSD)
    try {
      const sinaQuotes = await fetchFromSina();
      quotes.push(...sinaQuotes);
    } catch (e) {
      console.warn('[quotes] sina fetch failed:', e instanceof Error ? e.message : e);
    }

    // 2. 东方财富 (USDJPY / USDCNH)
    for (const cfg of CONFIG.filter(c => c.source === 'eastmoney')) {
      try {
        const q = await fetchFromEastmoney(cfg);
        if (q) quotes.push(q);
      } catch (e) {
        console.warn(`[quotes] eastmoney ${cfg.symbol} failed:`, e instanceof Error ? e.message : e);
      }
    }

    if (quotes.length === 0) {
      throw new Error('no quotes from any source');
    }

    // 按配置顺序排序
    const ordered = CONFIG
      .map(c => quotes.find(q => q.symbol === c.symbol))
      .filter((q): q is Quote => q !== undefined);

    return NextResponse.json({
      ok: true,
      source: 'multi',
      fetchedAt: now,
      quotes: ordered,
    });
  } catch (err) {
    // 全部失败 fallback
    return NextResponse.json({
      ok: false,
      source: 'fallback',
      fetchedAt: now,
      error: err instanceof Error ? err.message : 'unknown',
      quotes: FALLBACK.map(q => ({ ...q, updatedAt: now, source: 'fallback' as const })),
    });
  }
}
