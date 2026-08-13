// /open-source/new/page.tsx — 源码文章发布页 (v22.0 Phase 7.24 Batch 9)
// 跟 /articles/new 类似, 但专门发 OPEN_SOURCE 文章
// 强制 fileUrl + license + 双重署名, 自动审核
// 订阅会员 (>= MONTHLY) 或 版主/管理员
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Send, AlertTriangle } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { detectUserSubscription } from '@/lib/moderation';
import { OpenSourceForm } from './OpenSourceForm';

export const dynamic = 'force-dynamic';

export default async function NewOpenSourcePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?redirect=/open-source/new');
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: { plan: true },
  });
  const hasActiveSubscription = detectUserSubscription(membership?.plan) === 'SUBSCRIBED';

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
            <h1 className="h1 mb-2">发布源码需订阅会员</h1>
            <p className="text-sm text-text-secondary mb-4">
              源码发布需要月度或更高订阅, 享受双重署名 + 协议合规 + 社区曝光。
            </p>
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
        <Link href="/open-source" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-purple mb-4">
          <ArrowLeft className="w-3 h-3" /> 返回开源资源
        </Link>

        <header className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[10px] text-accent-purple tracking-widest uppercase">社区贡献 · 发布源码</span>
            <span className="text-[10px] text-accent-up border border-accent-up/30 px-1.5 py-0.5 rounded-full">
              {hasActiveSubscription ? '活跃订阅' : '版主/管理员'}
            </span>
          </div>
          <h1 className="h1 mb-2">
            发布开源资源
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            必须填写源码下载链接 + 双重署名 (原作者 + 原始仓库) + 协议。自动审核通过后即公开, 失败会给出原因。
          </p>
        </header>

        <OpenSourceForm />
      </main>
    </div>
  );
}
