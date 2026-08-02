// src/lib/membership.ts
// 会员门禁辅助: 检查用户是否有符合 requiredPlan 的活跃会员
import { prisma } from "@/lib/prisma";
import type { MembershipPlan } from "@/generated/prisma/enums";

const PLAN_ORDER: Record<MembershipPlan, number> = {
  FREE_TRIAL: 0,
  MONTHLY_16: 1,
  ANNUAL_36: 2,
};

export async function hasActiveMembership(userId: string, requiredPlan: MembershipPlan): Promise<boolean> {
  const required = PLAN_ORDER[requiredPlan] ?? 0;
  const now = new Date();
  const ms = await prisma.membership.findMany({
    where: {
      userId,
      status: "ACTIVE",
      expireAt: { gt: now },
    },
    orderBy: { expireAt: "desc" },
    take: 1,
  });
  if (ms.length === 0) return required === 0; // FREE_TRIAL 任何人通过
  return PLAN_ORDER[ms[0].plan] >= required;
}