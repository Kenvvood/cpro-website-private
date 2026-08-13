// /articles/[slug]/page.tsx — 文章详情页 (v22.0 Phase 7.24 Batch 9)
// 仿 /open-source/[id] 风格 (2 列 grid + sticky sidebar + 评论区)
// 区别: 文章无下载, 不分 OPEN/MEMBER/EXCLUSIVE (PURE type), 仅展示内容
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Eye, MessageCircle, Star, Lock } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CommentSection, type CommentItem } from '@/components/CommentSection';
import { BRAND } from '@/config/brand';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, summary: true, authorId: true, publishedAt: true, type: true, viewCount: true },
  });
  if (!a) return { title: '文章未找到 - CProTrading' };
  const desc = (a.summary ?? a.title).slice(0, 160);
  const ogImage = `${BRAND.domain}/og-image.png`;
  return {
    title: `${a.title} - ${BRAND.name.short} 文章`,
    description: desc,
    keywords: ['CProTrading', 'MTT', '城诺科技', '量化交易', 'XAUUSD', '黄金', 'MQL5', 'EA', '套利', a.type === 'OPEN_SOURCE' ? '源码解读' : '纯文章'],
    authors: [{ name: '山治廿一 · CProTrading 城诺科技' }],
    openGraph: {
      title: a.title,
      description: desc,
      type: 'article',
      url: `${BRAND.domain}/articles/${slug}`,
      siteName: BRAND.name.zh,
      locale: 'zh_CN',
      images: [{ url: ogImage, width: 1200, height: 630, alt: a.title }],
      publishedTime: a.publishedAt?.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: a.title,
      description: desc,
      images: [ogImage],
    },
    alternates: { canonical: `${BRAND.domain}/articles/${slug}` },
  };
}

