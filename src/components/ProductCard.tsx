/**
 * ProductCard.tsx — task-0033 PLP 原子组件
 * 设计语言: 深色 / TradingView 风 / 极简
 */
import Link from 'next/link';
import { Bot, BarChart3, FileCode, Code2 } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { Tag } from './Tag';

interface Props {
  product: {
    id: string;
    positioning: string;
    category: string;
    tier: string;
    capabilityTags?: string[];
  };
}

const TYPE_ICON = {
  EA: Bot,
  Indicator: BarChart3,
  Script: FileCode,
  'Code Snippet': Code2,
} as const;

export function ProductCard({ product }: Props) {
  const Icon = TYPE_ICON[product.category as keyof typeof TYPE_ICON] ?? Code2;
  const tags = (product.capabilityTags ?? []).slice(0, 2);
  return (
    <Link href={`/products/${product.id}`}>
      <article className="group relative flex flex-col h-full
        bg-bg-secondary border border-border rounded-lg p-5
        transition-all duration-200
        hover:border-accent-2/50 hover:shadow-lg hover:shadow-accent-2/10
        hover:-translate-y-0.5">
        {/* Tier Badge 右上角 */}
        <span className="absolute top-3 right-3 z-10">
          <TierBadge tier={product.tier} />
        </span>

        {/* 封面图占位: 按 type 渲染图标 */}
        <div className="aspect-video bg-gradient-to-br from-bg-tertiary to-bg-primary
          rounded mb-4 flex items-center justify-center
          border border-border">
          <Icon className="w-12 h-12 text-text-muted group-hover:text-accent-2
            transition-colors" />
        </div>

        {/* 产品类型 + Tier 行 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-text-muted">{product.category}</span>
          {product.tier && product.tier !== 'N/A' && (
            <span className="text-xs text-text-muted">·</span>
          )}
          <span className="text-xs text-text-muted">{product.tier?.split(' ')[0]}</span>
        </div>

        {/* 产品名称 (一句话定位) */}
        <h3 className="text-base font-semibold text-text-primary mb-2 line-clamp-2
          group-hover:text-accent transition-colors min-h-[3rem]">
          {product.positioning}
        </h3>

        {/* Tags (最多 2 个) */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map(t => <Tag key={t} label={t} />)}
          </div>
        )}

        {/* 底部 CTA */}
        <div className="mt-auto pt-3 border-t border-border
          flex items-center justify-between">
          <span className="text-xs text-text-muted">查看详情</span>
          <span className="text-accent text-sm font-semibold
            group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </article>
    </Link>
  );
}