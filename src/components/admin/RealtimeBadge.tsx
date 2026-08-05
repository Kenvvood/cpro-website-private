"use client";
// src/components/admin/RealtimeBadge.tsx
// task056 Phase 7: 实时监控徽章 (30s polling)
import { useEffect, useState } from "react";

interface RealtimeData {
  activeMembers: number;
  recentOrders: number;
  recentDownloads: number;
  recentPaidRequiredBlocks: number;
  timestamp: string;
}

export function RealtimeBadge() {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function tick() {
      try {
        const res = await fetch("/api/admin/realtime", { cache: "no-store" });
        const j = await res.json();
        if (active && j.success) {
          setData(j.online);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    }
    tick();
    const id = setInterval(tick, 30_000);  // task056 D3: 30s polling
    return () => { active = false; clearInterval(id); };
  }, []);

  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-accent-up animate-pulse" />
        <h2 className="text-base font-semibold text-text-primary">实时监控</h2>
        <span className="text-xs text-text-muted ml-auto num">
          {data ? new Date(data.timestamp).toLocaleTimeString("zh-CN") : "—"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="活跃付费会员" value={data?.activeMembers} loading={loading} />
        <Stat label="最近 1h 订单" value={data?.recentOrders} loading={loading} />
        <Stat label="最近 1h 下载" value={data?.recentDownloads} loading={loading} />
        <Stat label="最近 1h 拦截" value={data?.recentPaidRequiredBlocks} loading={loading} accent />
      </div>
    </div>
  );
}

function Stat({ label, value, loading, accent }: { label: string; value: number | undefined; loading: boolean; accent?: boolean }) {
  return (
    <div className={`p-3 border rounded-sm ${accent ? "border-accent-down/30 bg-accent-down/5" : "border-border bg-bg-tertiary"}`}>
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className={`text-xl font-bold num ${accent ? "text-accent-down" : "text-text-primary"}`}>
        {loading ? "—" : (value ?? 0).toLocaleString()}
      </div>
    </div>
  );
}