// src/components/admin/KpiCard.tsx
// task056 Phase 7: KPI 卡片 + 环比 trend (mock 趋势数据)

interface Props {
  label: string;
  value: string;
  unit: string;
  hint: string;
  color: "accent-blue" | "accent-up" | "accent-gold" | "accent-down";
  trendPct?: number;  // 环比 % (可正可负)
}

const COLOR_MAP = {
  "accent-blue": "border-l-accent-blue/30 bg-accent-blue/5",
  "accent-up": "border-l-accent-up/30 bg-accent-up/5",
  "accent-gold": "border-l-accent-gold/30 bg-accent-gold/5",
  "accent-down": "border-l-accent-down/30 bg-accent-down/5",
} as const;

const VAL_COLOR = {
  "accent-blue": "text-accent-blue",
  "accent-up": "text-accent-up",
  "accent-gold": "text-accent-gold",
  "accent-down": "text-accent-down",
} as const;

export function KpiCard({ label, value, unit, hint, color, trendPct }: Props) {
  const trendUp = (trendPct ?? 0) >= 0;
  return (
    <div className={`card-base border-l-4 p-5 ${COLOR_MAP[color]}`}>
      <div className="text-xs text-text-muted uppercase tracking-wider mb-2">{label}</div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={`text-3xl font-bold num ${VAL_COLOR[color]}`}>{value}</span>
        <span className="text-sm text-text-muted">{unit}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">{hint}</span>
        {trendPct !== undefined && (
          <span className={`flex items-center gap-1 num ${trendUp ? "text-accent-up" : "text-accent-down"}`}>
            <span>{trendUp ? "▲" : "▼"}</span>
            <span>{Math.abs(trendPct).toFixed(1)}%</span>
            <span className="text-text-muted">vs 上周</span>
          </span>
        )}
      </div>
    </div>
  );
}