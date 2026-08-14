// /api/open-source-releases/route.ts — 源码 release 创建 (v22.0 Phase 7.24 Batch 9)
// 权限: 活跃订阅 (>= MONTHLY) 或 版主/管理员
// 自动审核: 标题/描述/必填项/fileUrl 合法性
// 审核通过 → status='PUBLISHED' + publishedAt=now + 公开访问

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
    title, description, fileUrl,
    license, originalAuthor, originalSource,
    tier, requiredPlan,
  } = body;

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
      return NextResponse.json({ error: '发布源码需月度或更高订阅' }, { status: 403 });
    }
  }

  // 自动审核
  const errors: string[] = [];
  if (!title || title.length < 5) errors.push('标题至少 5 字');
  if (title && title.length > 200) errors.push('标题不超过 200 字');
  if (!description || description.length < 20) errors.push('描述至少 20 字');
  if (description && description.length > 2000) errors.push('描述不超过 2000 字');
  if (!fileUrl || !fileUrl.startsWith('http')) {
    errors.push('源码下载链接必填 (http(s):// 开头)');
  }
  if (!originalAuthor || originalAuthor.length < 2) errors.push('原作者至少 2 字');
  if (!originalSource || originalSource.length < 2) errors.push('原始仓库至少 2 字');
  if (!license) errors.push('协议必填');

  // 协议白名单
  const VALID_LICENSES = ['GPL_2', 'GPL_3', 'APACHE_2_0', 'MIT', 'BSD_3', 'UNLICENSE', 'LGPL', 'MPL_2_0', 'PROPRIETARY', 'NO_LICENSE', 'UNKNOWN'];
  if (license && !VALID_LICENSES.includes(license)) {
    errors.push(`协议必须是已知类型: ${VALID_LICENSES.join('/')}`);
  }

  // requiredPlan 白名单
  const VALID_PLANS = ['WEEKLY', 'MONTHLY', 'ANNUAL'];
  if (requiredPlan && !VALID_PLANS.includes(requiredPlan)) {
    errors.push(`所需计划必须是: ${VALID_PLANS.join('/')}`);
  }

  if (errors.length > 0) {
    return NextResponse.json({
      error: '自动审核未通过',
      review: { status: 'REJECTED', reason: errors.join(' · ') },
    }, { status: 400 });
  }

  // 写入
  const release = await prisma.openSourceRelease.create({
    data: {
      title,
      description,
      fileUrl,
      license: license as any,
      originalAuthor,
      originalSource,
      tier: tier || null,
      requiredPlan: (requiredPlan || 'WEEKLY') as any,
      // sourceFileId 用 slug-like (this is for the master.db integration, use a placeholder)
      sourceFileId: `rel-user-${Date.now()}`,
      isFeatured: false,
      isFree: false,
      publishedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    id: release.id,
    msg: '源码发布成功',
    reviewStatus: 'APPROVED',
  });
}
