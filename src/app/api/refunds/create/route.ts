// /api/refunds/create — 用户发起退款申请 (v22.0 Phase 7.24 Batch 14B)
// PM 拍板: 5 档时间 + 4 档下载 + min 规则
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCsrf, csrfForbidden } from '@/lib/csrf';
import { calcRefund } from '@/lib/refundPolicy';

export async function POST(request: NextRequest) {
  try {
    // CSRF
    const csrf = checkCsrf(request);
    if (!csrf.ok) return csrfForbidden(csrf.reason);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId || !reason) {
      return NextResponse.json({ error: 'orderId 和 reason 必填' }, { status: 400 });
    }
    if (typeof reason !== 'string' || reason.length < 5 || reason.length > 500) {
      return NextResponse.json({ error: '退款理由 5-500 字符' }, { status: 400 });
    }

    // 校验订单: 必须是本人 + CONFIRMED + 没退过
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        refunds: true,
        membership: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (order.userId !== userId) {
      return NextResponse.json({ error: '无权操作此订单' }, { status: 403 });
    }
    if (order.status !== 'CONFIRMED') {
      return NextResponse.json({ error: `订单状态 ${order.status}, 不可退款` }, { status: 400 });
    }
    if (order.refunds.length > 0) {
      return NextResponse.json({ error: '此订单已有退款记录' }, { status: 400 });
    }
    if (!order.paidAt) {
      return NextResponse.json({ error: '订单支付时间缺失' }, { status: 400 });
    }

    // 累计下载量
    const downloadCount = await prisma.downloadRecord.count({ where: { userId } });

    // 计算阶梯
    const orderAmount = Number(order.amount);
    const calc = calcRefund(order.paidAt, orderAmount, downloadCount);

    // 实际退款 0 = 拒
    if (calc.actualPct === 0) {
      return NextResponse.json({
        error: calc.description,
        calculation: calc,
        eligible: false,
      }, { status: 400 });
    }

    // 创建退款记录 (PENDING 等 admin 审批)
    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        userId,
        amount: calc.refundAmount,
        reason,
        status: 'PENDING',
        timeBucket: calc.timeBucket,
        downloadBucket: calc.downloadBucket,
        timeRefundPct: calc.timePct,
        downloadRefundPct: calc.downloadPct,
        actualRefundPct: calc.actualPct,
        refundedCount: downloadCount,
      },
    });

    return NextResponse.json({
      ok: true,
      refund: {
        id: refund.id,
        amount: Number(refund.amount),
        actualRefundPct: refund.actualRefundPct,
        timeBucket: refund.timeBucket,
        downloadBucket: refund.downloadBucket,
        status: refund.status,
        createdAt: refund.createdAt,
      },
      calculation: calc,
    });
  } catch (error) {
    console.error('[refund create] 错误:', error);
    return NextResponse.json({ error: '退款申请失败' }, { status: 500 });
  }
}
