/**
 * app/products/page.tsx — PLP (Product List Page)
 * v22.0 Phase 7.24 Batch 5 PATCH2: 借鉴 fxssi.com/tools 真实布局
 *  - 删大 Hero, 顶部紧凑小标题
 *  - 左 sidebar 1fr 数据表 (Tier/Type/Tag 分布 + bar)
 *  - 主区 3fr 横向产品 list + 分页 (12/页)
 *  - 排序: 最新/最热/评分
 *  - 蓝紫 #6c9cfc + 粉红 #f47885 涨跌色
 * v22.0 BATCH 16 PATCH 6 (2026-08-14): 列表项加 ProductDownloadButton 按钮 (跟详情页 PATCH 5 一致)
 * v22.0 BATCH 16 PATCH 7.2 (2026-08-14): 移动端响应式 (PM 反馈: 竖屏 5 列挤; 改 3 列 [图 48 + 内容 1fr + 按钮 auto])
 * v22.0 BATCH 16 PATCH 7.3 (2026-08-14): 桌面列宽重平衡 (PM 反馈: 后面几项列宽不对齐, 1fr 被外层 60px 网格压成 0)
 *   - 修复 col-span bug: Link 改纯 block, 桌面 5 列由内层 div 独立 grid
 *   - 列宽: [60+120+1fr+100+60] → [80+200+1fr+220+120], 1fr 在 1920px 视口 ~890px
 *   - 缩略图 48→64px, 评分 60→120px (强调), 按钮 100→220px (含下载数右侧)
 *   - 标签区 120→200px, 容纳完整中文 tier 标签 (典藏级 VIP / 专业级 Pro)
 * v22.0 BATCH 16 PATCH 7.4 (2026-08-14): 缩略图 64→48px (PM 反馈: 64px 突兀, 跟移动端统一)
 */
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { Flame } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { FilterPanel } from '@/components/FilterPanel';
import { ProductDownloadButton } from '@/components/ProductDownloadButton';
import { prisma } from '@/lib/prisma';
import { getCategoryAliases, t } from '@/lib/i18n';
import { Footer } from '@/components/layout/footer';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;
const PLAN_LEVEL: Record<string, number> = { WEEKLY: 1, MONTHLY: 2, ANNUAL: 3 };

// v22.0 BATCH 16 PATCH 7.1 (2026-08-14): 51 个严选产品全部有缩略图 (PM 拍板: 全部产品都要图, 不只是 5 王牌)
// 5 王牌: 特殊 AI 生成独特图 (gold-*.jpg)
// 46 mtt-*: 7 个 SVG 模板程序化生成 (mtt-{id}.jpg)
// 总大小 ~270KB, 240x240 JPG
// v22.0 BATCH 21 (2026-08-16 23:45): 缩略图 48→40px (PM 反馈: 48px 还偏大, 列表更紧凑)
// 桌面 col 64→52, 移动 w-12→w-10, 列间距 gap-6→gap-5
function getThumbnail(id: string): string | null {
  const aceMap: Record<string, string> = {
    'mtt-ace-dca-gold-grid-v1': '/products/gold-grid.jpg',
    'mtt-ace-gold-arbitrage-v1': '/products/gold-arbitrage.jpg',
    'mtt-ace-gold-warrior-v1': '/products/gold-hedge.jpg',
    'mtt-ace-xau-scalper-v1': '/products/gold-scalper.jpg',
    'mtt-ace-martingail-v1': '/products/gold-martingale.jpg',
  };
  if (aceMap[id]) return aceMap[id];
  if (id.startsWith('mtt-')) return `/products/${id}.jpg`;
  return null;
}

interface Props {
  // v22.0 BATCH 16 PATCH 7.5 (2026-08-15): Next.js 16 要求 searchParams 是 Promise<>
  // 之前 Turbopack 跳过 TS 严格检查, webpack build 抓出来 fail
  // 同步类型在 16 之前能跑但 deprecated, 现在强制 Promise<>
  searchParams: Promise<{ tier?: string; type?: string; tag?: string; page?: string; sort?: string }>;
}

