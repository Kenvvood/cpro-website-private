// /api/articles/route.ts — 文章创建 (v22.0 Phase 7.24 Batch 9)
// 权限: 活跃订阅 (>= MONTHLY) 或 版主/管理员
// 自动审核: 标题/摘要/正文长度 + OPEN_SOURCE 必填项
// 审核通过 → status='PUBLISHED' + publishedAt=now
// 审核拒绝 → 返回 review.status='REJECTED' + 原因, 不写库

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { detectUserSubscription } from '@/lib/moderation';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const body = await req.json();
  const {
    type, title, summary, content,
    fileUrl, license, originalAuthor, originalSource,
  } = body;

  // 类型校验
  if (type !== 'PURE' && type !== 'OPEN_SOURCE') {
    return NextResponse.json({ error: '请选择文章类型' }, { status: 400 });
  }

  // 权限校验
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isStaff = !!(me && ((me.role as string) === 'MODERATOR' || (me.role as string) === 'ADMIN'));
  if (!isStaff) {
    const m = await prisma.membership.findFirst({
      where: { userId: session.user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: { plan: true },
    });
    const hasActiveSubscription = detectUserSubscription(m?.plan) === 'SUBSCRIBED';
    if (!hasActiveSubscription) {
      return NextResponse.json({ error: '发布文章需月度或更高订阅' }, { status: 403 });
    }
  }

  // 自动审核
  const errors: string[] = [];
  if (!title || title.length < 5) errors.push('标题至少 5 字');
  if (title && title.length > 200) errors.push('标题不超过 200 字');
  if (!summary || summary.length < 10) errors.push('摘要至少 10 字');
  if (summary && summary.length > 500) errors.push('摘要不超过 500 字');
  if (!content || content.length < 200) errors.push('正文至少 200 字');
  if (content && content.length > 50000) errors.push('正文不超过 50000 字');

  if (type === 'OPEN_SOURCE') {
    if (!fileUrl || !fileUrl.startsWith('http')) {
      errors.push('源码文章必须填写 http(s):// 开头的下载链接');
    }
    if (!originalAuthor || originalAuthor.length < 2) {
      errors.push('源码文章必须填写原作者 (至少 2 字)');
    }
    if (!originalSource || originalSource.length < 2) {
      errors.push('源码文章必须填写原始仓库 (至少 2 字)');
    }
    if (!license) {
      errors.push('源码文章必须选择协议');
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({
      error: '自动审核未通过',
      review: { status: 'REJECTED', reason: errors.join(' · ') },
    }, { status: 400 });
  }

  // 生成 slug
  const slug = await generateUniqueSlug(title);

  // 写入 (审核通过 → 直接 PUBLISHED)
  const article = await prisma.article.create({
    data: {
      slug,
      title,
      summary,
      content,
      type,
      fileUrl: type === 'OPEN_SOURCE' ? fileUrl : null,
      license: type === 'OPEN_SOURCE' ? license : null,
      originalAuthor: type === 'OPEN_SOURCE' ? originalAuthor : null,
      originalSource: type === 'OPEN_SOURCE' ? originalSource : null,
      authorId: session.user.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      reviewStatus: 'APPROVED',
    },
  });

  return NextResponse.json({
    ok: true,
    id: article.id,
    slug: article.slug,
    msg: `${type === 'OPEN_SOURCE' ? '源码文章' : '纯文章'}发布成功`,
    reviewStatus: 'APPROVED',
  });
}

/// 生成唯一 slug
async function generateUniqueSlug(title: string): Promise<string> {
  // 简化为: lowercase + 替换空格 + 移除特殊字符
  let base = title
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .slice(0, 50);
  if (!base) base = 'article';

  // 检查是否已存在, 加 -1, -2 等后缀
  let slug = base;
  let counter = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter++;
    if (counter > 100) {
      slug = `${base}-${Date.now()}`;
      break;
    }
  }
  return slug;
}
