// /dashboard/moderation/ReviewActions.tsx — 申请审批按钮 (client component)
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';

export function ReviewActions({
  applicationId, canApprove, disableReason,
}: {
  applicationId: string;
  canApprove: boolean;
  disableReason: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reviewNote, setReviewNote] = useState('');
  const [showNote, setShowNote] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(action: 'approve' | 'reject') {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/moderator-applications/${applicationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, reviewNote: reviewNote.trim() || undefined }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '操作失败');
          return;
        }
        setShowNote(null);
        setReviewNote('');
        router.refresh();
      } catch (e: any) {
        setError('网络错误');
      }
    });
  }

  if (showNote) {
    return (
      <div className="flex-1 min-w-[200px] space-y-2">
        <textarea
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value.slice(0, 500))}
          rows={2}
          placeholder={showNote === 'reject' ? '拒绝原因...' : '审批备注 (可选)...'}
          className="w-full bg-bg-primary text-xs text-text-primary border border-border rounded p-2"
        />
        <div className="flex gap-1">
          <button
            onClick={() => handle(showNote)}
            disabled={pending || (showNote === 'reject' && !reviewNote.trim())}
            className={`flex-1 px-2 py-1 rounded text-[10px] font-medium ${
              showNote === 'approve'
                ? 'bg-accent-up text-bg-primary'
                : 'bg-warning text-bg-primary'
            } disabled:opacity-50`}
          >
            确认{showNote === 'approve' ? '通过' : '拒绝'}
          </button>
          <button
            onClick={() => { setShowNote(null); setReviewNote(''); }}
            className="px-2 py-1 rounded text-[10px] text-text-muted border border-border"
          >
            取消
          </button>
        </div>
        {error && <div className="text-[10px] text-warning">{error}</div>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 ml-auto">
      {disableReason && (
        <span className="text-[10px] text-warning mr-1" title={disableReason}>
          {disableReason}
        </span>
      )}
      <button
        onClick={() => setShowNote('approve')}
        disabled={!canApprove || pending}
        className="px-2 py-1 rounded text-[10px] font-medium
          bg-accent-up/20 text-accent-up hover:bg-accent-up/30
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors
          flex items-center gap-0.5"
      >
        <Check className="w-2.5 h-2.5" /> 通过
      </button>
      <button
        onClick={() => setShowNote('reject')}
        disabled={pending}
        className="px-2 py-1 rounded text-[10px] font-medium
          bg-warning/20 text-warning hover:bg-warning/30 transition-colors
          flex items-center gap-0.5"
      >
        <X className="w-2.5 h-2.5" /> 拒绝
      </button>
    </div>
  );
}
