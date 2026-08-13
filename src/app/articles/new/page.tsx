// /articles/new/page.tsx — 文章发布页 (v22.0 Phase 7.24 Batch 9)
// 订阅会员 (>= MONTHLY) 才能发布
// 两种 type: PURE 纯文章 / OPEN_SOURCE 源码文章
// OPEN_SOURCE 强制 fileUrl + license + originalAuthor + originalSource
// 自动审核 (字数/标题/摘要/fileUrl 合法性) → APPROVED 直接发布, REJECTED 提示原因
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Send, AlertTriangle } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { detectUserSubscription } from '@/lib/moderation';
import { ArticleEditor } from './ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?redirect=/articles/new');
  }

  // 查活跃订阅
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: { plan: true },
  });
  const hasActiveSubscription = detectUserSubscription(membership?.plan) === 'SUBSCRIBED';

  // 版主/管理员也能发布 (roleLevel >= 50)
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isStaff = me && (me.role === 'MODERATOR' || me.role === 'ADMIN');
  const canPublish = hasActiveSubscription || isStaff;

  if (!canPublish) {
    return (
      <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
        <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 lg:py-8 max-w-[1920px] mx-auto">
          <Link href="/content" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-purple mb-4">
            <ArrowLeft className="w-3 h-3" /> 返回大航海时代
          </Link>

          <div className="max-w-2xl mx-auto p-8 border border-warning/30 bg-warning/5 rounded text-center">
            <Lock className="w-12 h-12 mx-auto text-warning mb-3" />
            <h1 className="h1 mb-2">发布文章需订阅会员</h1>
            <p className="text-sm text-text-secondary mb-4">
              发布文章到 CProTrading 社区需要月度或更高订阅。订阅后可发布纯文章 / 源码文章, 累计原创贡献。
            </p>
            <div className="text-xs text-text-muted mb-4">
              ✓ 月度订阅可发布 · ✓ 享有版权保护 · ✓ 计入管理员申请门槛 (原创贡献)
            </div>
            <Link
              href="/membership"
              className="inline-block px-6 py-2.5 rounded bg-accent text-bg-primary font-semibold hover:bg-accent/90 transition-colors"
            >
              前往订阅
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 lg:py-8 max-w-[1920px] mx-auto">
        {/* 返回 */}
        <Link href="/content" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-purple mb-4">
          <ArrowLeft className="w-3 h-3" /> 返回大航海时代
        </Link>

        {/* 头部 */}
        <header className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[10px] text-accent-purple tracking-widest uppercase">社区贡献 · 发布文章</span>
            <span className="text-[10px] text-accent-up border border-accent-up/30 px-1.5 py-0.5 rounded-full">
              {hasActiveSubscription ? '活跃订阅' : isStaff ? '版主/管理员' : '订阅会员'}
            </span>
          </div>
          <h1 className="h1 mb-2">
            发布文章
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            纯文章 (PURE) 自由创作; 源码文章 (OPEN_SOURCE) 必须上传源码, 双重署名 + 协议合规。自动审核标题/摘要/正文/必填项, 通过后即发布, 失败会给出原因。
          </p>
        </header>

        <ArticleEditor />
      </main>
    </div>
  );
}
