// /api/refunds/me — 我的退款列表 (v22.0 Phase 7.24 Batch 14B)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const refunds = await prisma.refund.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            orderNo: true,
            amount: true,
            plan: true,
            paidAt: true,
            durationDays: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      refunds: refunds.map((r) => ({
        id: r.id,
        orderNo: r.order.orderNo,
        plan: r.order.plan,
        orderAmount: Number(r.order.amount),
        paidAt: r.order.paidAt,
        durationDays: r.order.durationDays,
        amount: Number(r.amount),
        reason: r.reason,
        status: r.status,
        timeBucket: r.timeBucket,
        timeRefundPct: r.timeRefundPct,
        downloadBucket: r.downloadBucket,
        downloadRefundPct: r.downloadRefundPct,
        actualRefundPct: r.actualRefundPct,
        refundedCount: r.refundedCount,
        txHash: r.txHash,
        processedAt: r.processedAt,
        adminNote: r.adminNote,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('[refund me] 错误:', error);
    return NextResponse.json({ error: '获取退款列表失败' }, { status: 500 });
  }
}
