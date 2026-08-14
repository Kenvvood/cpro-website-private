// /dashboard/refunds/RefundActions.tsx — 申请退款弹窗 (client component)
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Send } from 'lucide-react';

export function RefundActions({
  orderId,
  orderNo,
  refundAmount,
  actualPct,
}: {
  orderId: string;
  orderNo: string;
  refundAmount: number;
  actualPct: number;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleSubmit() {
    setError(null);
    if (reason.trim().length < 5) {
      setError('退款理由至少 5 个字');
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch('/api/refunds/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, reason: reason.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '申请失败');
          return;
        }
        setSuccess(true);
        setTimeout(() => router.refresh(), 1000);
      } catch {
        setError('网络错误, 请重试');
      }
    });
  }

  if (success) {
    return (
      <div className="p-3 border border-accent-up/30 bg-accent-up/5 rounded text-xs text-accent-up flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5" />
        ✓ 退款申请已提交, 等待管理员审批 (实际退 ¥{refundAmount.toFixed(2)})
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-2 border border-accent-down/30 bg-accent-down/5 rounded text-xs text-accent-down hover:bg-accent-down/10 transition"
      >
        申请退款 (退 {actualPct}% / ¥{refundAmount.toFixed(2)})
      </button>
    );
  }

  return (
    <div className="p-3 border border-border bg-bg-tertiary rounded space-y-2">
      <div className="text-xs text-text-muted">
        订单 <span className="num text-text-primary">{orderNo}</span> 申请退款 ¥{refundAmount.toFixed(2)} ({actualPct}%)
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="请说明退款理由 (5-500 字, 如: 资料不符合预期 / 重复订阅 / 误操作)"
        className="w-full p-2 border border-border rounded text-xs bg-bg-primary text-text-primary resize-none"
        rows={3}
        maxLength={500}
      />
      {error && (
        <div className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={pending || reason.trim().length < 5}
          className="flex-1 py-2 border border-accent-down/30 bg-accent-down/10 rounded text-xs text-accent-down hover:bg-accent-down/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          {pending ? '提交中...' : '确认申请退款'}
        </button>
        <button
          onClick={() => {
            setShowForm(false);
            setError(null);
            setReason('');
          }}
          className="px-3 py-2 border border-border rounded text-xs text-text-muted hover:text-text-primary"
        >
          取消
        </button>
      </div>
    </div>
  );
}
