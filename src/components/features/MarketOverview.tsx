import { Coins, Banknote, Bitcoin, Fuel } from "lucide-react";

// L4 v1.6: 借 TradingView cn.tradingview.com "市场覆盖" 区块
// 12 个交易品种 × 4 分类 (外汇 / 贵金属 / 加密 / 能源指数)
// 严守 PM: 不放 mock 价格, 只标 "实时报价接入中"
// 静态展示, 不查 DB (避免 0 数字尴尬, 强化"市场覆盖广度"叙事)
type Category = "FOREX" | "METAL" | "CRYPTO" | "ENERGY";

interface Symbol {
  code: string;
  name: string;
  category: Category;
  description: string;
}

const SYMBOLS: Symbol[] = [
  // 外汇 (6)
  { code: "EURUSD", name: "欧元/美元", category: "FOREX", description: "全球交易量最大货币对" },
  { code: "USDJPY", name: "美元/日元", category: "FOREX", description: "亚洲时段主交易品种" },
  { code: "GBPUSD", name: "英镑/美元", category: "FOREX", description: "波动率较高货币对" },
  { code: "AUDUSD", name: "澳元/美元", category: "FOREX", description: "商品货币代表" },
  { code: "USDCAD", name: "美元/加元", category: "FOREX", description: "原油关联货币对" },
  { code: "USDCNH", name: "美元/人民币", category: "FOREX", description: "离岸人民币汇率" },
  // 贵金属 (2)
  { code: "XAUUSD", name: "黄金/美元", category: "METAL", description: "避险资产首选" },
  { code: "XAGUSD", name: "白银/美元", category: "METAL", description: "高波动贵金属" },
  // 加密 (2)
  { code: "BTCUSD", name: "比特币/美元", category: "CRYPTO", description: "加密市场基准" },
  { code: "ETHUSD", name: "以太坊/美元", category: "CRYPTO", description: "智能合约平台代表" },
  // 能源指数 (2)
  { code: "WTI", name: "WTI 原油", category: "ENERGY", description: "美国原油基准" },
  { code: "CHINEX", name: "中国指数", category: "ENERGY", description: "A 股代表性指数" },
];

const CATEGORY_META: Record<Category, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; tint: string }> = {
  FOREX: { label: "外汇", icon: Banknote, tint: "text-accent-blue" },
  METAL: { label: "贵金属", icon: Coins, tint: "text-accent-gold" },
  CRYPTO: { label: "加密货币", icon: Bitcoin, tint: "text-accent-up" },
  ENERGY: { label: "能源 / 指数", icon: Fuel, tint: "text-accent-down" },
};

export function MarketOverview() {
  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-text-primary mb-1">
            市场覆盖
          </h2>
          <p className="text-xs text-text-muted">
            12 个交易品种 · 外汇 / 贵金属 / 加密 / 能源指数 多市场全栈
          </p>
        </div>
        <div className="text-xs text-text-muted hidden sm:block">
          实时报价接入中
        </div>
      </div>

      {/* 4 分类 row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const count = SYMBOLS.filter((s) => s.category === cat).length;
          return (
            <div key={cat} className="card-base p-3 flex items-center gap-3">
              <Icon size={20} className={meta.tint} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary">{meta.label}</div>
                <div className="text-xs text-text-muted num">{count} 个品种</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 12 品种 grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {SYMBOLS.map((s) => {
          const meta = CATEGORY_META[s.category];
          return (
            <div
              key={s.code}
              className="card-base p-3 hover:border-border-focus transition-colors group cursor-default"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold num text-text-primary group-hover:text-accent-blue truncate">
                    {s.code}
                  </div>
                  <div className="text-[11px] text-text-muted truncate">{s.name}</div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm bg-bg-tertiary ${meta.tint} font-semibold shrink-0`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-[11px] text-text-muted line-clamp-1">{s.description}</p>
              <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[10px]">
                <span className="text-text-muted">策略库</span>
                <span className="text-text-secondary font-semibold">严选入驻中</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
