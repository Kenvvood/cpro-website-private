// /api/moderator-applications/route.ts — 版主/管理员申请 (v22.0 Phase 7.24 Batch 8+)
// PM 决策 (2026-08-11 v3 终态):
//   - 不分子板块, 统一管理
//   - 版主申请: 高门槛 5 选 1 (文章 20 / 评论 100 / 获赞 200 / 原创 5 / 管理经验 90天)
//   - 管理员申请: 低门槛 3 选 1 (文章 3 / 评论 15 / 获赞 30)
//   - 上限: 版主 2 名, 管理员 4 名
//   - 一个用户同时只能有 1 个 PENDING 申请
//   - 通过申请后 User.role 自动更新

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  checkApplicationEligibility,
  detectUserSubscription,
  type UserStats,
} from '@/lib/moderation';

/// POST: 提交申请
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const body = await req.json();
  const applyingFor = body.applyingFor as 'MODERATOR' | 'ADMIN';
  const reason = (body.reason as string | undefined)?.trim().slice(0, 500);

  if (!applyingFor || (applyingFor !== 'MODERATOR' && applyingFor !== 'ADMIN')) {
    return NextResponse.json({ error: '请选择申请类型' }, { status: 400 });
  }

  // 已经是版主/管理员, 不能再申请
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!me) return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  if (me.role === 'ADMIN' || me.role === 'MODERATOR') {
    return NextResponse.json({ error: '你已经是' + (me.role === 'ADMIN' ? '管理员' : '版主') }, { status: 400 });
  }

  // 检查是否已有 PENDING 申请
  const existing = await prisma.moderatorApplication.findFirst({
    where: {
      applicantId: session.user.id,
      status: 'PENDING',
    },
  });
  if (existing) {
    return NextResponse.json({ error: '你已有待审批的申请, 请耐心等待' }, { status: 400 });
  }

  // 查用户统计
  const [articleCount, commentCount, commentIds, membership] = await Promise.all([
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
  ]);

  // 获赞数
  const likeCount = commentIds.length > 0
    ? await prisma.like.count({
        where: {
          targetType: 'COMMENT',
          targetId: { in: commentIds.map(c => c.id) },
        },
      })
    : 0;

  // 原创贡献: 发的 release 数量 (用 openSourceRelease 替代 Product, 因为 Product 没 authorId)
  // 简化: 查 Article OPEN_SOURCE type 数 (发过源码文章 = 原创贡献)
  const originalCount = await prisma.article.count({
    where: { authorId: session.user.id, type: 'OPEN_SOURCE', status: 'PUBLISHED' },
  });

  // 管理员经验: 查 PromotionLog, 之前 role=ADMIN 持续天数
  const adminHistory = await prisma.promotionLog.findFirst({
    where: { userId: session.user.id, toRole: 'ADMIN' },
    orderBy: { createdAt: 'desc' },
  });
  const adminDays = adminHistory
    ? Math.floor((Date.now() - adminHistory.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const userPlan = membership?.plan;
  const userSub = detectUserSubscription(userPlan);
  const hasActiveSubscription = userSub === 'SUBSCRIBED';

  // 资格判断
  const eligibility = checkApplicationEligibility(
    applyingFor,
    { articleCount, commentCount, likeCount, originalCount, adminDays } as UserStats,
    hasActiveSubscription
  );

  if (!eligibility.canApply) {
    return NextResponse.json({ error: eligibility.reason }, { status: 400 });
  }

  // 写入申请
  const app = await prisma.moderatorApplication.create({
    data: {
      applicantId: session.user.id,
      applyingFor,
      articleCount,
      commentCount,
      likeCount,
      reason: reason || null,
      status: 'PENDING',
    },
  });

  return NextResponse.json({
    ok: true,
    id: app.id,
    msg: `已提交${applyingFor === 'MODERATOR' ? '版主' : '管理员'}申请, 等待审批`,
  });
}

/// GET: 列出申请 (版主/管理员)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  // 必须是版主/管理员
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!me || (me.role !== 'MODERATOR' && me.role !== 'ADMIN')) {
    return NextResponse.json({ error: '需要版主或管理员权限' }, { status: 403 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'PENDING';
  const applyingFor = url.searchParams.get('applyingFor') || undefined;

  const where: any = { status };
  if (applyingFor) where.applyingFor = applyingFor;

  const apps = await prisma.moderatorApplication.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // join 申请人
  const userIds = Array.from(new Set(apps.map(a => a.applicantId)));
  const users = userIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, role: true },
      })
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  return NextResponse.json({
    ok: true,
    applications: apps.map(a => {
      const u = userMap.get(a.applicantId);
      return {
        ...a,
        applicantName: u?.username ?? '匿名',
        applicantRole: u?.role ?? 'MEMBER',
      };
    }),
  });
}
