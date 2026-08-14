// /api/admin/refunds — admin 列出所有退款申请 (v22.0 Phase 7.24 BATCH 15 PATCH 10)
// PM 拍板 2026-08-13: admin 退款审批面板 — 列表/搜索/筛选/分页
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // admin 校验
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!me || me.role !== 'ADMIN') {
      return NextResponse.json({ error: '需要 ADMIN 角色' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL'; // PENDING / APPROVED / REJECTED / COMPLETED / ALL
    const search = searchParams.get('search') || ''; // 订单号/用户名/手机号
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);

    const where: any = {};
    if (status !== 'ALL') where.status = status;

    // 搜索: 关联 order 的 orderNo 或 user 的 username/phone
    if (search) {
      where.OR = [
        { order: { orderNo: { contains: search, mode: 'insensitive' } } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [refunds, total, pendingCount] = await Promise.all([
      prisma.refund.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          order: { select: { orderNo: true, plan: true, amount: true, paidAt: true, durationDays: true } },
        },
      }),
      prisma.refund.count({ where }),
      prisma.refund.count({ where: { status: 'PENDING' } }),
    ]);

    // 查 users (Refund schema 没有 user relation, 用 userId 单独查)
    const userIds = Array.from(new Set(refunds.map((r) => r.userId)));
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, username: true, phone: true, email: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return NextResponse.json({
      ok: true,
      refunds: refunds.map((r) => ({
        id: r.id,
        orderNo: r.order.orderNo,
        plan: r.order.plan,
        orderAmount: Number(r.order.amount),
        paidAt: r.order.paidAt,
        durationDays: r.order.durationDays,
        user: userMap.get(r.userId) || null,
        amount: Number(r.amount),
        reason: r.reason,
        status: r.status,
        timeBucket: r.timeBucket,
        downloadBucket: r.downloadBucket,
        timeRefundPct: r.timeRefundPct,
        downloadRefundPct: r.downloadRefundPct,
        actualRefundPct: r.actualRefundPct,
        refundedCount: r.refundedCount,
        txHash: r.txHash,
        adminNote: r.adminNote,
        processedAt: r.processedAt,
        createdAt: r.createdAt,
      })),
      pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
      stats: { pendingCount },
    });
  } catch (error) {
    console.error('[admin refunds] 错误:', error);
    return NextResponse.json({ error: '获取列表失败' }, { status: 500 });
  }
}
