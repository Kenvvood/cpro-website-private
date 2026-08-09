"use client";
// MembershipPlans — 3 档套餐 + CheckoutModal 触发
// task051 PAYMENT-REBUILD: 三档纯付费 (WEEKLY/MONTHLY/ANNUAL), 无 FREE_TRIAL
import { useState } from "react";
import { CheckoutModal } from "./CheckoutModal";
import type { MembershipPlan } from "@/generated/prisma/enums";

const PLANS: Array<{
  plan: MembershipPlan;
  label: string;
  priceUSDT: string;
  desc: string;
  popular?: boolean;
}> = [
  {
    plan: "WEEKLY",
    label: "周付会员",
    priceUSDT: "$3.6 USDT",
    desc: "7 天入门 · 全站 EA 随心用 + 投研教程",
  },
  {
    plan: "MONTHLY",
    label: "月付会员",
    priceUSDT: "$8.8 USDT",
    desc: "30 天持续 · 全站资源随心用 + 投研教程",
    popular: true,
  },
  {
    plan: "ANNUAL",
    label: "年付会员",
    priceUSDT: "$36.6 USDT",
    desc: "365 天长期 · 持续更新中 · 工作室级保障",
  },
];

export function MembershipPlans({ loggedIn }: { loggedIn: boolean }) {
  const [activePlan, setActivePlan] = useState<MembershipPlan | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((p) => (
          <div
            key={p.plan}
            className={`p-6 rounded-lg border ${
              p.popular ? "border-primary shadow-md" : "border-border"
            } bg-card relative`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground">
                推荐
              </span>
            )}
            <div className="text-lg font-semibold mb-1">{p.label}</div>
            <div className="text-3xl font-bold mb-1 font-mono">{p.priceUSDT}</div>
            <div className="text-xs text-muted-foreground mb-4">USDT 收款</div>
            <div className="text-sm text-muted-foreground mb-6 min-h-[3rem]">{p.desc}</div>
            <button
              onClick={() => {
                if (!loggedIn) {
                  window.location.href = "/login?callbackUrl=/membership";
                  return;
                }
                setActivePlan(p.plan);
              }}
              className="w-full py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
            >
              立即订阅
            </button>
          </div>
        ))}
      </div>

      {activePlan && (
        <CheckoutModal plan={activePlan} isOpen={!!activePlan} onClose={() => setActivePlan(null)} />
      )}
    </>
  );
}