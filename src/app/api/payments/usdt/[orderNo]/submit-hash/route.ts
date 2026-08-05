// src/app/api/payments/usdt/[orderNo]/submit-hash/route.ts
// 用户提交链上 TxID (task-0041, 核心幂等点)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyOnChain } from "@/lib/chain-verifier";
import { parseFromReleaseId } from "@/lib/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const { orderNo } = await params;
  const body = await req.json().catch(() => null);
  const txHash = body?.txHash as string | undefined;
  if (!txHash || typeof txHash !== "string") {
    return NextResponse.json({ ok: false, error: "txHash 缺失" }, { status: 400 });
  }

  // 幂等层 2: TxHash 全局唯一
  const existingOrder = await prisma.order.findFirst({
    where: {
      txHash,
      status: { in: ["PENDING", "CONFIRMED"] },
      NOT: { orderNo },
    },
  });
  if (existingOrder) {
    return NextResponse.json(
      {
        ok: false,
        error: `TxID 已被订单 ${existingOrder.orderNo} 使用, 请确认是否双付`,
      },
      { status: 409 },
    );
  }

  // 幂等层 1: Order 自带幂等 — 仅当 PENDING + txHash=null 才允许写入
  const updated = await prisma.order.updateMany({
    where: { orderNo, userId, status: "PENDING", txHash: null },
    data: { txHash, paidAt: new Date() },
  });
  if (updated.count === 0) {
    return NextResponse.json(
      { ok: false, error: "订单状态不允许提交 (可能已超时/已提交/已履约)" },
      { status: 409 },
    );
  }

  const order = await prisma.order.findUnique({ where: { orderNo } });
  if (!order) {
    return NextResponse.json({ ok: false, error: "订单丢失" }, { status: 500 });
  }

  // 已过期
  if (order.expiresAt < new Date()) {
    await prisma.order.update({
      where: { orderNo },
      data: { status: "TIMEOUT" },
    });
    return NextResponse.json({ ok: false, error: "订单已过期" }, { status: 410 });
  }

  // 链上验证 + 履约事务 (task057 Phase 9: 接入 channel + createdAt 触发 V5 时间戳防线)
  try {
    const verified = await verifyOnChain(
      txHash,
      Number(order.amount),
      order.walletAddress,
      order.channel as "USDT_TRC20" | "USDT_BSC",
      order.createdAt,
    );
    if (!verified.ok) {
      await prisma.order.update({
        where: { orderNo },
        data: { status: "FAILED", failedAt: new Date() },
      });
      return NextResponse.json(
        { ok: false, error: verified.reason ?? "链上验证失败" },
        { status: 422 },
      );
    }

    // 履约事务
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { orderNo },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
          blockNumber: verified.blockNumber,
        },
      });

      const now = new Date();
      const expireAt = new Date(now.getTime() + order.durationDays * 86400_000);
      const membership = await tx.membership.upsert({
        where: { paymentId: order.id },
        create: {
          userId: order.userId,
          plan: order.plan,
          status: "ACTIVE",
          startAt: now,
          expireAt,
          autoRenew: false,
          paidAmount: order.amount,
          paymentId: order.id,
        },
        update: {
          plan: order.plan,
          status: "ACTIVE",
          startAt: now,
          expireAt,
          paidAmount: order.amount,
        },
      });

      await tx.user.update({
        where: { id: order.userId },
        data: { totalSpent: { increment: order.amount } },
      });

      // 写入 UpgradeConversion (Phase 7 task-0048 转化归因)
      // 双保险: cookie 优先, referer 兜底
      // 容错: 如果解析失败或写入失败, 不影响主支付流
      const cookieHeader = req.headers.get("cookie");
      const refererHeader = req.headers.get("referer");
      const fromReleaseId = parseFromReleaseId(cookieHeader, refererHeader);
      if (fromReleaseId) {
        try {
          await tx.upgradeConversion.create({
            data: {
              userId: order.userId,
              fromReleaseId,
              toProductId: membership.id, // 用 membership.id 作为 paid product 标识
            },
          });
        } catch (e) {
          console.error("[UpgradeConversion 写入失败, 不影响支付]", e);
        }
      }
    });

    return NextResponse.json({ ok: true, data: { status: "CONFIRMED" } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: `履约失败: ${e.message ?? String(e)}` },
      { status: 500 },
    );
  }
}