export default async function ArticleDetail({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  // 1) 主文章
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) notFound();

  // 2) 作者
  const author = await prisma.user.findUnique({
    where: { id: article.authorId },
    select: { id: true, username: true, role: true },
  });

  // 3) 自增 view
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  // 4) 评论区 (targetType='ARTICLE', targetId=article.id)
  const dbComments = await prisma.comment.findMany({
    where: { targetType: 'ARTICLE', targetId: article.id },
    orderBy: { createdAt: 'asc' },
  });
  const authorIds = Array.from(new Set(dbComments.map(c => c.authorId)));
  const commentAuthors = authorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, username: true, role: true },
      })
    : [];
  const commentAuthorMap = new Map(commentAuthors.map(a => [a.id, a]));

  // 点赞
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
    const a = commentAuthorMap.get(c.authorId);
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

  // 5) 当前用户
  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? session.user.username ?? '会员',
        role: (session.user.role as any) ?? 'MEMBER',
        isSubscriber: false,
      }
    : null;

  // 6) 相关文章 (同 author 4 个, 排除当前)
  const related = await prisma.article.findMany({
    where: {
      slug: { not: slug },
      authorId: article.authorId,
      status: 'PUBLISHED',
    },
    orderBy: { publishedAt: 'desc' },
    take: 4,
    select: { slug: true, title: true, summary: true, publishedAt: true, viewCount: true },
  });

  // 7) JSON-LD Article schema (Google Rich Results / Baidu 站平台 / 微信小程序)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary ?? article.title.slice(0, 160),
    image: [`https://${BRAND.domain}/og-image.png`],
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: author?.username ?? '山治廿一',
      url: `https://${BRAND.domain}/content`,
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND.name.zh,
      logo: { '@type': 'ImageObject', url: `https://${BRAND.domain}/logo.png` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://${BRAND.domain}/articles/${slug}`,
    },
    articleSection: article.type === 'OPEN_SOURCE' ? '源码解读' : '纯文章',
    keywords: 'CProTrading, MTT, 量化交易, XAUUSD, 黄金, MQL5, EA, 套利',
    wordCount: article.content.length,
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      {/* JSON-LD 结构化数据 (Google/Baidu 搜索增强) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 lg:py-8 max-w-[1920px] mx-auto">
        {/* 返回 */}
        <Link href="/content" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-purple mb-4">
          <ArrowLeft className="w-3 h-3" /> 返回大航海时代
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          {/* === 主区 === */}
          <article className="min-w-0">
            {/* 头部 */}
            <header className="border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-[10px] text-accent-purple tracking-widest uppercase">CProTrading 文章</span>
                <span className="text-[10px] text-text-muted border border-border px-1.5 py-0.5 rounded-full">
                  {article.type === 'OPEN_SOURCE' ? '源码文章' : '纯文章'}
                </span>
                {article.type === 'OPEN_SOURCE' && article.license && (
                  <span className="text-[10px] text-text-muted border border-border px-1.5 py-0.5 rounded-full font-mono">
                    {article.license}
                  </span>
                )}
              </div>
              <h1 className="h1 mb-2">
                {article.title}
              </h1>
              {article.summary && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {article.summary}
                </p>
              )}
            </header>

            {/* 元数据 4 列 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <MetaCard label="作者" value={author?.username ?? '匿名'} />
              <MetaCard label="发布时间" value={article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('zh-CN') : '—'} />
              <MetaCard label="浏览次数" value={article.viewCount.toLocaleString()} accent />
              <MetaCard label="评论数" value={String(comments.length)} />
            </div>

            {/* 正文 (Markdown 渲染) */}
            <section className="border border-border p-5 bg-bg-secondary rounded text-sm text-text-secondary leading-relaxed prose-content">
              <MarkdownView content={article.content} />
            </section>

            {/* 评论区 */}
            <CommentSection
              targetType="ARTICLE"
              targetId={article.id}
              comments={comments}
              currentUser={currentUser}
            />
          </article>

          {/* === 右侧 sticky === */}
          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              {/* 作者卡 */}
              <div className="bg-bg-secondary border border-border p-4 rounded text-sm space-y-2">
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2">关于作者</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center text-xs font-semibold">
                    {(author?.username ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="font-semibold text-text-primary">{author?.username ?? '匿名'}</div>
                </div>
                <div className="text-[10px] text-text-muted">
                  CProTrading 社区会员 · {author?.role === 'ADMIN' ? '管理员' : author?.role === 'MODERATOR' ? '版主' : '订阅会员'}
                </div>
              </div>

              {/* 摘要 */}
              <div className="bg-bg-secondary border border-border p-4 rounded text-xs space-y-2">
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2">文章摘要</div>
                <div className="flex justify-between">
                  <span className="text-text-muted">类型</span>
                  <span className="text-text-primary">{article.type === 'OPEN_SOURCE' ? '源码文章' : '纯文章'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">发布时间</span>
                  <span className="text-text-primary num">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('zh-CN') : '—'}
                  </span>
                </div>
                {article.type === 'OPEN_SOURCE' && article.license && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">协议</span>
                    <span className="text-text-primary font-mono">{article.license}</span>
                  </div>
                )}
              </div>

              {/* 相关推荐 */}
              {related.length > 0 && (
                <div className="bg-bg-secondary border border-border p-4 rounded text-xs space-y-2">
                  <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2">同作者更多</div>
                  {related.map(r => (
                    <Link
                      key={r.slug}
                      href={`/articles/${r.slug}`}
                      className="block p-2 border border-border rounded hover:border-accent-purple transition-colors"
                    >
                      <div className="text-sm font-semibold text-text-primary line-clamp-2 mb-1">{r.title}</div>
                      <div className="text-[10px] text-text-muted num flex items-center gap-2">
                        <span><Eye className="w-2.5 h-2.5 inline" /> {r.viewCount}</span>
                        {r.publishedAt && <span><Calendar className="w-2.5 h-2.5 inline" /> {new Date(r.publishedAt).toLocaleDateString('zh-CN')}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
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

/// 极简 Markdown 渲染 (仿 tutorials)
function MarkdownView({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-0 mb-4 text-text-primary">{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold mt-6 mb-3 pb-2 border-b border-border text-text-primary">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mt-4 mb-2 text-text-primary">{line.slice(4)}</h3>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 list-disc text-sm leading-relaxed">{line.slice(2)}</li>;
        if (line.trim() === '') return null;
        if (line.trim() === '---') return <hr key={i} className="my-4 border-border" />;
        return <p key={i} className="text-sm leading-relaxed mb-3">{line}</p>;
      })}
    </div>
  );
}
