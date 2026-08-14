// /dashboard/moderation/PromotionForm.tsx — 任命表单 (client component)
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Crown, Send } from 'lucide-react';

interface Candidate {
  id: string;
  username: string;
  role: string;
  createdAt: Date | string;
}

export function PromotionForm({
  canPromoteMod, canPromoteAdm,
  modCount, admCount, modLimit, admLimit,
  candidates, operatorRole,
}: {
  canPromoteMod: boolean;
  canPromoteAdm: boolean;
  modCount: number;
  admCount: number;
  modLimit: number;
  admLimit: number;
  candidates: Candidate[];
  operatorRole: string;
}) {
  const router = useRouter();
  const [targetUserId, setTargetUserId] = useState('');
  const [targetRole, setTargetRole] = useState<'MODERATOR' | 'ADMIN'>(
    canPromoteMod ? 'MODERATOR' : 'ADMIN'
  );
  const [reason, setReason] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 版主只能任命版主, 管理员能任命版主+管理员
  const canChooseAdm = operatorRole === 'ADMIN';
  const canSubmit = targetUserId && reason.trim().length >= 5 &&
    (targetRole === 'MODERATOR' ? canPromoteMod : (canPromoteAdm && canChooseAdm));

  async function handle() {
    setError(null);
    if (!canSubmit) {
      setError('请填写完整信息 (理由至少 5 字)');
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/users/${targetUserId}/promote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetRole, reason: reason.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '任命失败');
          return;
        }
        setSuccess(data.msg);
        setTargetUserId('');
        setReason('');
        setTimeout(() => { router.refresh(); setSuccess(null); }, 1500);
      } catch (e: any) {
        setError('网络错误');
      }
    });
  }

  return (
    <div className="p-4 border border-border bg-bg-secondary rounded space-y-3">
      <div className="text-xs text-text-muted">
        任命理由至少 5 字, 会留 PromotionLog 审计。
        {operatorRole === 'MODERATOR' && ' 版主只能任命版主, 管理员只能由管理员任命。'}
      </div>

      {/* 角色选择 */}
      <div className="flex gap-2">
        <button
          onClick={() => setTargetRole('MODERATOR')}
          disabled={!canPromoteMod}
          className={`flex-1 px-3 py-2 rounded text-xs font-medium border transition-colors ${
            targetRole === 'MODERATOR'
              ? 'border-accent-purple bg-accent-purple/10 text-accent-purple'
              : 'border-border text-text-muted hover:border-accent-purple/30'
          } disabled:opacity-50`}
        >
          <Shield className="w-3.5 h-3.5 inline mr-1" />
          版主 ({modCount}/{modLimit})
        </button>
        {canChooseAdm && (
          <button
            onClick={() => setTargetRole('ADMIN')}
            disabled={!canPromoteAdm}
            className={`flex-1 px-3 py-2 rounded text-xs font-medium border transition-colors ${
              targetRole === 'ADMIN'
                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                : 'border-border text-text-muted hover:border-accent-gold/30'
            } disabled:opacity-50`}
          >
            <Crown className="w-3.5 h-3.5 inline mr-1" />
            管理员 ({admCount}/{admLimit})
          </button>
        )}
      </div>

      {/* 选择用户 */}
      <div>
        <div className="text-xs text-text-muted mb-1">选择被任命人 (仅显示普通用户)</div>
        <select
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          className="w-full bg-bg-primary text-sm text-text-primary border border-border rounded p-2"
        >
          <option value="">-- 请选择用户 --</option>
          {candidates.map(c => (
            <option key={c.id} value={c.id}>
              {c.username} (注册 {new Date(c.createdAt).toLocaleDateString('zh-CN')})
            </option>
          ))}
        </select>
        {candidates.length === 0 && (
          <div className="text-[10px] text-text-muted mt-1">
            暂无可任命的普通用户
          </div>
        )}
      </div>

      {/* 理由 */}
      <div>
        <div className="text-xs text-text-muted mb-1">任命理由 (必填, 至少 5 字)</div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="为什么任命此人, 他的贡献是什么..."
          className="w-full bg-bg-primary text-sm text-text-primary border border-border rounded p-2.5 resize-y"
        />
        <div className="text-[10px] text-text-muted text-right num">
          {reason.length}/500
        </div>
      </div>

      {/* 提交 */}
      <div className="flex items-center justify-end gap-2">
        {success && <div className="text-xs text-accent-up mr-auto">{success}</div>}
        {error && <div className="text-xs text-warning mr-auto">{error}</div>}
        <button
          onClick={handle}
          disabled={pending || !canSubmit}
          className="px-4 py-2 rounded text-sm font-medium
            bg-accent-purple text-white hover:bg-accent-purple/90
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
            flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          {pending ? '任命中...' : '确认任命'}
        </button>
      </div>
    </div>
  );
}
