/**
 * FilterPanel.tsx — 多维过滤面板 (Tier + Type + Tags)
 * task065: 接入 i18n 字典; 分类收敛为 EA/指标/脚本 3 类
 * URL 同步: 通过 Link 更新 searchParams
 */
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { t } from '@/lib/i18n';

const TIER_OPTIONS = [
  { value: 'Tier 1 (Premium/VIP)', label: t.tier('Tier 1 (Premium/VIP)').full },
  { value: 'Tier 2 (Pro)', label: t.tier('Tier 2 (Pro)').full },
  { value: 'Tier 3 (Basic)', label: t.tier('Tier 3 (Basic)').full },
];

// task065 降维合并: Code Snippet 不再暴露, 与 Script 共用「辅助脚本」
const TYPE_OPTIONS = [
  { value: 'EA',        label: t.category('EA').full },
  { value: 'Indicator', label: t.category('Indicator').full },
  { value: 'Script',    label: t.category('Script').full }, // 隐式含 Code Snippet
];

const POPULAR_TAGS = [
  'Strategy: Martingale', 'Strategy: MA-Cross', 'Strategy: Grid',
  'Trade Utility: Close-All', 'Trade Utility: Hedging',
  'Math & AI: ONNX', 'Math & AI: Matrix',
  'Integration & Alert: Telegram', 'Integration & Alert: CSV-Export',
  'UI & Dashboard: Canvas',
];

export function FilterPanel({ currentTier, currentType, currentTag }: {
  currentTier?: string;
  currentType?: string;
  currentTag?: string;
}) {
  const path = usePathname();
  const [tierOpen, setTierOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(true);
  const [tagOpen, setTagOpen] = useState(false);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const tier = overrides.tier ?? currentTier;
    const type = overrides.type ?? currentType;
    const tag = overrides.tag ?? currentTag;
    if (tier) params.set('tier', tier);
    if (type) params.set('type', type);
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  };

  const hasAnyFilter = !!(currentTier || currentType || currentTag);

  return (
    <aside className="bg-bg-secondary border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">筛选</h2>
        {hasAnyFilter && (
          <Link href={path} className="text-xs text-text-muted hover:text-accent
            flex items-center gap-1 transition-colors">
            <X className="w-3 h-3" /> 清除
          </Link>
        )}
      </div>

      {/* Tier 分组 */}
      <FilterGroup title="商品级别" isOpen={tierOpen} onToggle={() => setTierOpen(!tierOpen)}>
        <div className="space-y-1.5">
          {TIER_OPTIONS.map(opt => {
            const active = currentTier === opt.value;
            return (
              <Link key={opt.value} href={buildHref({ tier: active ? undefined : opt.value })}
                className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                  active
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}>
                {opt.label}
              </Link>
            );
          })}
        </div>
      </FilterGroup>

      {/* Type 分组 (task065: 仅 3 类) */}
      <FilterGroup title="商品分类" isOpen={typeOpen} onToggle={() => setTypeOpen(!typeOpen)}>
        <div className="space-y-1.5">
          {TYPE_OPTIONS.map(opt => {
            const active = currentType === opt.value;
            return (
              <Link key={opt.value} href={buildHref({ type: active ? undefined : opt.value })}
                className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                  active
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}>
                {opt.label}
              </Link>
            );
          })}
        </div>
      </FilterGroup>

      {/* Tags 分组 (默认折叠) */}
      <FilterGroup title="极客标签" isOpen={tagOpen} onToggle={() => setTagOpen(!tagOpen)}>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {POPULAR_TAGS.map(t => {
            const active = currentTag === t;
            return (
              <Link key={t} href={buildHref({ tag: active ? undefined : t })}
                className={`block px-2 py-1.5 text-xs rounded transition-colors ${
                  active
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}>
                {t}
              </Link>
            );
          })}
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, isOpen, onToggle, children }: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 pb-4 border-b border-border last:border-b-0 last:mb-0 last:pb-0">
      <button onClick={onToggle}
        className="flex items-center justify-between w-full mb-2
          text-sm font-semibold text-text-primary hover:text-accent
          transition-colors">
        {title}
        <ChevronDown className={`w-4 h-4 text-text-muted
          transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && children}
    </div>
  );
}