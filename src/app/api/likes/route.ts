// /api/likes/route.ts — 点赞 (v22.0 Phase 7.24 Batch 8+)
// 订阅会员 (>= MONTHLY) 才能点赞
// 点赞对象: 评论 (COMMENT) / 文章 (ARTICLE)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { detectUserSubscription } from '@/lib/moderation';

/// POST: 点赞
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const body = await req.json();
  const { targetType, targetId } = body as { targetType?: string; targetId?: string };

  if (!targetType || !targetId) {
    return NextResponse.json({ error: '参数不完整' }, { status: 400 });
  }
  if (targetType !== 'COMMENT' && targetType !== 'ARTICLE') {
    return NextResponse.json({ error: '不支持的点赞对象' }, { status: 400 });
  }

  // 订阅校验
  const m = await prisma.membership.findFirst({
    where: { userId: session.user.id, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: { plan: true },
  });
  const sub = detectUserSubscription(m?.plan);
  // 版主/管理员 也能点赞 (roleLevel >= 50)
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isStaff = me && (me.role === 'MODERATOR' || me.role === 'ADMIN');

  if (sub !== 'SUBSCRIBED' && !isStaff) {
    return NextResponse.json({ error: '点赞需要月度或更高订阅' }, { status: 403 });
  }

  // 不能给自己点赞
  if (targetType === 'COMMENT') {
    const c = await prisma.comment.findUnique({ where: { id: targetId }, select: { authorId: true } });
    if (!c) return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    if (c.authorId === session.user.id) {
      return NextResponse.json({ error: '不能给自己点赞' }, { status: 400 });
    }
  } else if (targetType === 'ARTICLE') {
    const a = await prisma.article.findUnique({ where: { id: targetId }, select: { authorId: true } });
    if (!a) return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    if (a.authorId === session.user.id) {
      return NextResponse.json({ error: '不能给自己点赞' }, { status: 400 });
    }
  }

  // 已点过赞
  const existing = await prisma.like.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: session.user.id,
        targetType,
        targetId,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ ok: true, msg: '已点过赞', liked: true });
  }

  await prisma.like.create({
    data: {
      userId: session.user.id,
      targetType,
      targetId,
    },
  });

  // 统计当前点赞数
  const count = await prisma.like.count({ where: { targetType, targetId } });
  return NextResponse.json({ ok: true, liked: true, count });
}

/// DELETE: 取消点赞
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const url = new URL(req.url);
  const targetType = url.searchParams.get('targetType');
  const targetId = url.searchParams.get('targetId');

  if (!targetType || !targetId) {
    return NextResponse.json({ error: '参数不完整' }, { status: 400 });
  }

  await prisma.like.deleteMany({
    where: { userId: session.user.id, targetType, targetId },
  });

  const count = await prisma.like.count({ where: { targetType, targetId } });
  return NextResponse.json({ ok: true, liked: false, count });
}
