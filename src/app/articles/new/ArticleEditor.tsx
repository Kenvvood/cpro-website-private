// /articles/new/ArticleEditor.tsx — 文章编辑器 (client)
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send, AlertTriangle, Check, X } from 'lucide-react';

type ArticleType = 'PURE' | 'OPEN_SOURCE';

export function ArticleEditor() {
  const router = useRouter();
  const [type, setType] = useState<ArticleType>('PURE');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  // OPEN_SOURCE 必填
  const [fileUrl, setFileUrl] = useState('');
  const [license, setLicense] = useState('MIT');
  const [originalAuthor, setOriginalAuthor] = useState('');
  const [originalSource, setOriginalSource] = useState('');

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<{ status: 'APPROVED' | 'REJECTED'; reason?: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setReview(null);
    setSuccess(null);

    if (!title.trim() || title.length < 5) {
      setError('标题至少 5 字');
      return;
    }
    if (!summary.trim() || summary.length < 10) {
      setError('摘要至少 10 字');
      return;
    }
    if (!content.trim() || content.length < 200) {
      setError('正文至少 200 字');
      return;
    }
    if (type === 'OPEN_SOURCE') {
      if (!fileUrl.trim() || !fileUrl.startsWith('http')) {
        setError('源码文章必须填写源码下载链接 (http(s):// 开头)');
        return;
      }
      if (!originalAuthor.trim() || !originalSource.trim()) {
        setError('源码文章必须填写原作者和原始仓库');
        return;
      }
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            title: title.trim(),
            summary: summary.trim(),
            content: content.trim(),
            fileUrl: type === 'OPEN_SOURCE' ? fileUrl.trim() : null,
            license: type === 'OPEN_SOURCE' ? license : null,
            originalAuthor: type === 'OPEN_SOURCE' ? originalAuthor.trim() : null,
            originalSource: type === 'OPEN_SOURCE' ? originalSource.trim() : null,
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
          setTimeout(() => router.push(`/articles/${data.slug}`), 1500);
        }
      } catch (e: any) {
        setError('网络错误, 请重试');
      }
    });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* 类型选择 */}
      <div className="flex gap-2">
        <button
          onClick={() => setType('PURE')}
          className={`flex-1 px-3 py-2.5 rounded text-sm font-medium border transition-colors ${
            type === 'PURE'
              ? 'border-accent-purple bg-accent-purple/10 text-accent-purple'
              : 'border-border text-text-muted hover:border-accent-purple/30'
          }`}
        >
          纯文章 (PURE)
          <div className="text-[10px] font-normal mt-0.5">自由创作, 无需源码</div>
        </button>
        <button
          onClick={() => setType('OPEN_SOURCE')}
          className={`flex-1 px-3 py-2.5 rounded text-sm font-medium border transition-colors ${
            type === 'OPEN_SOURCE'
              ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
              : 'border-border text-text-muted hover:border-accent-gold/30'
          }`}
        >
          源码文章 (OPEN_SOURCE)
          <div className="text-[10px] font-normal mt-0.5">必传源码 + 双重署名 + 协议</div>
        </button>
      </div>

      {/* 标题 */}
      <div>
        <div className="text-xs text-text-muted mb-1">标题 <span className="text-warning">*</span> (至少 5 字)</div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 200))}
          placeholder="一句话点题..."
          className="w-full bg-bg-secondary text-sm text-text-primary border border-border rounded p-2.5 focus:border-accent-purple focus:outline-none"
        />
        <div className="text-[10px] text-text-muted text-right num mt-1">{title.length}/200</div>
      </div>

      {/* 摘要 */}
      <div>
        <div className="text-xs text-text-muted mb-1">摘要 <span className="text-warning">*</span> (至少 10 字)</div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value.slice(0, 500))}
          rows={2}
          placeholder="一句话 hook, 让读者快速判断值不值得读"
          className="w-full bg-bg-secondary text-sm text-text-primary border border-border rounded p-2.5 focus:border-accent-purple focus:outline-none resize-y"
        />
        <div className="text-[10px] text-text-muted text-right num mt-1">{summary.length}/500</div>
      </div>

      {/* 源码文章专属字段 */}
      {type === 'OPEN_SOURCE' && (
        <div className="space-y-3 p-4 border border-accent-gold/30 bg-accent-gold/5 rounded">
          <div className="text-xs font-semibold text-accent-gold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            源码文章必填项
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">源码下载链接 <span className="text-warning">*</span></div>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/source.zip"
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
          <div>
            <div className="text-xs text-text-muted mb-1">协议</div>
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
              <option value="MIT">MIT</option>
              <option value="LGPL">LGPL</option>
              <option value="MPL_2_0">MPL-2.0</option>
              <option value="UNLICENSE">Unlicense</option>
              <option value="PROPRIETARY">专有协议</option>
            </select>
          </div>
        </div>
      )}

      {/* 正文 */}
      <div>
        <div className="text-xs text-text-muted mb-1">正文 (Markdown) <span className="text-warning">*</span> (至少 200 字)</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 50000))}
          rows={16}
          placeholder="## 标题\n正文内容...\n\n- 列表项 1\n- 列表项 2\n\n**粗体** `代码`"
          className="w-full bg-bg-secondary text-sm text-text-primary font-mono border border-border rounded p-3 focus:border-accent-purple focus:outline-none resize-y"
        />
        <div className="text-[10px] text-text-muted text-right num mt-1">{content.length}/50000</div>
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
          {pending ? '发布中...' : '发布'}
        </button>
      </div>
    </div>
  );
}
