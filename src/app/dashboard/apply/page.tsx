// /dashboard/apply/page.tsx — 申请版主/管理员 (v22.0 Phase 7.24 Batch 8+)
// PM 决策 (v3 终态):
//   - 版主: 2 名, 高门槛 5 选 1 (文章 20 / 评论 100 / 获赞 200 / 原创 5 / 管理经验 90天)
//   - 管理员: 4 名, 低门槛 3 选 1 (文章 3 / 评论 15 / 获赞 30)
//   - 活跃订阅 (>= MONTHLY) 是基础门槛
//   - 已经有 PENDING 申请不能再提交

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Crown, Check, X, Clock, ChevronRight } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  MODERATOR_APPLICATION_THRESHOLDS,
  ADMIN_APPLICATION_THRESHOLDS,
  ROLE_LIMITS,
  checkApplicationEligibility,
  detectUserSubscription,
  type UserStats,
} from '@/lib/moderation';
import { ApplyForm } from './ApplyForm';

export const dynamic = 'force-dynamic';

export default async function ApplyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?redirect=/dashboard/apply');
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, role: true, createdAt: true },
  });
  if (!me) redirect('/login');

  // 已任命直接跳到 dashboard
  if (me.role === 'ADMIN' || me.role === 'MODERATOR') {
    redirect('/dashboard/moderation');
  }

  // 查用户统计
  const [articleCount, commentCount, commentIds, membership, originalCount, adminHistory] = await Promise.all([
    prisma.article.count({ where: { authorId: session.user.id, status: 'PUBLISHED' } }),
    prisma.comment.count({ where: { authorId: session.user.id, status: 'PUBLISHED' } }),
    prisma.comment.findMany({
      where: { authorId: session.user.id },
      select: { id: true },
    }),
    prisma.membership.findFirst({
      where: { userId: session.user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: { plan: true },
    }),
    prisma.article.count({
      where: { authorId: session.user.id, type: 'OPEN_SOURCE', status: 'PUBLISHED' },
    }),
    prisma.promotionLog.findFirst({
      where: { userId: session.user.id, toRole: 'ADMIN' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const likeCount = commentIds.length > 0
    ? await prisma.like.count({
        where: { targetType: 'COMMENT', targetId: { in: commentIds.map(c => c.id) } },
      })
    : 0;
  const adminDays = adminHistory
    ? Math.floor((Date.now() - adminHistory.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const userPlan = membership?.plan;
  const hasActiveSubscription = detectUserSubscription(userPlan) === 'SUBSCRIBED';

  // 资格判断
  const stats: UserStats = { articleCount, commentCount, likeCount, originalCount, adminDays };
  const modEligibility = checkApplicationEligibility('MODERATOR', stats, hasActiveSubscription);
  const admEligibility = checkApplicationEligibility('ADMIN', stats, hasActiveSubscription);

  // 申请历史
  const history = await prisma.moderatorApplication.findMany({
    where: { applicantId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // 当前角色统计
  const [modCount, admCount] = await Promise.all([
    prisma.user.count({ where: { role: 'MODERATOR' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ]);

  // 当前 PENDING 申请
  const pending = history.find(h => h.status === 'PENDING');

  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 lg:py-8 max-w-[1920px] mx-auto">
        {/* 返回链接 */}
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-purple mb-4">
          <ArrowLeft className="w-3 h-3" /> 返回用户中心
        </Link>

        {/* 头部: 标签 + 主标 + 描述 */}
        <header className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[10px] text-accent-purple tracking-widest uppercase">社区贡献 · 角色申请</span>
            <span className="text-[10px] text-text-muted border border-border px-1.5 py-0.5 rounded-full num">
              版主 {modCount}/{ROLE_LIMITS.MODERATOR} · 管理员 {admCount}/{ROLE_LIMITS.ADMIN}
            </span>
          </div>
          <h1 className="h1 mb-2">
            申请版主 / 管理员
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            活跃订阅是基础门槛, 满足数据门槛可申请。版主全局 2 名 (高门槛 5 选 1), 管理员全局 4 名 (低门槛 3 选 1)。已任命也可由版主 / 管理员直接提名。
          </p>
        </header>

        {/* 当前订阅状态 */}
        <div className={`mb-6 p-4 border rounded ${
          hasActiveSubscription
            ? 'border-accent-up/30 bg-accent-up/5'
            : 'border-warning/30 bg-warning/5'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            {hasActiveSubscription ? (
              <Check className="w-4 h-4 text-accent-up" />
            ) : (
              <X className="w-4 h-4 text-warning" />
            )}
            <span className="font-semibold text-text-primary">
              {hasActiveSubscription
                ? `活跃订阅: ${userPlan === 'MONTHLY' ? '月度' : userPlan === 'ANNUAL' ? '年度' : '终身'}`
                : '未订阅或订阅已过期'}
            </span>
          </div>
          {!hasActiveSubscription && (
            <div className="mt-2 text-xs text-text-secondary">
              <Link href="/membership" className="text-accent-purple hover:underline">
                前往订阅 →
              </Link>
            </div>
          )}
        </div>

        {/* PENDING 申请提示 */}
        {pending && (
          <div className="mb-6 p-4 border border-accent-blue/30 bg-accent-blue/5 rounded">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Clock className="w-4 h-4 text-accent-blue" />
              你已有{pending.applyingFor === 'MODERATOR' ? '版主' : '管理员'}申请待审批
            </div>
            <div className="mt-1 text-xs text-text-muted">
              提交于 {new Date(pending.createdAt).toLocaleString('zh-CN')} · 审批中
            </div>
          </div>
        )}

        {/* 双 tab 申请区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ApplyCard
            role="MODERATOR"
            title="申请版主"
            icon={<Shield className="w-4 h-4 text-accent-purple" />}
            thresholds={MODERATOR_APPLICATION_THRESHOLDS}
            eligibility={modEligibility}
            stats={stats}
            hasActiveSubscription={hasActiveSubscription}
            isPending={pending?.applyingFor === 'MODERATOR'}
          />
          <ApplyCard
            role="ADMIN"
            title="申请管理员"
            icon={<Crown className="w-4 h-4 text-accent-gold" />}
            thresholds={ADMIN_APPLICATION_THRESHOLDS}
            eligibility={admEligibility}
            stats={stats}
            hasActiveSubscription={hasActiveSubscription}
            isPending={pending?.applyingFor === 'ADMIN'}
          />
        </div>

        {/* 申请表单 */}
        {!pending && (
          <ApplyForm
            modEligible={modEligibility.canApply}
            admEligible={admEligibility.canApply}
          />
        )}

        {/* 申请历史 */}
        {history.length > 0 && (
          <section className="mt-8 pt-6 border-t border-border">
            <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              申请历史
            </h2>
            <ul className="space-y-2">
              {history.map(h => (
                <li
                  key={h.id}
                  className={`p-3 border rounded text-xs flex items-center gap-3 ${
                    h.status === 'PENDING' ? 'border-accent-blue/30 bg-accent-blue/5' :
                    h.status === 'APPROVED' ? 'border-accent-up/30 bg-accent-up/5' :
                    'border-border bg-bg-secondary'
                  }`}
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    h.status === 'PENDING' ? 'bg-accent-blue/20 text-accent-blue' :
                    h.status === 'APPROVED' ? 'bg-accent-up/20 text-accent-up' :
                    'bg-text-muted/20 text-text-muted'
                  }`}>
                    {h.status === 'PENDING' ? '审批中' : h.status === 'APPROVED' ? '已通过' : '已拒绝'}
                  </span>
                  <span className="font-semibold text-text-primary">
                    {h.applyingFor === 'MODERATOR' ? '版主' : '管理员'}
                  </span>
                  <span className="text-text-muted num">
                    {new Date(h.createdAt).toLocaleString('zh-CN', { hour12: false })}
                  </span>
                  {h.reviewNote && (
                    <span className="text-text-muted ml-auto truncate max-w-xs">
                      {h.reviewNote}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function ApplyCard({
  role, title, icon, thresholds, eligibility, stats, hasActiveSubscription, isPending,
}: {
  role: 'MODERATOR' | 'ADMIN';
  title: string;
  icon: React.ReactNode;
  thresholds: any;
  eligibility: any;
  stats: UserStats;
  hasActiveSubscription: boolean;
  isPending: boolean;
}) {
  const isMod = role === 'MODERATOR';
  const colorClass = isMod ? 'accent-purple' : 'accent-gold';

  return (
    <div className={`border border-border bg-bg-secondary rounded overflow-hidden`}>
      {/* 头部 */}
      <div className={`px-4 py-3 border-b border-border ${
        isMod ? 'bg-accent-purple/5' : 'bg-accent-gold/5'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-base font-semibold text-text-primary">{title}</span>
          <span className={`text-[10px] text-${colorClass} ml-auto`}>
            {isMod ? '高门槛 · 5 选 1' : '低门槛 · 3 选 1'}
          </span>
        </div>
        <div className="text-[10px] text-text-muted">
          {isMod ? '版主全局 2 名' : '管理员全局 4 名'} · 控评 / 任命 / 系统设置
        </div>
      </div>

      {/* 门槛进度 */}
      <div className="p-4 space-y-2.5">
        <ThresholdRow label="发布文章" current={stats.articleCount} required={thresholds.articleCount} />
        <ThresholdRow label="评论数" current={stats.commentCount} required={thresholds.commentCount} />
        <ThresholdRow label="获赞数" current={stats.likeCount} required={thresholds.likeCount} />
        {isMod && (
          <>
            <ThresholdRow label="原创贡献" current={stats.originalCount ?? 0} required={thresholds.originalCount} />
            <ThresholdRow label="管理员经验" current={stats.adminDays ?? 0} required={thresholds.adminDays} suffix="天" />
          </>
        )}
      </div>

      {/* 状态 */}
      <div className="px-4 py-3 border-t border-border text-xs">
        {isPending ? (
          <div className="text-accent-blue">⏳ 已有该角色申请待审批</div>
        ) : !hasActiveSubscription ? (
          <div className="text-warning">⚠️ 需先开通月度或更高订阅</div>
        ) : eligibility.canApply ? (
          <div className="text-accent-up">✓ 已达标, 可申请</div>
        ) : (
          <div className="text-text-muted">{eligibility.reason}</div>
        )}
      </div>
    </div>
  );
}

function ThresholdRow({
  label, current, required, suffix = '',
}: { label: string; current: number; required: number; suffix?: string }) {
  const met = current >= required;
  const pct = Math.min(100, Math.round((current / required) * 100));
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className={`num ${met ? 'text-accent-up' : 'text-text-muted'}`}>
          {current}{suffix} / {required}{suffix}
        </span>
      </div>
      <div className="h-1 bg-bg-primary rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${met ? 'bg-accent-up' : 'bg-text-muted/30'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
