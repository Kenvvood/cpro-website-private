// /api/comments/[id]/moderate/route.ts — 控评 API (版主/管理员)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canModerate, canDelete } from '@/lib/moderation';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  const role = (session.user.role as any) || 'MEMBER';
  if (!canModerate(role)) {
    return NextResponse.json({ error: '权限不足' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  let newStatus: 'HIDDEN' | 'PUBLISHED' | 'DELETED' | null = null;
  if (action === 'hide') newStatus = 'HIDDEN';
  else if (action === 'show') newStatus = 'PUBLISHED';
  else if (action === 'delete') {
    if (!canDelete(role)) {
      return NextResponse.json({ error: '仅管理员可删除' }, { status: 403 });
    }
    newStatus = 'DELETED';
  } else {
    return NextResponse.json({ error: 'action 必须为 hide/show/delete' }, { status: 400 });
  }

  try {
    await prisma.comment.update({
      where: { id },
      data: { status: newStatus },
    });
    return NextResponse.json({ ok: true, status: newStatus });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '操作失败' }, { status: 500 });
  }
}
