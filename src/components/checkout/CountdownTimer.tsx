"use client";
// CountdownTimer — 订单支付窗口倒计时 (task-0041)
import { useEffect, useState } from "react";

export function CountdownTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire?: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const m = Math.floor(remaining / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  const expired = remaining === 0;

  return (
    <div className={`font-mono text-sm ${expired ? "text-red-600" : "text-amber-600"}`}>
      {expired ? "⏱ 订单已过期" : `⏱ 剩余时间: ${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`}
    </div>
  );
}