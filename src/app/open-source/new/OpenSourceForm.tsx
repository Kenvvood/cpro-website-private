// /open-source/new/OpenSourceForm.tsx — 源码发布表单 (client)
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send, AlertTriangle, Check, X } from 'lucide-react';

export function OpenSourceForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [license, setLicense] = useState('MIT');
  const [originalAuthor, setOriginalAuthor] = useState('');
  const [originalSource, setOriginalSource] = useState('');
  const [tier, setTier] = useState('');
  const [requiredPlan, setRequiredPlan] = useState('WEEKLY');

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<{ status: string; reason?: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setReview(null);
    setSuccess(null);

    if (!title.trim() || title.length < 5) {
      setError('标题至少 5 字');
      return;
    }
    if (!description.trim() || description.length < 20) {
      setError('描述至少 20 字');
      return;
    }
    if (!fileUrl.trim() || !fileUrl.startsWith('http')) {
      setError('源码链接必填 (http(s):// 开头)');
      return;
    }
    if (!originalAuthor.trim() || originalAuthor.length < 2) {
      setError('原作者至少 2 字');
      return;
    }
    if (!originalSource.trim() || originalSource.length < 2) {
      setError('原始仓库至少 2 字');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/open-source-releases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            fileUrl: fileUrl.trim(),
            license,
            originalAuthor: originalAuthor.trim(),
            originalSource: originalSource.trim(),
            tier: tier.trim() || null,
            requiredPlan,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '发布失败');
          if (data.review) setReview(data.review);
          return;
        }
        setReview({ status: data.reviewStatus, reason: data.reviewReason });
        if (data.reviewStatus === 'APPROVED') {
          setSuccess(data.msg + ' 跳转中...');
          setTimeout(() => router.push(`/open-source/${data.id}`), 1500);
        }
      } catch (e: any) {
        setError('网络错误, 请重试');
      }
    });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* 标题 */}
      <div>
        <div className="text-xs text-text-muted mb-1">标题 <span className="text-warning">*</span> (至少 5 字)</div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 200))}
          placeholder="例: MTT-Pro Aurora 趋势跟踪 EA"
          className="w-full bg-bg-secondary text-sm text-text-primary border border-border rounded p-2.5"
        />
        <div className="text-[10px] text-text-muted text-right num mt-1">{title.length}/200</div>
      </div>

      {/* 描述 */}
      <div>
        <div className="text-xs text-text-muted mb-1">描述 <span className="text-warning">*</span> (至少 20 字)</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
          rows={4}
          placeholder="一句话定位 + 核心算法 + 适配场景..."
          className="w-full bg-bg-secondary text-sm text-text-primary border border-border rounded p-2.5 resize-y"
        />
        <div className="text-[10px] text-text-muted text-right num mt-1">{description.length}/2000</div>
      </div>

      {/* 源码链接 (必填) */}
      <div className="p-4 border border-accent-gold/30 bg-accent-gold/5 rounded space-y-3">
        <div className="text-xs font-semibold text-accent-gold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          必填项 (源码文章强制)
        </div>
        <div>
          <div className="text-xs text-text-muted mb-1">源码下载链接 <span className="text-warning">*</span></div>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://example.com/source.zip 或 /files/source.zip"
            className="w-full bg-bg-primary text-sm text-text-primary border border-border rounded p-2.5"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-text-muted mb-1">原作者 <span className="text-warning">*</span></div>
            <input
              type="text"
              value={originalAuthor}
              onChange={(e) => setOriginalAuthor(e.target.value)}
              placeholder="原作者署名"
              className="w-full bg-bg-primary text-sm text-text-primary border border-border rounded p-2.5"
            />
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">原始仓库 <span className="text-warning">*</span></div>
            <input
              type="text"
              value={originalSource}
              onChange={(e) => setOriginalSource(e.target.value)}
              placeholder="github.com/xxx/yyy"
              className="w-full bg-bg-primary text-sm text-text-primary border border-border rounded p-2.5"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-text-muted mb-1">协议 <span className="text-warning">*</span></div>
            <select
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="w-full bg-bg-primary text-sm text-text-primary border border-border rounded p-2.5"
            >
              <option value="MIT">MIT</option>
              <option value="GPL_2">GPL-2.0</option>
              <option value="GPL_3">GPL-3.0</option>
              <option value="APACHE_2_0">Apache-2.0</option>
              <option value="BSD_3">BSD-3-Clause</option>
              <option value="LGPL">LGPL</option>
              <option value="MPL_2_0">MPL-2.0</option>
              <option value="UNLICENSE">Unlicense</option>
              <option value="PROPRIETARY">专有协议</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">所需计划</div>
            <select
              value={requiredPlan}
              onChange={(e) => setRequiredPlan(e.target.value)}
              className="w-full bg-bg-primary text-sm text-text-primary border border-border rounded p-2.5"
            >
              <option value="WEEKLY">周卡 (注册可下)</option>
              <option value="MONTHLY">月付会员</option>
              <option value="ANNUAL">年度会员</option>
            </select>
          </div>
        </div>
        <div>
          <div className="text-xs text-text-muted mb-1">Tier (可选, 例 Tier 1 Premium/VIP)</div>
          <input
            type="text"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            placeholder="留空表示 N/A"
            className="w-full bg-bg-primary text-sm text-text-primary border border-border rounded p-2.5"
          />
        </div>
      </div>

      {/* 提交 */}
      <div className="flex items-center justify-end gap-3">
        {success && (
          <span className="text-xs text-accent-up flex items-center gap-1">
            <Check className="w-3 h-3" /> {success}
          </span>
        )}
        {review?.status === 'REJECTED' && (
          <span className="text-xs text-warning flex items-center gap-1">
            <X className="w-3 h-3" /> 审核未通过: {review.reason}
          </span>
        )}
        {error && (
          <span className="text-xs text-warning flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {error}
          </span>
        )}
        <button
          onClick={handleSubmit}
          disabled={pending}
          className="px-5 py-2.5 rounded text-sm font-medium
            bg-accent-purple text-white hover:bg-accent-purple/90
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
            flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          {pending ? '发布中...' : '发布源码'}
        </button>
      </div>
    </div>
  );
}
