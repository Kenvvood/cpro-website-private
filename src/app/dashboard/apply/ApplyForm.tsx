// /dashboard/apply/ApplyForm.tsx — 申请表单 (client component)
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Shield, Crown } from 'lucide-react';

export function ApplyForm({
  modEligible, admEligible,
}: { modEligible: boolean; admEligible: boolean }) {
  const router = useRouter();
  const [applyingFor, setApplyingFor] = useState<'MODERATOR' | 'ADMIN'>(
    admEligible ? 'ADMIN' : 'MODERATOR'
  );
  const [reason, setReason] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit = (applyingFor === 'MODERATOR' ? modEligible : admEligible);

  async function handleSubmit() {
    setError(null);
    if (!canSubmit) {
      setError(`申请${applyingFor === 'MODERATOR' ? '版主' : '管理员'}需先达标门槛`);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch('/api/moderator-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applyingFor, reason: reason.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '提交失败');
          return;
        }
        setSuccess(true);
        setTimeout(() => router.refresh(), 800);
      } catch (e: any) {
        setError('网络错误, 请重试');
      }
    });
  }

  if (success) {
    return (
      <div className="p-4 border border-accent-up/30 bg-accent-up/5 rounded text-sm text-accent-up">
        ✓ 申请已提交, 等待版主/管理员审批
      </div>
    );
  }

  return (
    <div className="p-4 border border-border bg-bg-secondary rounded space-y-4">
      <div className="text-sm font-semibold text-text-primary">提交申请</div>

      {/* 选择角色 */}
      <div className="flex gap-2">
        <button
          onClick={() => setApplyingFor('MODERATOR')}
          className={`flex-1 px-3 py-2 rounded text-xs font-medium border transition-colors ${
            applyingFor === 'MODERATOR'
              ? 'border-accent-purple bg-accent-purple/10 text-accent-purple'
              : 'border-border text-text-muted hover:border-accent-purple/30'
          }`}
        >
          <Shield className="w-3.5 h-3.5 inline mr-1" />
          申请版主 {modEligible ? '✓' : '✗'}
        </button>
        <button
          onClick={() => setApplyingFor('ADMIN')}
          className={`flex-1 px-3 py-2 rounded text-xs font-medium border transition-colors ${
            applyingFor === 'ADMIN'
              ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
              : 'border-border text-text-muted hover:border-accent-gold/30'
          }`}
        >
          <Crown className="w-3.5 h-3.5 inline mr-1" />
          申请管理员 {admEligible ? '✓' : '✗'}
        </button>
      </div>

      {/* 理由 */}
      <div>
        <div className="text-xs text-text-muted mb-1">申请理由 (可选, 最多 500 字)</div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, 500))}
          rows={4}
          placeholder="说说你为什么想成为版主/管理员, 你能贡献什么..."
          className="w-full bg-bg-primary text-sm text-text-primary placeholder:text-text-muted
            border border-border rounded p-2.5 focus:border-accent-purple focus:outline-none resize-y"
        />
        <div className="text-[10px] text-text-muted text-right mt-1 num">
          {reason.length}/500
        </div>
      </div>

      {/* 提交 */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-text-muted">
          {!canSubmit && (
            <span className="text-warning">
              ⚠ {applyingFor === 'MODERATOR' ? '版主' : '管理员'}门槛未达标, 可切换另一项
            </span>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={pending || !canSubmit}
          className="px-4 py-2 rounded text-sm font-medium
            bg-accent-purple text-white hover:bg-accent-purple/90
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
            flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          {pending ? '提交中...' : '提交申请'}
        </button>
      </div>

      {error && (
        <div className="text-xs text-warning">{error}</div>
      )}
    </div>
  );
}
