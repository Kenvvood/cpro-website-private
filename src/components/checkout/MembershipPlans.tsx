"use client";
// MembershipPlans — 3 档套餐 + CheckoutModal 触发 (task-0041)
import { useState } from "react";
import { CheckoutModal } from "./CheckoutModal";
import type { MembershipPlan } from "@/generated/prisma/enums";

const PLANS: Array<{
  plan: MembershipPlan;
  label: string;
  priceCN: string;
  priceUSDT: string;
  desc: string;
  popular?: boolean;
}> = [
  {
    plan: "FREE_TRIAL",
    label: "免费试用",
    priceCN: "¥0",
    priceUSDT: "0 USDT",
    desc: "7 天免费体验基础功能",
  },
  {
    plan: "MONTHLY_16",
    label: "月度会员",
    priceCN: "¥99",
    priceUSDT: "6.6 USDT",
    desc: "全平台 2,042 开源资源无限下载 · 含教程",
    popular: true,
  },
  {
    plan: "ANNUAL_36",
    label: "年度会员",
    priceCN: "¥278",
    priceUSDT: "36.6 USDT",
    desc: "年度套餐 · 节省 ¥900 · 含 6 月持续更新",
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
            <div className="text-3xl font-bold mb-1">{p.priceCN}</div>
            <div className="text-xs text-muted-foreground mb-4">{p.priceUSDT}</div>
            <div className="text-sm text-muted-foreground mb-6 min-h-[3rem]">{p.desc}</div>
            <button
              onClick={() => {
                if (!loggedIn) {
                  window.location.href = "/login?callbackUrl=/membership";
                  return;
                }
                setActivePlan(p.plan);
              }}
              disabled={p.plan === "FREE_TRIAL"}
              className="w-full py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {p.plan === "FREE_TRIAL" ? "自动开通" : "立即订阅"}
            </button>
          </div>
        ))}
      </div>

      {activePlan && activePlan !== "FREE_TRIAL" && (
        <CheckoutModal plan={activePlan} isOpen={!!activePlan} onClose={() => setActivePlan(null)} />
      )}
    </>
  );
}