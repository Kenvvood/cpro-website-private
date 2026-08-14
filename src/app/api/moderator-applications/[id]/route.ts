// /api/moderator-applications/[id]/route.ts — 申请审批 (v22.0 Phase 7.24 Batch 8+)
// PM 决策 (v3 终态):
//   - 版主申请: 版主 + 管理员可审批
//   - 管理员申请: 版主 + 管理员可审批 (门槛低)
//   - 审批通过: 检查角色上限 (版主 2, 管理员 4), 通过则 User.role 自动更新
//   - 审批拒绝: 写 reviewNote

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canPromoteTo, checkRoleLimit } from '@/lib/moderation';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  // 操作人角色
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!me) return NextResponse.json({ error: '用户不存在' }, { status: 404 });

  const body = await req.json();
  const action = body.action as 'approve' | 'reject';
  const reviewNote = (body.reviewNote as string | undefined)?.trim().slice(0, 500);

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: '无效操作' }, { status: 400 });
  }

  // 申请
  const app = await prisma.moderatorApplication.findUnique({ where: { id } });
  if (!app) return NextResponse.json({ error: '申请不存在' }, { status: 404 });
  if (app.status !== 'PENDING') {
    return NextResponse.json({ error: '该申请已处理' }, { status: 400 });
  }

  // 权限判断: 版主/admin 都能审批, 但任命权限分层 (版主只能任命版主, admin 能任命版主+admin)
  const targetRole = app.applyingFor === 'ADMIN' ? 'ADMIN' : 'MODERATOR';
  const promote = canPromoteTo(me.role, me.id, app.applicantId, targetRole);
  if (!promote.allowed) {
    return NextResponse.json({ error: promote.reason }, { status: 403 });
  }

  if (action === 'approve') {
    // 通过: 检查角色上限
    const currentCount = await prisma.user.count({
      where: { role: targetRole },
    });
    const limit = checkRoleLimit(targetRole, currentCount);
    if (!limit.allowed) {
      return NextResponse.json({
        error: `${targetRole === 'ADMIN' ? '管理员' : '版主'}已满 (${currentCount}/${limit.limit}), 不能再通过`,
      }, { status: 400 });
    }

    // 通过: 更新申请 + 更新用户角色 + 写审计
    await prisma.$transaction([
      prisma.moderatorApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedById: me.id,
          reviewedAt: new Date(),
          reviewNote: reviewNote || null,
        },
      }),
      prisma.user.update({
        where: { id: app.applicantId },
        data: { role: targetRole },
      }),
      prisma.promotionLog.create({
        data: {
          userId: app.applicantId,
          fromRole: 'MEMBER',
          toRole: targetRole,
          promotedById: me.id,
          reason: reviewNote || `申请通过 (${app.applyingFor})`,
        },
      }),
    ]);
    return NextResponse.json({
      ok: true,
      msg: `已通过 ${targetRole === 'ADMIN' ? '管理员' : '版主'} 申请 (${currentCount + 1}/${limit.limit})`,
    });
  }

  // 拒绝
  await prisma.moderatorApplication.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reviewedById: me.id,
      reviewedAt: new Date(),
      reviewNote: reviewNote || '不符合条件',
    },
  });
  return NextResponse.json({ ok: true, msg: '已拒绝申请' });
}
