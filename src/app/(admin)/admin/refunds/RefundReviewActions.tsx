"use client";
// RefundReviewActions — admin 通过/拒绝 UI (v22.0 Phase 7.24 BATCH 15 PATCH 10)
// 复用 /api/refunds/[id]/approve (admin 校验已有)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  refundId: string;
}

export function RefundReviewActions({ refundId }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject'>('idle');
  const [txHash, setTxHash] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(action: 'APPROVE' | 'REJECT') {
    if (action === 'REJECT' && adminNote.trim().length < 3) {
      setError('拒绝时必须填写备注 (≥3 字符)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/refunds/${refundId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, txHash: txHash || undefined, adminNote: adminNote || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || '操作失败');
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'idle') {
    return (
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setMode('approve')}
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-accent-up/20 text-accent-up border border-accent-up/40 rounded hover:bg-accent-up/30 inline-flex items-center justify-center gap-1"
        >
          <Check size={12} />
          通过
        </button>
        <button
          onClick={() => setMode('reject')}
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/40 rounded hover:bg-red-500/30 inline-flex items-center justify-center gap-1"
        >
          <X size={12} />
          拒绝
        </button>
      </div>
    );
  }

  const isApprove = mode === 'approve';

  return (
    <div className="pt-1 border-t border-border space-y-2">
      {isApprove && (
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="链上 TxHash (可选, 通过时建议填)"
          className="w-full px-2 py-1 text-[11px] font-mono rounded bg-bg-tertiary border border-border text-gray-100 placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      )}
      <textarea
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        placeholder={isApprove ? '备注 (可选)' : '拒绝原因 (必填, ≥3 字)'}
        rows={2}
        className="w-full px-2 py-1 text-[11px] rounded bg-bg-tertiary border border-border text-gray-100 placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
      />
      {error && (
        <div className="text-[10px] text-red-400 inline-flex items-center gap-1">
          <AlertCircle size={10} />
          {error}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSubmit(isApprove ? 'APPROVE' : 'REJECT')}
          disabled={loading}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded inline-flex items-center justify-center gap-1 disabled:opacity-50 ${
            isApprove
              ? 'bg-accent-up text-bg-primary hover:opacity-90'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : (isApprove ? <Check size={12} /> : <X size={12} />)}
          确认{isApprove ? '通过' : '拒绝'}
        </button>
        <button
          onClick={() => { setMode('idle'); setError(null); setTxHash(''); setAdminNote(''); }}
          disabled={loading}
          className="px-3 py-1.5 text-xs border border-border rounded hover:border-text-muted"
        >
          取消
        </button>
      </div>
    </div>
  );
}
