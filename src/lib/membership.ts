// src/lib/membership.ts
// 会员门禁辅助: 检查用户是否有符合 requiredPlan 的活跃会员
// task051 PAYMENT-REBUILD: WEEKLY < MONTHLY < ANNUAL, 无 FREE_TRIAL 旁路
import { prisma } from "@/lib/prisma";
import type { MembershipPlan } from "@/generated/prisma/enums";

const PLAN_ORDER: Record<MembershipPlan, number> = {
  WEEKLY: 1,    // $3.6 USDT / 7 天
  MONTHLY: 2,   // $8.8 USDT / 30 天
  ANNUAL: 3,    // $36.6 USDT / 365 天
};

export async function hasActiveMembership(userId: string, requiredPlan: MembershipPlan): Promise<boolean> {
  const required = PLAN_ORDER[requiredPlan] ?? 1;
  const now = new Date();
  const ms = await prisma.membership.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      expireAt: { gt: now },
    },
    orderBy: { expireAt: "desc" },
  });
  if (!ms) return false; // task051: 无任何会员 = 无下载权限 (D7 一刀切)
  return PLAN_ORDER[ms.plan] >= required;
}