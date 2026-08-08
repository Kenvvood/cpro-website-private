/**
 * StickyActionPanel.tsx — PDP 右侧粘性 CTA 面板
 * 显示会员等级 + 摘要数字 + 主 CTA
 * task065: 接入 i18n dict
 */
import { Lock, Download, Check } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { Tag } from './Tag';
import { t } from '@/lib/i18n';

interface Props {
  product: {
    tier: string;
    requiredPlan: string;
    capabilityTags?: string[];
    rating: number;
    ratingCount: number;
    downloadCount: number;
  };
  hasAccess: boolean;
  onCheckout: () => void;
}

export function StickyActionPanel({ product, hasAccess, onCheckout }: Props) {
  const planEntry = t.plan(product.requiredPlan);
  return (
    <aside className="sticky top-24 bg-bg-secondary border border-border
      rounded-lg p-6 space-y-5">
      {/* 所需计划 + Tier 徽标 */}
      <div>
        <div className="text-xs text-text-muted mb-2">
          所需计划
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-primary font-semibold">
            {planEntry.full}
          </span>
          <TierBadge tier={product.tier} />
        </div>
      </div>

      {/* 摘要数字 */}
      <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
        <Metric label="评分" value={product.rating.toFixed(1)} suffix="/5" />
        <Metric label="下载" value={product.downloadCount.toString()} suffix="次" />
      </div>

      {/* Tags (精选 3 个) */}
      {product.capabilityTags && product.capabilityTags.length > 0 && (
        <div>
          <div className="text-xs text-text-muted uppercase tracking-wider mb-2">
            核心标签
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.capabilityTags.slice(0, 3).map(t => (
              <Tag key={t} label={t} />
            ))}
          </div>
        </div>
      )}

      {/* 主 CTA: 根据权限切换 */}
      {hasAccess ? (
        <button className="w-full py-3 px-4 rounded font-semibold
          bg-accent text-bg-primary hover:bg-accent/90 transition-colors
          flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          安全下载 .ex4 / .ex5
        </button>
      ) : (
        <button onClick={onCheckout}
          className="w-full py-3 px-4 rounded font-semibold
            bg-warning text-bg-primary hover:bg-warning/90 transition-colors
            flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" />
          使用 USDT 升级解锁
        </button>
      )}

      {/* 信任标记 */}
      <div className="text-xs text-text-muted text-center pt-2
        border-t border-border">
        <Check className="w-3 h-3 inline mr-1" /> 已审核 · 安全下载 · 自动发货
      </div>
    </aside>
  );
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <div className="text-xs text-text-muted">{label}</div>
      <div className="text-lg font-semibold text-text-primary">
        {value}
        {suffix && <span className="text-sm text-text-muted ml-0.5">{suffix}</span>}
      </div>
    </div>
  );
}