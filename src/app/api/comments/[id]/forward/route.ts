// /api/comments/[id]/forward/route.ts — 电子转发 (站内 DM 占位)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  // 订阅会员才能转发
  const plan = (session.user as any).plan || (session.user as any).activePlan;
  const role = session.user.role;
  if (plan !== 'MONTHLY' && plan !== 'YEARLY' && plan !== 'LIFETIME' && role !== 'MODERATOR' && role !== 'ADMIN') {
    return NextResponse.json({ error: '仅订阅会员可转发评论' }, { status: 403 });
  }

  const { id } = await params;
  try {
    // 转发 = forwardCount + 1 (Phase 1 占位, 真正 DM 留 Batch 9)
    const comment = await prisma.comment.update({
      where: { id },
      data: { forwardCount: { increment: 1 } },
    });
    return NextResponse.json({ ok: true, forwardCount: comment.forwardCount });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '转发失败' }, { status: 500 });
  }
}
