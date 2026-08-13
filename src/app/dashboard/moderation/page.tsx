// /dashboard/moderation/page.tsx — 控评中心 (v22.0 Phase 7.24 Batch 8+)
// PM 决策 (v3 终态):
//   - 版主 2 名 / 管理员 4 名 全局上限
//   - 申请审批 (PENDING list + 通过/拒绝)
//   - 角色统计 + 任命操作 (版主/管理员列表 + 弹窗任命)
//   - 控评快捷入口 (隐式: 评论区 inline 操作在各详情页)

import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Shield, Crown, Check, X, Clock, UserPlus, Users, ChevronRight,
} from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ROLE_LIMITS } from '@/lib/moderation';
import { PromotionForm } from './PromotionForm';
import { ReviewActions } from './ReviewActions';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?redirect=/dashboard/moderation');
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, role: true },
  });
  if (!me) redirect('/login');

  // 必须是版主/管理员
  if (me.role !== 'MODERATOR' && me.role !== 'ADMIN') {
    redirect('/dashboard/apply');
  }

  // 当前角色统计
  const [modCount, admCount] = await Promise.all([
    prisma.user.count({ where: { role: 'MODERATOR' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ]);

  // PENDING 申请
  const pendingApps = await prisma.moderatorApplication.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  // 申请人信息
  const applicantIds = Array.from(new Set(pendingApps.map(a => a.applicantId)));
  const applicants = applicantIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: applicantIds } },
        select: { id: true, username: true, role: true, createdAt: true },
      })
    : [];
  const applicantMap = new Map(applicants.map(u => [u.id, u]));

  // 全部版主/管理员
  const allStaff = await prisma.user.findMany({
    where: { role: { in: ['MODERATOR', 'ADMIN'] } },
    select: { id: true, username: true, role: true, createdAt: true, totalSpent: true },
    orderBy: { createdAt: 'asc' },
  });

  // 任命历史
  const recentPromotions = await prisma.promotionLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  const promoterIds = Array.from(new Set([
    ...recentPromotions.map(p => p.promotedById),
    ...recentPromotions.map(p => p.userId),
  ]));
  const promoterUsers = promoterIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: promoterIds } },
        select: { id: true, username: true },
      })
    : [];
  const promoterMap = new Map(promoterUsers.map(u => [u.id, u]));

  // 待审批申请是否还能通过 (检查上限)
  const canApproveMod = modCount < ROLE_LIMITS.MODERATOR;
  const canApproveAdm = admCount < ROLE_LIMITS.ADMIN;

  // 候选被任命人 (普通用户, 排除已是版主/管理员)
  const candidates = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 lg:py-8 max-w-[1920px] mx-auto">
        {/* 返回链接 */}
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-purple mb-4">
          <ArrowLeft className="w-3 h-3" /> 返回用户中心
        </Link>

        {/* 头部 */}
        <header className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[10px] text-accent-purple tracking-widest uppercase">社区管理 · 控评中心</span>
            <span className="text-[10px] text-accent-gold border border-accent-gold/30 px-1.5 py-0.5 rounded-full">
              {me.role === 'ADMIN' ? '管理员' : '版主'}
            </span>
          </div>
          <h1 className="h1 mb-2">
            控评中心
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            申请审批 · 角色任命 · 角色统计。版主全局 {ROLE_LIMITS.MODERATOR} 名 / 管理员全局 {ROLE_LIMITS.ADMIN} 名。
          </p>
        </header>

        {/* 角色统计卡片 (2 列) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <RoleStatCard
            role="MODERATOR"
            title="版主"
            current={modCount}
            limit={ROLE_LIMITS.MODERATOR}
            icon={<Shield className="w-4 h-4 text-accent-purple" />}
            colorClass="accent-purple"
          />
          <RoleStatCard
            role="ADMIN"
            title="管理员"
            current={admCount}
            limit={ROLE_LIMITS.ADMIN}
            icon={<Crown className="w-4 h-4 text-accent-gold" />}
            colorClass="accent-gold"
          />
        </div>

        {/* 待审批申请 */}
        <section className="mb-6">
          <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-blue" />
            待审批申请
            <span className="text-xs text-text-muted num ml-1">
              {pendingApps.length} 条
            </span>
          </h2>
          {pendingApps.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted border border-dashed border-border rounded">
              暂无待审批申请
            </div>
          ) : (
            <ul className="space-y-2">
              {pendingApps.map(a => {
                const u = applicantMap.get(a.applicantId);
                const isMod = a.applyingFor === 'MODERATOR';
                const colorClass = isMod ? 'accent-purple' : 'accent-gold';
                const canApprove = isMod ? canApproveMod : canApproveAdm;
                return (
                  <li
                    key={a.id}
                    className={`p-3 border rounded ${
                      canApprove
                        ? 'border-border bg-bg-secondary'
                        : 'border-warning/30 bg-warning/5'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-wrap">
                      {/* 申请人 */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-full bg-${colorClass}/20 text-${colorClass} flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
                          {(u?.username ?? '匿').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            {u?.username ?? '匿名'}
                            <span className={`text-[10px] text-${colorClass}`}>
                              申请{isMod ? '版主' : '管理员'}
                            </span>
                          </div>
                          <div className="text-[10px] text-text-muted num">
                            注册 {u ? new Date(u.createdAt).toLocaleDateString('zh-CN') : '—'} · 提交 {new Date(a.createdAt).toLocaleString('zh-CN', { hour12: false })}
                          </div>
                        </div>
                      </div>

                      {/* 数据 */}
                      <div className="flex flex-wrap gap-2 text-[10px] text-text-muted">
                        <Stat label="文章" value={a.articleCount} />
                        <Stat label="评论" value={a.commentCount} />
                        <Stat label="获赞" value={a.likeCount} />
                      </div>

                      {/* 理由 */}
                      {a.reason && (
                        <div className="flex-1 min-w-[200px] text-xs text-text-secondary italic border-l-2 border-border pl-2">
                          "{a.reason}"
                        </div>
                      )}

                      {/* 操作 */}
                      <ReviewActions
                        applicationId={a.id}
                        canApprove={canApprove}
                        disableReason={!canApprove
                          ? `${isMod ? '版主' : '管理员'}已满 (${isMod ? modCount : admCount}/${isMod ? ROLE_LIMITS.MODERATOR : ROLE_LIMITS.ADMIN})`
                          : null
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 任命操作 (版主/管理员可以任命版主, 管理员可以任命版主+管理员) */}
        {me.role === 'ADMIN' || me.role === 'MODERATOR' ? (
          <section className="mb-6">
            <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-accent-purple" />
              直接任命
            </h2>
            <PromotionForm
              canPromoteMod={modCount < ROLE_LIMITS.MODERATOR}
              canPromoteAdm={admCount < ROLE_LIMITS.ADMIN}
              modCount={modCount}
              admCount={admCount}
              modLimit={ROLE_LIMITS.MODERATOR}
              admLimit={ROLE_LIMITS.ADMIN}
              candidates={candidates}
              operatorRole={me.role}
            />
          </section>
        ) : null}

        {/* 当前团队 */}
        <section className="mb-6">
          <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-text-muted" />
            当前团队
            <span className="text-xs text-text-muted num ml-1">
              {allStaff.length} 人
            </span>
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {allStaff.map(u => (
              <li
                key={u.id}
                className={`p-3 border rounded text-xs flex items-center gap-2 ${
                  u.role === 'ADMIN'
                    ? 'border-accent-gold/30 bg-accent-gold/5'
                    : 'border-accent-purple/30 bg-accent-purple/5'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  u.role === 'ADMIN'
                    ? 'bg-accent-gold/20 text-accent-gold'
                    : 'bg-accent-purple/20 text-accent-purple'
                }`}>
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text-primary truncate">{u.username}</div>
                  <div className="text-[10px] text-text-muted num">
                    {u.role === 'ADMIN' ? '管理员' : '版主'} · {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 任命历史 */}
        {recentPromotions.length > 0 && (
          <section className="pt-6 border-t border-border">
            <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              任命历史
            </h2>
            <ul className="space-y-2">
              {recentPromotions.map(p => {
                const target = promoterMap.get(p.userId);
                const promoter = promoterMap.get(p.promotedById);
                return (
                  <li
                    key={p.id}
                    className="p-2.5 border border-border bg-bg-secondary rounded text-xs flex items-center gap-2 flex-wrap"
                  >
                    <span className="text-text-muted">{promoter?.username ?? '?'}</span>
                    <span className="text-text-muted">→</span>
                    <span className="font-semibold text-text-primary">{target?.username ?? '?'}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      p.toRole === 'ADMIN'
                        ? 'bg-accent-gold/20 text-accent-gold'
                        : 'bg-accent-purple/20 text-accent-purple'
                    }`}>
                      {p.toRole === 'ADMIN' ? '管理员' : '版主'}
                    </span>
                    <span className="text-text-muted italic truncate max-w-md" title={p.reason}>
                      "{p.reason}"
                    </span>
                    <span className="text-text-muted num ml-auto">
                      {new Date(p.createdAt).toLocaleString('zh-CN', { hour12: false })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function RoleStatCard({
  role, title, current, limit, icon, colorClass,
}: {
  role: 'MODERATOR' | 'ADMIN';
  title: string;
  current: number;
  limit: number;
  icon: React.ReactNode;
  colorClass: string;
}) {
  const pct = Math.round((current / limit) * 100);
  return (
    <div className="border border-border bg-bg-secondary rounded overflow-hidden">
      <div className={`px-4 py-3 border-b border-border bg-${colorClass}/5`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          <span className={`text-[10px] text-${colorClass} ml-auto num`}>
            {current} / {limit}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all ${current >= limit ? 'bg-warning' : `bg-${colorClass}`}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] text-text-muted">
          {current >= limit ? '⚠ 已达上限' : `还可任命 ${limit - current} 名`}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="px-1.5 py-0.5 bg-bg-primary rounded text-text-secondary">
      {label} <span className="text-text-primary font-semibold num">{value}</span>
    </span>
  );
}