const SORT_OPTIONS = [
  { v: 'latest', l: '最新发布' },
  { v: 'popular', l: '最多下载' },
  { v: 'score', l: '评分最高' },
];

export default async function ProductsPage({ searchParams }: Props) {
  // v22.0 BATCH 16 PATCH 7.5: Next.js 16 searchParams 必须 await
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const sort = sp.sort || 'latest';
  const tier = sp.tier;
  const type = sp.type;
  const tag = sp.tag;

  // 业务过滤: 只显示严选商品 (mtt- 系列 OR 5 王牌, 有 positioning + description)
  // 排除 MQL5 资料库的 11k+ 开源代码占位
  // v22.0 BATCH 16 PATCH 7: 5 王牌 (isFeatured=true) 突破 mtt- 前缀限制
  const where = {
    isActive: true,
    OR: [
      { id: { startsWith: 'mtt-' } },
      { isFeatured: true },
    ],
    positioning: { not: null },
    description: { not: null },
    ...(tier ? { tier } : {}),
    ...(type ? { category: { in: getCategoryAliases(type) as any } } : {}),
    ...(tag ? { capabilityTags: { contains: `"${tag}"` } } : {}),
  };

  const orderBy = sort === 'popular'
    ? [{ isFeatured: 'desc' as const }, { downloadCount: 'desc' as const }]
    : sort === 'score'
    ? [{ isFeatured: 'desc' as const }, { score: 'desc' as const }]
    : [{ isFeatured: 'desc' as const }, { createdAt: 'desc' as const }];

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  // v22.0 BATCH 16 PATCH 6: 一次性查用户所有 ACTIVE 订阅, 算最高 plan level
  // (WEEKLY=1 < MONTHLY=2 < ANNUAL=3)
  const memberships = userId
    ? await prisma.membership.findMany({
        where: { userId, status: 'ACTIVE', expireAt: { gt: new Date() } },
        select: { plan: true },
      })
    : [];
  const userLevel = memberships.reduce(
    (max, m) => Math.max(max, PLAN_LEVEL[m.plan] ?? 0),
    0,
  );
  const hasAccessFor = (requiredPlan: string) =>
    userLevel >= (PLAN_LEVEL[requiredPlan] ?? 1);

  const [products, total, allActive] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      // PATCH 7: 5 王牌也参与分布统计
      where: { isActive: true, OR: [{ id: { startsWith: 'mtt-' } }, { isFeatured: true }] },
      select: { tier: true, category: true, capabilityTags: true }
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // sidebar 分布统计
  const tierDist = computeDist(allActive, (p) => p.tier || 'N/A');
  const typeDist = computeDist(allActive, (p) => p.category);
  const tagDist = computeTagDist(allActive);

  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      {/* 1. 顶部紧凑标题 (借鉴 fxssi 小 hero + token-plan 钩子, 不要大留白) */}
      {/* v22.0 BATCH 19 (2026-08-16 23:00): 3 营销页 hero 排版 + 文案统一
          - 模板: tag + h1 + 副标 + 4 数字徽章 (跟 /, /tools 一致)
          - 文案: 跟 PM 拍板"首批 50, 后续每周 10" + "5 王牌 + 46 严选" 对齐 */}
      <section className="border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 max-w-[1920px] mx-auto space-y-3">
          {/* 顶部 tag 行: 类目 + 状态徽章 (跟 / 一致) */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-accent-purple tracking-widest uppercase">产品中心 · PRODUCTS</span>
            <span className="text-text-muted">MQL4/MQL5 双版本 · 严选可商用</span>
            <span className="text-text-secondary">·</span>
            <span className="inline-flex items-center gap-1.5 text-text-muted">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-up" />
              <span className="num">2026-08-16</span>
              <span>· 51 款严选在售 · 持续更新中</span>
            </span>
          </div>

          {/* h1 + 副标 + 状态 (跟 / 一致, 3fr_2fr grid) */}
          <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-6 xl:gap-10 items-end">
            <div className="space-y-2">
              <h1 className="h1">
                严选可商用 <span className="text-accent-blue">EA</span>
              </h1>
              <p className="text-sm lg:text-base text-text-secondary leading-relaxed max-w-3xl">
                <span className="text-text-primary font-semibold">5 王牌门面 + 46 严选订阅</span>
                <span> · 商业授权贴牌 · 源码可读可改 · 适配 MT4/MT5 双终端</span>
                <span className="block mt-1.5 text-text-muted text-xs">配套策略说明 + 调参指导 · 4h 工单 · 终身质保</span>
              </p>
            </div>
            <div className="text-xs text-text-muted num flex items-center gap-3 xl:justify-end">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-up/10 text-accent-up text-[10px] font-semibold rounded">
                游客可浏览全部
              </span>
              <span>
                共 <span className="text-accent-purple font-semibold">{total}</span> 款 ·
                第 <span className="text-text-primary font-semibold">{page}</span> / {totalPages} 页
              </span>
            </div>
          </div>

          {/* 4 数字徽章 (跟 / 一致) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-border">
            {[
              { value: "51+", label: "款严选策略" },
              { value: "4h", label: "工单响应" },
              { value: "严选", label: "可商用授权" },
              { value: "终身", label: "质保" },
            ].map((m, i) => (
              <div
                key={i}
                className={`px-3 py-2.5 text-center ${i < 3 ? "border-r border-border" : ""}`}
              >
                <div className="text-base lg:text-lg font-bold text-text-primary num leading-tight">
                  {m.value}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 横向排序 + 分页摘要 (极简条) */}
      <section className="border-b border-border bg-bg-secondary">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-2.5 max-w-[1920px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-xs text-text-muted mr-2">排序</span>
            {SORT_OPTIONS.map((s) => (
              <Link
                key={s.v}
                href={buildQuery(sp, { sort: s.v, page: undefined })}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  sort === s.v
                    ? 'bg-accent-purple text-white'
                    : 'text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                {s.l}
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} searchParams={sp} />
        </div>
      </section>

      {/* 3. 主体: 左 sidebar 1fr + 主区 3fr */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 lg:py-8 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Sidebar: 紧凑数据表 (借鉴 fxssi Quick Sentiment) */}
          <aside className="space-y-4">
            <FilterPanel currentTier={tier} currentType={type} currentTag={tag} />
            <DistTable title="Tier 分布" data={tierDist} paramKey="tier" searchParams={sp} />
            <DistTable title="分类分布" data={typeDist} paramKey="type" searchParams={sp} />
            <TagList tags={tagDist} activeTag={tag} searchParams={sp} />
          </aside>

          {/* 主区: 横向产品 list */}
          <section>
            {products.length === 0 ? (
              <div className="border border-border p-12 text-center text-text-muted">
                <p className="text-base mb-2">未找到匹配的产品</p>
                <p className="text-sm">尝试清除筛选条件</p>
              </div>
            ) : (
              <div className="border-y border-border">
                {products.map((p: Record<string, any>, i) => {
                  let tags: string[] = [];
                  try {
                    const parsed = JSON.parse(p.capabilityTags);
                    if (Array.isArray(parsed)) tags = parsed;
                  } catch {}
                  const score = p.score ?? 0;
                  const rating10 = (score / 20 * 5).toFixed(1); // 0-20 转 0-5
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      // PATCH 7.3 (2026-08-14): 桌面 5 列列宽重平衡 + 修复 col-span bug
                      //  旧: [60+120+1fr+100+60] = 340px fixed (1fr 易被外层 60px 网格压成 0, 标题被截断)
                      //  新: [80+200+1fr+220+120] = 620px fixed (1fr 在 1920px 视口 ~890px, 充分利用页宽)
                      //  Link 改为纯 block, 桌面 5 列横排由内层 div 独立 grid 渲染
                      //  缩略图 48→64px, 评分 60→120px, 按钮 100→220px (含下载数)
                      className={`group relative block border-b border-border last:border-0 hover:bg-bg-secondary transition-colors px-3 -mx-3 py-3 ${
                        p.isFeatured ? 'bg-accent-gold/5 border-l-2 border-l-accent-gold -ml-px' : ''
                      }`}
                    >
                      {/* 移动端布局 (< lg): 卡片式 */}
                      <div className="flex items-center gap-3 lg:hidden">
                        {/* EA 缩略图 (BATCH 21: 48→40px, 列表更紧凑) */}
                        {getThumbnail(p.id) ? (
                          <div className={`w-10 h-10 rounded-md border overflow-hidden bg-bg-secondary shrink-0 ${
                            p.isFeatured ? 'border-accent-gold/40' : 'border-border'
                          }`}>
                            <Image src={getThumbnail(p.id)!} alt={p.positioning ?? p.name} width={40} height={40} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-md border bg-bg-secondary flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                            p.isFeatured ? 'border-accent-gold text-accent-gold' : 'border-border text-accent-purple'
                          }`}>
                            {p.tier ? p.tier.match(/Tier (\d)/)?.[1] || '★' : '★'}
                          </div>
                        )}
                        {/* 移动端内容: 标题 + meta 行 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {p.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-accent-gold/15 text-accent-gold text-[9px] font-bold tracking-wider uppercase rounded">
                                <Flame size={8} className="fill-current" /> 热门
                              </span>
                            )}
                            <span className="text-[10px] text-text-muted truncate">
                              {t.category(p.category).full} · {t.tier(p.tier).short} · {t.plan(p.requiredPlan).short}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-text-primary leading-snug group-hover:text-accent-purple transition-colors line-clamp-1">
                            {p.positioning ?? p.name}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
                            <span className="num"><span className="text-accent-purple">↓</span> {(p.downloadCount ?? 0).toLocaleString()}</span>
                            <span className="num text-accent-purple font-mono">★ {rating10}</span>
                          </div>
                        </div>
                      </div>
                      {/* 移动端底部按钮 (独占一行) */}
                      <div className="mt-2 lg:hidden">
                        <ProductDownloadButton
                          productId={p.id}
                          requiredPlan={p.requiredPlan}
                          hasAccess={hasAccessFor(p.requiredPlan)}
                          userId={userId}
                        />
                      </div>

                      {/* 桌面布局 (lg+): 5 列横排 [52+200+1fr+220+120] (PATCH 7.3 改善列宽 + BATCH 21: 缩略图 64→52, 实际渲染 48→40) */}
                      <div className="hidden lg:block">
                        <div className="grid grid-cols-[52px_200px_1fr_220px_120px] items-center gap-5">
                          {/* 1. EA 缩略图 (BATCH 21: 48→40px, 桌面 col 64→52, 移动同步) */}
                          {getThumbnail(p.id) ? (
                            <div className={`w-10 h-10 rounded-md border overflow-hidden bg-bg-secondary shrink-0 ${p.isFeatured ? 'border-accent-gold/40' : 'border-border'}`}>
                              <Image src={getThumbnail(p.id)!} alt={p.positioning ?? p.name} width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-md border bg-bg-secondary flex items-center justify-center font-mono font-bold text-sm ${p.isFeatured ? 'border-accent-gold text-accent-gold' : 'border-border text-accent-purple'}`}>
                              {p.tier ? p.tier.match(/Tier (\d)/)?.[1] || '★' : '★'}
                            </div>
                          )}
                          {/* 2. tier + type + 热门徽章 (120→200px, 容纳完整中文标签) */}
                          <div className="space-y-1 min-w-0">
                            {p.isFeatured && (
                              <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-accent-gold/15 text-accent-gold text-[10px] font-bold tracking-wider uppercase rounded">
                                <Flame size={10} className="fill-current" /> 热门
                              </div>
                            )}
                            <div className="text-[11px] uppercase tracking-wider text-accent-purple font-mono truncate">
                              {t.category(p.category).full}
                            </div>
                            <div className="text-[11px] text-text-muted truncate">
                              {t.tier(p.tier).short}
                            </div>
                          </div>
                          {/* 3. 标题 + tag (1fr, 充分利用主区宽度) */}
                          <div className="min-w-0">
                            <div className="text-sm lg:text-base font-semibold text-text-primary leading-[22px] group-hover:text-accent-purple transition-colors line-clamp-1">
                              {p.positioning ?? p.name}
                            </div>
                            <div className="text-xs text-text-muted leading-[18px] line-clamp-1 mt-1">
                              {tags.slice(0, 4).map(t.tag).join(' · ') || '—'}
                            </div>
                          </div>
                          {/* 4. 下载数 + 按钮 (100→220px, 按钮+数字更舒展) */}
                          <div className="flex items-center justify-end gap-3">
                            <div className="text-right">
                              <div className="text-xs text-text-muted num whitespace-nowrap">
                                <span className="text-accent-purple">↓</span> {(p.downloadCount ?? 0).toLocaleString()}
                              </div>
                              <div className="text-[10px] text-text-muted">下载</div>
                            </div>
                            <ProductDownloadButton
                              productId={p.id}
                              requiredPlan={p.requiredPlan}
                              hasAccess={hasAccessFor(p.requiredPlan)}
                              userId={userId}
                            />
                          </div>
                          {/* 5. 评分 + 计划 (60→120px, 强调评分视觉) */}
                          <div className="text-right">
                            <div className="text-base font-semibold text-accent-purple num font-mono">★ {rating10}</div>
                            <div className="text-[10px] text-accent-gold mt-0.5">{t.plan(p.requiredPlan).short}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center">
                <Pagination page={page} totalPages={totalPages} searchParams={sp} large />
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* === 工具函数 === */
// v22.0 BATCH 16 PATCH 7.5: 接收同步对象 (await 后的 searchParams), 不再是 Promise<>
type Sp = { tier?: string; type?: string; tag?: string; page?: string; sort?: string };
function buildQuery(sp: Sp, overrides: Record<string, string | undefined>) {
  // v22.0 BATCH 16 PATCH 7.9 (2026-08-15): 用 'in' 区分"未传"跟"传 undefined"
  // 之前 `overrides.page ?? sp.page` 让 `page: undefined` (点 1 / 末页 disable) 继承当前页码
  // 症状: /products?page=2 点 page 1 链接, href = /products?page=2 (跳回当前页)
  const p = new URLSearchParams();
  const t = 'tier' in overrides ? overrides.tier : sp.tier;
  const ty = 'type' in overrides ? overrides.type : sp.type;
  const tg = 'tag' in overrides ? overrides.tag : sp.tag;
  const s = 'sort' in overrides ? overrides.sort : sp.sort;
  const pg = 'page' in overrides ? overrides.page : sp.page;
  if (t) p.set('tier', t);
  if (ty) p.set('type', ty);
  if (tg) p.set('tag', tg);
  if (s) p.set('sort', s);
  if (pg && pg !== '1') p.set('page', pg);
  return '/products' + (p.toString() ? '?' + p.toString() : '');
}

function computeDist(items: any[], key: (p: any) => string) {
  const total = items.length || 1;
  const m = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    m.set(k, (m.get(k) || 0) + 1);
  }
  return Array.from(m.entries())
    .map(([k, n]) => ({ k, n, pct: Math.round(n / total * 100) }))
    .sort((a, b) => b.n - a.n);
}

function computeTagDist(items: any[]) {
  const m = new Map<string, number>();
  for (const it of items) {
    try {
      const tags = JSON.parse(it.capabilityTags || '[]');
      if (Array.isArray(tags)) {
        for (const tg of tags) {
          // tag 格式 "Category: Subcategory" -> 取 Subcategory
          const parts = String(tg).split(':');
          const name = parts[1]?.trim() || parts[0]?.trim() || String(tg);
          m.set(name, (m.get(name) || 0) + 1);
        }
      }
    } catch {}
  }
  return Array.from(m.entries())
    .map(([k, n]) => ({ k, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
}

/* === Sidebar: 分布数据表 (借鉴 fxssi Quick Sentiment) === */
function DistTable({ title, data, paramKey, searchParams }: { title: string; data: { k: string; n: number; pct: number }[]; paramKey: string; searchParams: Sp }) {
  return (
    <div className="border border-border">
      <h3 className="text-xs text-text-muted tracking-widest uppercase px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
        {title}
      </h3>
      <div>
        {data.map((d, i) => {
          const active = (searchParams as any)[paramKey] === d.k;
          return (
            <Link
              key={d.k}
              href={buildQuery(searchParams, { [paramKey]: active ? undefined : d.k, page: undefined })}
              className={`group grid grid-cols-[1fr_36px_44px] items-center gap-2 px-4 py-2 text-xs border-b border-border last:border-0 transition-colors ${
                active ? 'bg-accent-purple/10 text-accent-purple' : 'hover:bg-bg-secondary text-text-secondary'
              }`}
            >
              <span className="truncate">{d.k}</span>
              <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div className={`h-full ${active ? 'bg-accent-purple' : 'bg-accent-purple/50'}`} style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-right num text-text-muted">{d.n}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* === Sidebar: Tag 列表 === */
function TagList({ tags, activeTag, searchParams }: { tags: { k: string; n: number }[]; activeTag?: string; searchParams: Sp }) {
  if (tags.length === 0) return null;
  return (
    <div className="border border-border">
      <h3 className="text-xs text-text-muted tracking-widest uppercase px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-up" />
        热门标签
      </h3>
      <div>
        {tags.map((t, i) => {
          const active = activeTag === t.k;
          return (
            <Link
              key={t.k}
              href={buildQuery(searchParams, { tag: active ? undefined : t.k, page: undefined })}
              className={`group flex items-center justify-between px-4 py-2 text-xs border-b border-border last:border-0 transition-colors ${
                active ? 'bg-accent-up/10 text-accent-up' : 'hover:bg-bg-secondary text-text-secondary'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-text-muted num text-[10px] w-5">{String(i + 1).padStart(2, '0')}</span>
                <span className="truncate">{t.k}</span>
              </span>
              <span className="text-text-muted num text-[10px]">{t.n}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* === 分页 === */
// v22.0 BATCH 16 PATCH 7.10 (2026-08-15): 分页改用 <a> 而不是 <Link>
// 根因: page 1 链接 href = /products (无 query), 跟当前 /products?page=2 path 一样
// Next.js 16 Link 客户端 router 在 path 一样 + searchParams 不同时, 复用 RSC cache
// 导致 server component 不重 render, 显示内容不变 ("点 1 无反应")
// 解法: 用原生 <a> 强制 full page navigation, 保证 server component 重新执行
function Pagination({ page, totalPages, searchParams, large }: { page: number; totalPages: number; searchParams: Sp; large?: boolean }) {
  const pages = compactPages(page, totalPages);
  const cls = large ? 'text-sm px-3 py-2' : 'text-xs px-2.5 py-1';
  return (
    <div className="flex items-center gap-1">
      <a
        href={buildQuery(searchParams, { page: page > 1 ? String(page - 1) : undefined })}
        className={`${cls} rounded border border-border text-text-secondary hover:bg-bg-tertiary ${page === 1 ? 'pointer-events-none opacity-40' : ''}`}
      >
        ‹ 上一页
      </a>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`d${i}`} className={`${cls} text-text-muted`}>…</span>
        ) : (
          <a
            key={p}
            href={buildQuery(searchParams, { page: p === 1 ? undefined : String(p) })}
            className={`${cls} rounded border ${
              p === page
                ? 'border-accent-purple bg-accent-purple text-white'
                : 'border-border text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            {p}
          </a>
        )
      )}
      <a
        href={buildQuery(searchParams, { page: page < totalPages ? String(page + 1) : undefined })}
        className={`${cls} rounded border border-border text-text-secondary hover:bg-bg-tertiary ${page === totalPages ? 'pointer-events-none opacity-40' : ''}`}
      >
        下一页 ›
      </a>
    </div>
  );
}

function compactPages(cur: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (cur > 4) pages.push('…');
  const start = Math.max(2, cur - 1);
  const end = Math.min(total - 1, cur + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (cur < total - 3) pages.push('…');
  pages.push(total);
  return pages;
}
