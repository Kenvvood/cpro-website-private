/**
 * ProductDownloadButton.tsx — 列表项内联下载按钮 (v22.0 BATCH 16 PATCH 6, 2026-08-14)
 *
 * 设计: 3 状态文案 (跟 StickyActionPanel 一致)
 *   - 已订阅: bg-accent 绿 + Download icon
 *   - 未订阅: bg-bg-tertiary 灰 + Sparkles icon
 *   - 未登录: bg-bg-tertiary 灰 + Lock icon
 *
 * 点击 → sonner toast 提示 (跟 PATCH 5 详情页下载按钮一致)
 */
'use client';

import { Lock, Download, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';
// v22.0 BATCH 25: 埋点 - 下载成功/失败
import { track } from '@/lib/analytics';

interface Props {
  productId: string;
  requiredPlan: string;
  hasAccess: boolean;
  userId?: string;
}

export function ProductDownloadButton({ productId, requiredPlan, hasAccess, userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const planEntry = t.plan(requiredPlan);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();  // 防止触发外层 Link /products/[id]

    if (!userId) {
      toast.info('请先登录账号', {
        description: '登录后即可下载所有订阅资源',
        action: {
          label: '去登录',
          onClick: () => router.push(`/login?redirect=/products/${productId}`),
        },
      });
      return;
    }
    if (!hasAccess) {
      toast.warning(`需订阅 ${planEntry.full} 会员`, {
        description: '订阅后可下载全部 EA 源码 + 严选开源资源',
        action: {
          label: '查看会员',
          onClick: () => router.push(`/membership?from=/products/${productId}`),
        },
      });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/downloads/${productId}`, { method: 'POST' });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || `下载失败 (${r.status})`);
      }
      const data = await r.json();
      // v22.0 BATCH 25: 埋点 - 成功下载
      track.downloadProduct(productId, true);
      if (data.url) {
        window.location.href = data.url;
      }
      toast.success('下载已开始');
    } catch (err: any) {
      toast.error(err.message || '下载失败');
    } finally {
      setLoading(false);
    }
  };

  // 3 状态图标 + 文案 + 配色
  // v22.0 BATCH 16 PATCH 7.1 (2026-08-14): "需登录" → "登录", "需升级" → "升级" (PM: 列表窄列 2 行换行 难看)
  const Icon = loading ? Loader2 : (hasAccess ? Download : (userId ? Sparkles : Lock));
  const label = loading
    ? '准备中'
    : (hasAccess ? '下载' : (userId ? '升级' : '登录'));
  const cls = hasAccess
    ? 'bg-accent text-bg-primary hover:bg-accent/90'
    : 'bg-bg-tertiary text-text-primary border border-border hover:border-accent-gold hover:text-accent-gold';

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title={
        hasAccess
          ? '安全下载 .ex4 / .ex5'
          : (userId ? `需订阅 ${planEntry.full} 会员` : '登录后即可下载')
      }
      className={`inline-flex items-center justify-center gap-1
        px-2 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap
        ${cls} disabled:opacity-50`}
    >
      <Icon className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      <span>{label}</span>
    </button>
  );
}
