// /api/users/[userId]/promote/route.ts — 任命 (v22.0 Phase 7.24 Batch 8+)
// 注: 路由在 [userId] 目录下 (跟 [userId]/downloads 共存, 避免 slug 冲突)
// PM 决策 (v3 终态):
//   - 任命 MODERATOR: 版主 + 管理员可操作
//   - 任命 ADMIN: 仅管理员可操作
//   - 任命理由必填, 留 PromotionLog
//   - 上限检查: 版主 2 名, 管理员 4 名
//   - 不能任命自己, 不能重复任命

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canPromoteTo, checkRoleLimit } from '@/lib/moderation';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: targetId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, username: true },
  });
  if (!me) return NextResponse.json({ error: '用户不存在' }, { status: 404 });

  const body = await req.json();
  const targetRole = body.targetRole as 'MODERATOR' | 'ADMIN';
  const reason = (body.reason as string | undefined)?.trim();

  if (!targetRole || (targetRole !== 'MODERATOR' && targetRole !== 'ADMIN')) {
    return NextResponse.json({ error: '请选择目标角色' }, { status: 400 });
  }
  if (!reason || reason.length < 5) {
    return NextResponse.json({ error: '请填写至少 5 字的任命理由' }, { status: 400 });
  }

  // 被任命人
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, username: true },
  });
  if (!target) return NextResponse.json({ error: '目标用户不存在' }, { status: 404 });

  // 已经是该角色或更高
  if (target.role === targetRole) {
    return NextResponse.json({ error: `该用户已经是${targetRole === 'ADMIN' ? '管理员' : '版主'}` }, { status: 400 });
  }
  if (target.role === 'ADMIN' && targetRole === 'MODERATOR') {
    return NextResponse.json({ error: '不能将管理员降级为版主' }, { status: 400 });
  }

  // 权限判断
  const check = canPromoteTo(me.role, me.id, target.id, targetRole);
  if (!check.allowed) {
    return NextResponse.json({ error: check.reason }, { status: 403 });
  }

  // 上限检查
  const currentCount = await prisma.user.count({ where: { role: targetRole } });
  const limit = checkRoleLimit(targetRole, currentCount);
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 400 });
  }

  // 写库: 更新角色 + 审计
  await prisma.$transaction([
    prisma.user.update({
      where: { id: target.id },
      data: { role: targetRole },
    }),
    prisma.promotionLog.create({
      data: {
        userId: target.id,
        fromRole: target.role,
        toRole: targetRole,
        promotedById: me.id,
        reason,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    msg: `已将 ${target.username} 任命为${targetRole === 'ADMIN' ? '管理员' : '版主'} (${currentCount + 1}/${limit.limit})`,
  });
}
