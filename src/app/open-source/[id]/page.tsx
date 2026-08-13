// /open-source/[id]/page.tsx — 开源源码详情页
// v22.0 Phase 7.24 Batch 8
// 借鉴 /products/[id] (Batch 6): 2 列 grid + sticky sidebar
// 新增: 评论区 (3 角色) + 权限分层下载 (OPEN/MEMBER/EXCLUSIVE)
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Lock, Crown, Check, Eye, MessageCircle, Star, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { detectResourceLevel, canDownload, type UserSubscription } from '@/lib/moderation';
import { t } from '@/lib/i18n';
import { CommentSection, type CommentItem } from '@/components/CommentSection';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const r = await prisma.openSourceRelease.findUnique({
    where: { id },
    select: { id: true, title: true, description: true, originalAuthor: true, license: true },
  });
  if (!r) return { title: '开源资源未找到 - CProTrading' };
  return {
    title: `${r.title} - 开源合规再分发 - CProTrading`,
    description: (r.description ?? `${r.title} - ${r.originalAuthor}`).slice(0, 160),
    openGraph: { title: r.title, description: r.description ?? undefined, type: 'article' },
    alternates: { canonical: `/open-source/${id}` },
  };
}

export default async function OpenSourceDetail({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // 1) 主资源
  const release = await prisma.openSourceRelease.findUnique({ where: { id } });
  if (!release) notFound();

  // 2) 用户计划 (用 membership helper 推算)
  const userPlan: string | undefined = session?.user
    ? await getUserActivePlan(session.user.id)
    : undefined;

  // 3) 相关推荐 (同 license 4 个, 排除当前, 按下载数 desc)
  const related = await prisma.openSourceRelease.findMany({
    where: { id: { not: id }, license: release.license },
    orderBy: { downloadCount: 'desc' },
    take: 4,
    select: { id: true, title: true, license: true, tier: true, downloadCount: true, viewCount: true, requiredPlan: true, isFree: true },
  });

  // 4) 评论区
  const dbComments = await prisma.comment.findMany({
    where: { targetType: 'OPEN_SOURCE_RELEASE', targetId: id },
    orderBy: { createdAt: 'asc' },
  });

  // join User 拿到 authorName + role
  const authorIds = Array.from(new Set(dbComments.map(c => c.authorId)));
  const authors = authorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, username: true, role: true },
      })
    : [];
  const authorMap = new Map(authors.map(a => [a.id, a]));

  // 点赞统计 (每条评论的 likeCount) + 当前用户点赞状态
  const commentIds = dbComments.map(c => c.id);
  const [likeAgg, userLikes] = commentIds.length > 0
    ? await Promise.all([
        prisma.like.groupBy({
          by: ['targetId'],
          where: { targetType: 'COMMENT', targetId: { in: commentIds } },
          _count: { _all: true },
        }),
        session?.user?.id
          ? prisma.like.findMany({
              where: { targetType: 'COMMENT', targetId: { in: commentIds }, userId: session.user.id },
              select: { targetId: true },
            })
          : Promise.resolve([] as { targetId: string }[]),
      ])
    : [[], [] as { targetId: string }[]];
  const likeCountMap = new Map((likeAgg as any[]).map(l => [l.targetId, l._count._all]));
  const likedSet = new Set((userLikes as { targetId: string }[]).map(l => l.targetId));

  const comments: CommentItem[] = dbComments.map(c => {
    const a = authorMap.get(c.authorId);
    return {
      id: c.id,
      authorId: c.authorId,
      authorName: a?.username ?? '匿名会员',
      authorRole: a?.role,
      content: c.content,
      status: c.status as any,
      sensitiveWords: c.sensitiveWords,
      forwardCount: c.forwardCount,
      likeCount: likeCountMap.get(c.id) ?? 0,
      liked: likedSet.has(c.id),
      createdAt: c.createdAt.toISOString(),
      parentId: c.parentId,
    };
  });

  // 5) 当前用户角色
  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? session.user.username ?? '会员',
        role: (session.user.role as any) ?? 'MEMBER',
        isSubscriber: ['MONTHLY', 'YEARLY', 'LIFETIME'].includes(userPlan ?? ''),
      }
    : null;

  // 6) 权限判断
  const level = detectResourceLevel({ isFree: release.isFree, requiredPlan: release.requiredPlan });
  const download = canDownload({ isFree: release.isFree, requiredPlan: release.requiredPlan }, userPlan);
  const levelColor = level === 'OPEN' ? 'text-accent-up border-accent-up/30'
                  : level === 'MEMBER' ? 'text-accent-blue border-accent-blue/30'
                  : 'text-accent-gold border-accent-gold/30';
  const levelLabel = level === 'OPEN' ? '开放下载'
                  : level === 'MEMBER' ? '会员可下'
                  : '订阅专享';

  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 lg:py-8 max-w-[1920px] mx-auto">
        {/* 返回链接 */}
        <Link href="/content" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-purple mb-4">
          <ArrowLeft className="w-3 h-3" /> 返回大航海时代
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          {/* === 主区 === */}
          <article className="min-w-0">
            {/* 头部: 标签 + 标题 + 协议 + 描述 */}
            <header className="border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-[10px] text-accent-purple tracking-widest uppercase">开源合规再分发</span>
                <span className={`text-[10px] border px-1.5 py-0.5 rounded-full ${levelColor}`}>
                  {levelLabel}
                </span>
                <span className="text-[10px] text-text-muted border border-border px-1.5 py-0.5 rounded-full font-mono">
                  {t.license(release.license).short}
                </span>
                {release.tier && (
                  <span className="text-[10px] text-accent-gold border border-accent-gold/30 px-1.5 py-0.5 rounded-full">
                    {release.tier}
                  </span>
                )}
              </div>
              <h1 className="h1 mb-2">
                {release.title}
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed">
                {release.description}
              </p>
            </header>

            {/* 元数据 4 列 (协议/作者/下载/查看) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <MetaCard label="开源协议" value={t.license(release.license).full} />
              <MetaCard label="原作者" value={release.originalAuthor} />
              <MetaCard label="下载次数" value={release.downloadCount.toLocaleString()} accent />
              <MetaCard label="浏览次数" value={release.viewCount.toLocaleString()} />
            </div>

            {/* 正文 (原始内容, Markdown 渲染) */}
            <section className="border border-border p-5 bg-bg-secondary rounded text-sm text-text-secondary leading-relaxed">
              <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent-purple" />
                资源说明
              </h2>
              <p className="whitespace-pre-wrap mb-3">{release.description}</p>
              <div className="text-[10px] text-text-muted space-y-1 border-t border-border pt-3">
                <p>· 原始仓库: <a href={`https://${release.originalSource}`} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">{release.originalSource}</a></p>
                <p>· 双署名: 平台仅做技术中性的表达层包装, 不修改核心算法, 原作者版权保留</p>
                <p>· 再分发: 已下载者可按原始协议条款自由再分发</p>
                <p>· 合规声明: <Link href="/legal/gpl-notice" className="text-accent-blue hover:underline">详见免责声明</Link></p>
              </div>
            </section>

            {/* 评论区 */}
            <CommentSection
              targetType="OPEN_SOURCE_RELEASE"
              targetId={id}
              comments={comments}
              currentUser={currentUser}
            />
          </article>

          {/* === 右侧 sticky sidebar === */}
          <aside className="space-y-4">
            {/* 权限 + 下载 CTA */}
            <div className="sticky top-24 space-y-4">
              <div className="bg-bg-secondary border border-border rounded overflow-hidden">
                {/* 权限级别彩色带 */}
                <div className={`px-5 py-4 border-b border-border ${
                  level === 'OPEN' ? 'bg-accent-up/10' :
                  level === 'MEMBER' ? 'bg-accent-blue/10' :
                  'bg-accent-gold/10'
                }`}>
                  <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5">权限级别</div>
                  <div className="flex items-center gap-2">
                    {level === 'OPEN' && <Download className="w-4 h-4 text-accent-up" />}
                    {level === 'MEMBER' && <Check className="w-4 h-4 text-accent-blue" />}
                    {level === 'EXCLUSIVE' && <Crown className="w-4 h-4 text-accent-gold" />}
                    <span className="text-base font-bold text-text-primary">{levelLabel}</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* 提示 */}
                  <div className="text-xs text-text-secondary leading-relaxed">
                    {download.reason}
                  </div>

                  {/* 主 CTA */}
                  {download.can ? (
                    <a
                      href={release.fileUrl}
                      className="w-full py-3 rounded font-semibold
                        bg-accent text-bg-primary hover:bg-accent/90 transition-colors
                        flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {download.cta}
                    </a>
                  ) : (
                    <Link
                      href={currentUser ? '/membership' : '/login'}
                      className="w-full py-3 rounded font-semibold
                        bg-warning text-bg-primary hover:bg-warning/90 transition-colors
                        flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      {download.cta}
                    </Link>
                  )}

                  {/* 风险提示 */}
                  <div className="text-[10px] text-text-muted border-t border-border pt-3">
                    所有资源仅供策略学习与实盘参考, 投资有风险, 使用前请先在模拟盘充分测试。
                  </div>
                </div>
              </div>

              {/* 摘要信息 */}
              <div className="bg-bg-secondary border border-border p-4 rounded text-xs space-y-2">
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2">资源摘要</div>
                <div className="flex justify-between">
                  <span className="text-text-muted">发布时间</span>
                  <span className="text-text-primary num">
                    {release.publishedAt ? new Date(release.publishedAt).toLocaleDateString('zh-CN') : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">所需计划</span>
                  <span className="text-text-primary">{t.plan(release.requiredPlan).full}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">协议</span>
                  <span className="text-text-primary">{t.license(release.license).short}</span>
                </div>
                {release.originalFileUrl && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">原始文件</span>
                    <a href={release.originalFileUrl} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline text-[10px]">查看</a>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* 相关推荐 */}
        {related.length > 0 && (
          <section className="mt-12 pt-6 border-t border-border">
            <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-accent-gold" />
              相关推荐 · 同协议
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/open-source/${r.id}`}
                  className="block p-3 border border-border hover:border-accent-purple transition-colors rounded"
                >
                  <div className="text-[10px] text-accent-purple uppercase tracking-wider mb-1 font-mono">
                    {t.license(r.license).short}
                  </div>
                  <div className="text-sm font-semibold text-text-primary line-clamp-2 mb-1">
                    {r.title}
                  </div>
                  <div className="text-[10px] text-text-muted num flex items-center gap-2">
                    <span><Download className="w-2.5 h-2.5 inline" /> {r.downloadCount.toLocaleString()}</span>
                    <span><Eye className="w-2.5 h-2.5 inline" /> {r.viewCount.toLocaleString()}</span>
                    {r.isFree && <span className="text-accent-up">免费</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function MetaCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-border bg-bg-secondary px-3 py-2.5 rounded">
      <div className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">{label}</div>
      <div className={`text-sm font-semibold num ${accent ? 'text-accent-purple' : 'text-text-primary'}`}>
        {value}
      </div>
    </div>
  );
}

/// 获取用户当前活跃订阅计划 (从 Membership 表)
async function getUserActivePlan(userId: string): Promise<string | undefined> {
  try {
    const m = await prisma.membership.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: { plan: true },
    });
    return m?.plan;
  } catch {
    return undefined;
  }
}
