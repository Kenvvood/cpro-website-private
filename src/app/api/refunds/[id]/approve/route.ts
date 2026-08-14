// /api/refunds/[id]/approve — admin 审批 (v22.0 Phase 7.24 Batch 14B)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCsrf, csrfForbidden } from '@/lib/csrf';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const csrf = checkCsrf(request);
    if (!csrf.ok) return csrfForbidden(csrf.reason);

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

    const { id } = await params;
    const body = await request.json();
    const { action, txHash, adminNote } = body;

    const refund = await prisma.refund.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!refund) {
      return NextResponse.json({ error: '退款记录不存在' }, { status: 404 });
    }
    if (refund.status !== 'PENDING') {
      return NextResponse.json({ error: `状态 ${refund.status}, 已审批` }, { status: 400 });
    }

    if (action === 'APPROVE') {
      // 通过: 链上退款 + 更新 Order + Membership
      const updated = await prisma.$transaction([
        prisma.refund.update({
          where: { id },
          data: {
            status: 'APPROVED',
            txHash: txHash || null,
            processedAt: new Date(),
            adminNote: adminNote || null,
          },
        }),
        prisma.order.update({
          where: { id: refund.orderId },
          data: { status: 'REFUNDED', refundedAt: new Date() },
        }),
        prisma.membership.updateMany({
          where: { paymentId: refund.orderId },
          data: { status: 'REFUNDED' },
        }),
      ]);

      return NextResponse.json({ ok: true, refund: updated[0] });
    } else if (action === 'REJECT') {
      const updated = await prisma.refund.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedAt: new Date(),
          adminNote: adminNote || '管理员拒绝',
        },
      });
      return NextResponse.json({ ok: true, refund: updated });
    } else {
      return NextResponse.json({ error: 'action 必须是 APPROVE 或 REJECT' }, { status: 400 });
    }
  } catch (error) {
    console.error('[refund approve] 错误:', error);
    return NextResponse.json({ error: '审批失败' }, { status: 500 });
  }
}
