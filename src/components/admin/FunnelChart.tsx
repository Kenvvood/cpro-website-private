// src/components/admin/FunnelChart.tsx
// task056 Phase 7: 原生 Tailwind 漏斗图（无重型图表库）
interface FunnelStage {
  stage: string;
  count: number;
  color: string;
}

interface Props {
  stages: FunnelStage[];
}

export function FunnelChart({ stages }: Props) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="card-base p-6">
      <h2 className="text-lg font-semibold mb-4 text-text-primary">转化漏斗</h2>
      <p className="text-xs text-text-muted mb-6 num">
        L0 游客 → L1 注册 → L1 看付费 → L2 付费 → L2 下载
      </p>

      <div className="space-y-2">
        {stages.map((s, i) => {
          const widthPct = Math.max(8, Math.round((s.count / max) * 100));
          const prev = i > 0 ? stages[i - 1].count : null;
          const conv = prev && prev > 0 ? ((s.count / prev) * 100).toFixed(1) : null;
          return (
            <div key={s.stage} className="flex items-center gap-3 text-sm">
              <div className="w-32 shrink-0 text-xs text-text-secondary">{s.stage}</div>
              <div className="flex-1 h-8 bg-bg-tertiary rounded-sm overflow-hidden relative">
                <div
                  className={`h-full ${s.color} transition-all duration-500 flex items-center justify-end px-3`}
                  style={{ width: `${widthPct}%` }}
                >
                  <span className="text-xs font-semibold text-white num">
                    {s.count.toLocaleString()}
                  </span>
                </div>
              </div>
              {conv !== null && (
                <div className="w-16 text-right text-xs text-text-muted num">
                  {conv}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}