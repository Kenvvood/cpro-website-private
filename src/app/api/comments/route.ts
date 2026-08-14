// /api/comments/route.ts — 评论 POST (v22.0 Phase 7.24 Batch 8)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { detectSensitive } from '@/lib/sensitive';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const body = await req.json();
  const { targetType, targetId, content, parentId } = body;

  if (!targetType || !targetId || !content) {
    return NextResponse.json({ error: '参数不完整' }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: '评论不能超过 2000 字' }, { status: 400 });
  }
  if (content.trim().length < 2) {
    return NextResponse.json({ error: '评论太短' }, { status: 400 });
  }

  // 敏感词检测
  const hits = detectSensitive(content);
  const hasSensitive = hits.length > 0;
  const status = hasSensitive ? 'HIDDEN' : 'PUBLISHED';

  try {
    const comment = await prisma.comment.create({
      data: {
        authorId: session.user.id,
        targetType,
        targetId,
        parentId: parentId || null,
        content: content.trim(),
        status,
        sensitiveWords: hasSensitive ? JSON.stringify(hits.map(h => h.tag)) : null,
      },
    });
    return NextResponse.json({
      ok: true,
      id: comment.id,
      hidden: hasSensitive,
      msg: hasSensitive ? '已提交, 等待版主审核' : '发表成功',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '发表失败' }, { status: 500 });
  }
}
