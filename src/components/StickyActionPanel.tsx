/**
 * StickyActionPanel.tsx — PDP 右侧粘性 CTA 面板
 * v22.0 Phase 7.24 Batch 6: 用 score (0-20) 替代 rating, 加风险提示
 * v22.0 Phase 7.24 BATCH 16 PATCH 5 (2026-08-14): 下载按钮永远显示 + 弹窗提示
 *   - 未登录: toast "请先登录" + CTA 跳 /login
 *   - 已登录未订阅: toast "需订阅 X 会员" + CTA 跳 /membership
 *   - 已订阅: 实际下载 (POST /api/downloads/[productId])
 *   - 之前 hasAccess=false 时显示 Lock 升级按钮, 用户看不到下载 → 转化不透明
 * v22.0 BATCH 16 PATCH 7.2 (2026-08-14): 移动端不 sticky (PM: 竖屏 sticky 跟主区堆叠体验差, 改为正常位置)
 */
'use client';

import { Lock, Download, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TierBadge } from './TierBadge';
import { Tag } from './Tag';
import { t } from '@/lib/i18n';

interface Props {
  product: {
    id: string;             // PATCH 5 新增: 实际下载用
    tier: string | null;
    requiredPlan: string;
    capabilityTags?: string[];
    score: number;       // 0-20 (mtt- 字段)
    downloadCount: number;
  };
  hasAccess: boolean;     // PATCH 5: 仅用于按钮文案/状态
  userId?: string;        // PATCH 5 新增: null/undefined = 游客
}

export function StickyActionPanel({ product, hasAccess, userId }: Props) {
  const router = useRouter();
  const planEntry = t.plan(product.requiredPlan);
  const rating5 = (product.score / 20 * 5).toFixed(1);

  // PATCH 5: 永远显示下载按钮, 点击按状态弹窗
  const handleDownload = async () => {
    if (!userId) {
      // 游客: 提示登录
      toast.info('请先登录账号', {
        description: '登录后即可下载所有订阅资源',
        action: {
          label: '去登录',
          onClick: () => router.push(`/login?redirect=/products/${product.id}`),
        },
      });
      return;
    }
    if (!hasAccess) {
      // 已登录未订阅: 提示订阅
      toast.warning(`需订阅 ${planEntry.full} 会员`, {
        description: '订阅后可下载全部 EA 源码 + 严选开源资源',
        action: {
          label: '查看会员',
          onClick: () => router.push(`/membership?from=/products/${product.id}`),
        },
      });
      return;
    }
    // 已订阅: 实际下载
    const promise = fetch(`/api/downloads/${product.id}`, { method: 'POST' })
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.message || `下载失败 (${r.status})`);
        }
        return r.json();
      })
      .then((data) => {
        if (data.url) {
          window.location.href = data.url;
        }
        return data;
      });
    toast.promise(promise, {
      loading: '准备下载...',
      success: '下载已开始',
      error: (err) => err.message || '下载失败',
    });
  };

  return (
    <aside className="bg-bg-secondary border border-border rounded-lg
      overflow-hidden lg:sticky lg:top-24">
      {/* 顶部 plan + tier 彩色带 */}
      <div className="bg-bg-tertiary px-5 py-4 border-b border-border">
        <div className="text-xs text-text-muted mb-1.5">所需计划</div>
        <div className="flex items-center justify-between">
          <span className="text-text-primary font-bold text-base">
            {planEntry.full}
          </span>
          <TierBadge tier={product.tier} />
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* 评分 + 下载 (2 列) */}
        <div className="grid grid-cols-2 gap-3">
          <Metric label="评分" value={rating5} suffix="/5.0" accent />
          <Metric label="下载" value={product.downloadCount.toLocaleString()} suffix="次" />
        </div>

        {/* Tags (精选 3 个) */}
        {product.capabilityTags && product.capabilityTags.length > 0 && (
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2">
              核心标签
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.capabilityTags.slice(0, 3).map(t => (
                <Tag key={t} label={t} />
              ))}
            </div>
          </div>
        )}

        {/* PATCH 5: 主 CTA 永远显示, 点击按状态弹窗 */}
        <button
          onClick={handleDownload}
          className={`w-full py-3 px-4 rounded font-semibold transition-colors
            flex items-center justify-center gap-2
            ${hasAccess
              ? 'bg-accent text-bg-primary hover:bg-accent/90'
              : 'bg-bg-tertiary text-text-primary border border-border hover:border-accent-gold hover:text-accent-gold'
            }`}
        >
          {hasAccess ? (
            <>
              <Download className="w-5 h-5" />
              安全下载 .ex4 / .ex5
            </>
          ) : userId ? (
            <>
              <Sparkles className="w-5 h-5" />
              下载 (需升级订阅)
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              下载 (登录后可用)
            </>
          )}
        </button>

        {/* 风险提示 (强制展示, 不依赖 product.riskControl 字段) */}
        <div className="flex items-start gap-2 p-3 border border-warning/30 bg-warning/5 rounded text-xs text-text-secondary">
          <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            所有 EA 仅供策略学习与实盘参考, 过往表现不代表未来收益, 投资有风险, 使用前请先在模拟盘充分测试。
          </span>
        </div>

        {/* 信任标记 */}
        <div className="text-xs text-text-muted text-center pt-2
          border-t border-border">
          <Check className="w-3 h-3 inline mr-1" /> 已审核 · 安全下载 · 自动发货
        </div>
      </div>
    </aside>
  );
}

function Metric({ label, value, suffix, accent }: { label: string; value: string; suffix?: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-xl font-bold num ${accent ? 'text-accent-purple' : 'text-text-primary'}`}>
        {value}
        {suffix && <span className="text-xs text-text-muted ml-0.5 font-normal">{suffix}</span>}
      </div>
    </div>
  );
}
