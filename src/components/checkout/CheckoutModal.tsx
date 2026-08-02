"use client";
// CheckoutModal — USDT 结账弹窗 (task-0041)
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CountdownTimer } from "./CountdownTimer";
import { QrCode } from "./QrCode";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  PLAN_LABEL_CN,
  USDT_RATES,
} from "@/lib/payment-config";
import type { MembershipPlan, PayChannel } from "@/generated/prisma/enums";

interface CheckoutModalProps {
  plan: MembershipPlan;
  isOpen: boolean;
  onClose: () => void;
}

interface OrderData {
  orderNo: string;
  amount: number;
  walletAddress: string;
  expiresAt: string;
  channel: PayChannel;
}

interface OrderStatus {
  status: string;
  txHash: string | null;
  confirmedAt: string | null;
}

export function CheckoutModal({ plan, isOpen, onClose }: CheckoutModalProps) {
  const router = useRouter();
  const [channel, setChannel] = useState<PayChannel>("USDT_TRC20");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [txHash, setTxHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 创建订单
  useEffect(() => {
    if (!isOpen || order) return;
    setBusy(true);
    setError(null);
    fetch("/api/payments/usdt/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, channel }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) throw new Error(j.error);
        setOrder(j.data);
        setStatus({ status: "PENDING", txHash: null, confirmedAt: null });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(false));
  }, [isOpen, order, plan, channel]);

  // 轮询状态 (10 秒)
  useEffect(() => {
    if (!order || status?.status === "CONFIRMED") return;
    const id = setInterval(() => {
      fetch(`/api/payments/usdt/${order.orderNo}/status`)
        .then((r) => r.json())
        .then((j) => {
          if (j.ok) {
            setStatus({
              status: j.data.status,
              txHash: j.data.txHash,
              confirmedAt: j.data.confirmedAt,
            });
          }
        })
        .catch(() => {});
    }, 10_000);
    return () => clearInterval(id);
  }, [order, status?.status]);

  // 提交 TxID
  const submitHash = async () => {
    if (!order || !txHash.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/payments/usdt/${order.orderNo}/submit-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: txHash.trim() }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setStatus({ status: j.data.status, txHash, confirmedAt: new Date().toISOString() });
      // 3 秒后跳转到会员中心
      setTimeout(() => router.push("/account"), 3000);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!order) return;
    if (!confirm("确认取消该订单?")) return;
    setBusy(true);
    try {
      await fetch(`/api/payments/usdt/${order.orderNo}/cancel`, { method: "POST" });
      setStatus({ status: "TIMEOUT", txHash: null, confirmedAt: null });
    } finally {
      setBusy(false);
    }
  };

  const copyAddr = async () => {
    if (!order) return;
    await navigator.clipboard.writeText(order.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isOpen) return null;
  const processing = status?.status === "PENDING" && !!status?.txHash;
  const confirmed = status?.status === "CONFIRMED";
  const timeout = status?.status === "TIMEOUT";
  const failed = status?.status === "FAILED";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">CProTrading USDT 收银台</h2>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-semibold">{PLAN_LABEL_CN[plan]}</span>
          {status && <OrderStatusBadge status={status.status} />}
        </div>

        {error && (
          <div className="mb-3 p-2 text-sm rounded bg-red-500/10 text-red-700 border border-red-500/30">
            {error}
          </div>
        )}

        {confirmed ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-lg font-semibold text-green-600 mb-1">支付成功</div>
            <div className="text-sm text-muted-foreground">会员已开通, 3 秒后跳转...</div>
          </div>
        ) : order ? (
          <>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">应付 USDT</span>
                <span className="font-mono font-semibold">{USDT_RATES[plan]} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">收款网络</span>
                <select
                  className="border rounded px-2 py-0.5 text-sm"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as PayChannel)}
                  disabled={!!status?.txHash}
                >
                  <option value="USDT_TRC20">TRC-20</option>
                  <option value="USDT_BSC">BSC (BEP-20)</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">收款地址</span>
                <button
                  onClick={copyAddr}
                  className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/70 font-mono truncate max-w-[200px]"
                  title={order.walletAddress}
                >
                  {copied ? "✓ 已复制" : `${order.walletAddress.slice(0, 6)}...${order.walletAddress.slice(-4)} [复制]`}
                </button>
              </div>
            </div>

            <div className="my-4 flex justify-center">
              <QrCode value={order.walletAddress} size={160} />
            </div>

            <CountdownTimer expiresAt={order.expiresAt} onExpire={() => setStatus({ status: "TIMEOUT", txHash: null, confirmedAt: null })} />

            {processing ? (
              <div className="mt-4 p-3 rounded bg-amber-500/10 border border-amber-500/30 text-sm text-amber-700">
                ⏳ 等待链上确认中, 请稍候 (通常 1~3 分钟)
              </div>
            ) : timeout ? (
              <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-sm text-red-700">
                ❌ 订单已过期, 请重新创建
              </div>
            ) : failed ? (
              <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-sm text-red-700">
                ❌ 链上验证失败, 请联系客服
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground block mb-1">您的 TxID (链上交易哈希)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded font-mono text-sm"
                    placeholder="0x..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <button
                  onClick={submitHash}
                  disabled={busy || !txHash.trim()}
                  className="mt-3 w-full py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy ? "提交中..." : "确认提交链上凭证"}
                </button>
              </>
            )}

            {!processing && !confirmed && (
              <button onClick={cancel} disabled={busy} className="mt-2 w-full text-sm text-muted-foreground hover:text-foreground">
                取消订单
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {busy ? "创建订单中..." : "正在加载..."}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
          ⚠️ 实盘交易盈亏自负, 本平台资源仅供技术交流与回测用途
        </div>
      </div>
    </div>
  );
}