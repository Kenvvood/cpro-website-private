// src/app/api/payments/usdt/create/route.ts
// 创建订单 (task-0041 + task063 3.2 CSRF)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCsrf, csrfForbidden } from "@/lib/csrf";
import {
  ORDER_EXPIRY_MINUTES,
  PLAN_DURATION_DAYS,
  WALLET_CONFIG,
  calculateUsdtAmount,
} from "@/lib/payment-config";
import type { MembershipPlan, PayChannel } from "@/generated/prisma/enums";

// 限流: 同 userId + plan 在 5 秒内只允许 1 个 PENDING 订单
const RECENT_PENDING_WINDOW_MS = 5_000;

export async function POST(req: NextRequest) {
  // task063 3.2: CSRF 校验 (Origin/Referer 白名单)
  const csrf = checkCsrf(req);
  if (!csrf.ok) return csrfForbidden(csrf.reason);

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "请求体非法" }, { status: 400 });
  }

  const { plan, channel } = body as { plan?: MembershipPlan; channel?: PayChannel };
  if (!plan || !(plan in PLAN_DURATION_DAYS)) {
    return NextResponse.json({ ok: false, error: "套餐非法" }, { status: 400 });
  }
  // task051 PAYMENT-REBUILD: FREE_TRIAL 已废弃, 无需旁路检查
  const finalChannel: PayChannel = channel === "USDT_BSC" ? "USDT_BSC" : "USDT_TRC20";

  // 限流: 5 秒内已有 PENDING 订单则拒绝
  const recentPending = await prisma.order.findFirst({
    where: {
      userId,
      plan,
      status: "PENDING",
      createdAt: { gte: new Date(Date.now() - RECENT_PENDING_WINDOW_MS) },
    },
  });
  if (recentPending) {
    return NextResponse.json(
      { ok: false, error: "操作过于频繁, 请稍后再试" },
      { status: 429 },
    );
  }

  const amount = calculateUsdtAmount(plan);
  const walletAddress = WALLET_CONFIG[finalChannel];
  const durationDays = PLAN_DURATION_DAYS[plan];
  const expiresAt = new Date(Date.now() + ORDER_EXPIRY_MINUTES * 60_000);
  const orderNo = `CPro-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      orderNo,
      userId,
      amount,
      currency: "USDT",
      channel: finalChannel,
      walletAddress,
      plan,
      durationDays,
      status: "PENDING",
      expiresAt,
    },
  });

  return NextResponse.json({
    ok: true,
    data: {
      orderNo: order.orderNo,
      amount: Number(order.amount),
      currency: order.currency,
      channel: order.channel,
      walletAddress: order.walletAddress,
      expiresAt: order.expiresAt.toISOString(),
      plan: order.plan,
      durationDays: order.durationDays,
    },
  });
}