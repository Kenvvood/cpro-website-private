// src/lib/payment-config.ts
// USDT 支付配置 (task-0041)
import type { MembershipPlan } from "@/generated/prisma/enums";

export const USDT_RATES: Record<MembershipPlan, number> = {
  FREE_TRIAL: 0,
  MONTHLY_16: 6.6,   // ¥99 / 月, ARCHIVE v6.0 task0001 决策
  ANNUAL_36: 36.6,   // ¥278 / 年
};

export const PLAN_DURATION_DAYS: Record<MembershipPlan, number> = {
  FREE_TRIAL: 7,
  MONTHLY_16: 30,
  ANNUAL_36: 365,
};

export const PLAN_LABEL_CN: Record<MembershipPlan, string> = {
  FREE_TRIAL: "免费试用 (7 天)",
  MONTHLY_16: "月度会员 (¥99)",
  ANNUAL_36: "年度会员 (¥278)",
};

export const ORDER_EXPIRY_MINUTES = 30; // 30 分钟支付窗口

export const WALLET_CONFIG = {
  USDT_TRC20: process.env.USDT_TRC20_WALLET ?? "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  USDT_BSC: process.env.USDT_BSC_WALLET ?? "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
};

export function calculateUsdtAmount(plan: MembershipPlan): number {
  return USDT_RATES[plan];
}