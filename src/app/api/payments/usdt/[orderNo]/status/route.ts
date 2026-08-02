// src/app/api/payments/usdt/[orderNo]/status/route.ts
// 订单状态查询 (task-0041)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }
  const { orderNo } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNo },
    select: {
      orderNo: true,
      status: true,
      txHash: true,
      amount: true,
      currency: true,
      channel: true,
      expiresAt: true,
      paidAt: true,
      confirmedAt: true,
      failedAt: true,
      refundedAt: true,
      userId: true,
    },
  });
  if (!order || order.userId !== userId) {
    return NextResponse.json({ ok: false, error: "订单不存在" }, { status: 404 });
  }

  // 自动扫描: 已过 expiresAt 且仍 PENDING → 标 TIMEOUT
  if (order.status === "PENDING" && order.expiresAt < new Date()) {
    await prisma.order.update({
      where: { orderNo },
      data: { status: "TIMEOUT" },
    });
    order.status = "TIMEOUT";
  }

  return NextResponse.json({
    ok: true,
    data: {
      orderNo: order.orderNo,
      status: order.status,
      txHash: order.txHash,
      amount: Number(order.amount),
      currency: order.currency,
      channel: order.channel,
      expiresAt: order.expiresAt.toISOString(),
      paidAt: order.paidAt?.toISOString() ?? null,
      confirmedAt: order.confirmedAt?.toISOString() ?? null,
    },
  });
}