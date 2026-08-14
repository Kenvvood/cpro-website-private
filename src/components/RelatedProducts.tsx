/**
 * RelatedProducts.tsx — PDP 底部相关推荐 (借鉴 fxssi 横向 list 风)
 * 同 category, 排除当前, 按 downloadCount desc 取 4 个
 * 复用 /products 列表行的视觉风格 (1px 底边线 + 紧凑)
 */
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Tag } from './Tag';

export interface RelatedItem {
  id: string;
  name: string;
  positioning: string | null;
  tier: string | null;
  category: string;
  downloadCount: number;
  score: number | null;
  capabilityTags?: string[];
  isFree: boolean;
}

interface Props {
  items: RelatedItem[];
}

export function RelatedProducts({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-text-primary">同类推荐</h2>
        <Link href="/products"
          className="text-xs text-text-muted hover:text-accent-purple
            inline-flex items-center gap-1 transition-colors">
          查看全部 <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="border-y border-border">
        {items.map((p) => {
          const rating5 = ((p.score ?? 0) / 20 * 5).toFixed(1);
          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group grid grid-cols-[60px_120px_1fr_100px_60px]
                items-center gap-4 lg:gap-6 py-3 border-b border-border
                last:border-0 hover:bg-bg-secondary transition-colors
                px-3 -mx-3"
            >
              {/* tier 标识 */}
              <div className="w-12 h-12 rounded-md border border-border bg-bg-secondary
                flex items-center justify-center text-accent-purple
                font-mono font-bold text-sm group-hover:border-accent-purple
                transition-colors">
                {p.tier ? (p.tier.match(/Tier (\d)/)?.[1] || '★') : '★'}
              </div>
              {/* tier + category */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-accent-purple font-mono">
                  {p.category}
                </div>
                <div className="text-[10px] text-text-muted">
                  {p.tier ? p.tier.replace('Tier ', 'T') : 'N/A'}
                </div>
              </div>
              {/* 标题 + tag chips */}
              <div>
                <div className="text-sm font-semibold text-text-primary
                  leading-[22px] group-hover:text-accent-purple
                  transition-colors line-clamp-1">
                  {p.positioning ?? p.name}
                </div>
                <div className="text-xs text-text-muted leading-[18px]
                  line-clamp-1 mt-1">
                  {(p.capabilityTags ?? []).slice(0, 4).join(' · ') || '—'}
                </div>
              </div>
              {/* 下载数 */}
              <div className="text-xs text-text-muted num text-right">
                <span className="text-accent-purple">↓</span> {p.downloadCount.toLocaleString()}
              </div>
              {/* 评分 + 限免标识 */}
              <div className="text-right">
                <div className="text-xs text-accent-purple num font-mono">★ {rating5}</div>
                <div className="text-[10px] text-accent-gold">
                  {p.isFree ? '限免' : '付费'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
