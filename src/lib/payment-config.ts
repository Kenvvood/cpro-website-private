// src/lib/payment-config.ts
// USDT 支付配置 (task-0041 → task051 PAYMENT-REBUILD 重构)
// ARCHIVE v11.0 三档纯付费 (WEEKLY/MONTHLY/ANNUAL), 无 FREE_TRIAL
import type { MembershipPlan } from "@/generated/prisma/enums";

export const USDT_RATES: Record<MembershipPlan, number> = {
  WEEKLY: 3.6,    // task051 architect 裁决
  MONTHLY: 8.8,   // task051 architect 裁决
  ANNUAL: 36.6,   // task051 architect 裁决
};

export const PLAN_DURATION_DAYS: Record<MembershipPlan, number> = {
  WEEKLY: 7,
  MONTHLY: 30,
  ANNUAL: 365,
};

export const PLAN_LABEL_CN: Record<MembershipPlan, string> = {
  WEEKLY: "周付会员 ($3.6 USDT)",
  MONTHLY: "月付会员 ($8.8 USDT)",
  ANNUAL: "年付会员 ($36.6 USDT)",
};

export const ORDER_EXPIRY_MINUTES = 30; // 30 分钟支付窗口

export const WALLET_CONFIG = {
  USDT_TRC20: process.env.USDT_TRC20_WALLET ?? "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  USDT_BSC: process.env.USDT_BSC_WALLET ?? "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
};

export function calculateUsdtAmount(plan: MembershipPlan): number {
  return USDT_RATES[plan];
}