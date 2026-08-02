"use client";
// OrderStatusBadge — 订单状态展示 (task-0041)
export function OrderStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "待支付", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
    CONFIRMED: { label: "已完成", cls: "bg-green-500/15 text-green-700 border-green-500/30" },
    TIMEOUT: { label: "已超时", cls: "bg-red-500/15 text-red-700 border-red-500/30" },
    FAILED: { label: "失败", cls: "bg-red-500/15 text-red-700 border-red-500/30" },
    REFUNDED: { label: "已退款", cls: "bg-zinc-500/15 text-zinc-700 border-zinc-500/30" },
  };
  const c = cfg[status] ?? { label: status, cls: "bg-muted text-foreground border-border" };
  // PROCESSING 语义 (PENDING + txHash) 特殊展示
  const display = status === "PENDING" ? cfg.PENDING : c;
  return (
    <span className={`px-2 py-0.5 rounded border text-xs ${display.cls}`}>{display.label}</span>
  );
}