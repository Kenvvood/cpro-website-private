"use client";
// v22.0 Phase 7.24 Batch 4: MembershipPlans 重构 (minimaxi token-plan 风)
// - 月付/年付 tab 切换
// - 3 档套餐 1px 底边线密集列表 (去卡片网格)
// - 价格保留 (业务必需), 文案模糊化 "严选订阅" 不写硬承诺
// - 保留 CheckoutModal 订阅交互
import { useState } from "react";
import { CheckoutModal } from "./CheckoutModal";
import type { MembershipPlan } from "@/generated/prisma/enums";

type Cycle = "MONTHLY" | "ANNUAL";

interface PlanRow {
  plan: MembershipPlan;
  label: string;
  monthly: string;   // 月均价
  total: string;     // 总价
  cycle: Cycle;
  desc: string;
  highlights: string[];
  popular?: boolean;
  save?: string;
}

const PLANS: PlanRow[] = [
  {
    plan: "WEEKLY",
    label: "周付会员",
    monthly: "$0.5",
    total: "$3.6 / 7天",
    cycle: "MONTHLY",
    desc: "入门尝鲜 · 严选服务随时启停",
    highlights: ["全站 EA + 指标 + 脚本", "投研教程 6 章", "工单 4h 响应", "可随时退订"],
  },
  {
    plan: "MONTHLY",
    label: "月付会员",
    monthly: "$0.3",
    total: "$8.8 / 30天",
    cycle: "MONTHLY",
    desc: "30 天持续 · 严选资源随心用",
    highlights: ["周付全部权益", "新增 EA 优先体验", "策略调优 1v1 答疑", "社区 VIP 群"],
    popular: true,
  },
  {
    plan: "ANNUAL",
    label: "年付会员",
    monthly: "$0.08",
    total: "$36.6 / 365天",
    cycle: "ANNUAL",
    desc: "365 天长期 · 工作室级保障",
    highlights: ["月付全部权益", "策略源码头等舱", "BUG 优先修复通道", "专属技术顾问"],
    save: "约省 30%",
  },
];

const CYCLE_TABS: { value: Cycle; label: string; hint: string }[] = [
  { value: "MONTHLY", label: "按月订阅", hint: "灵活启停" },
  { value: "ANNUAL", label: "按年订阅", hint: "约省 30%" },
];

export function MembershipPlans({ loggedIn }: { loggedIn: boolean }) {
  const [cycle, setCycle] = useState<Cycle>("MONTHLY");
  const [activePlan, setActivePlan] = useState<MembershipPlan | null>(null);

  const visiblePlans = PLANS.filter((p) => p.cycle === cycle);

  return (
    <>
      {/* 月付/年付 tab 切换 */}
      <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-bg-secondary mb-10">
        {CYCLE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCycle(tab.value)}
            className={`px-5 py-2 text-sm rounded-full transition-all ${
              cycle === tab.value
                ? "bg-bg-primary text-text-primary shadow-sm font-medium"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-[10px] ${cycle === tab.value ? "text-accent-blue" : "text-text-muted"}`}>
              {tab.hint}
            </span>
          </button>
        ))}
      </div>

      {/* 3 套餐: 1px 底边线密集列表 (去卡片网格, 错落有致) */}
      <div className="border-y border-border">
        {visiblePlans.map((p, i) => (
          <div
            key={p.plan}
            className={`group grid grid-cols-1 lg:grid-cols-[80px_1fr_220px_180px] gap-4 lg:gap-8 items-start py-8 border-b border-border last:border-0 transition-colors px-2 -mx-2 ${
              p.popular ? "bg-bg-tertiary" : "hover:bg-bg-tertiary"
            }`}
          >
            {/* 序号 + popular 标签 */}
            <div className="flex flex-col gap-2">
              <span className="text-sm text-text-muted num font-mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              {p.popular && (
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/30 w-fit">
                  推荐
                </span>
              )}
              {p.save && (
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/30 w-fit">
                  {p.save}
                </span>
              )}
            </div>

            {/* 套餐标题 + 描述 */}
            <div>
              <h3 className="text-xl lg:text-2xl font-semibold text-text-primary leading-[28px] mb-2">
                {p.label}
              </h3>
              <p className="text-sm text-text-secondary leading-[24px] mb-4">
                {p.desc}
              </p>
              <ul className="space-y-1.5">
                {p.highlights.map((h, j) => (
                  <li key={j} className="text-sm text-text-secondary leading-[24px] flex items-start gap-2">
                    <span className="text-accent-blue shrink-0 mt-0.5">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 价格 */}
            <div className="flex flex-col">
              <div className="text-3xl lg:text-4xl font-bold text-text-primary font-mono leading-tight">
                {p.monthly}
                <span className="text-sm text-text-muted font-normal ml-1">/ 天均</span>
              </div>
              <div className="text-xs text-text-muted mt-1 font-mono">{p.total}</div>
              <div className="text-[10px] text-text-muted mt-1">USDT 收款 · 链上确认</div>
            </div>

            {/* 操作 */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  if (!loggedIn) {
                    window.location.href = "/login?callbackUrl=/membership";
                    return;
                  }
                  setActivePlan(p.plan);
                }}
                className={`w-full py-2.5 rounded-md text-sm font-medium transition-all ${
                  p.popular
                    ? "bg-accent-blue text-white hover:bg-accent-blue/90"
                    : "border border-border text-text-primary hover:bg-bg-secondary"
                }`}
              >
                立即订阅
              </button>
              <a
                href="#faq"
                className="text-xs text-text-muted hover:text-text-primary text-center transition-colors"
              >
                了解权益 →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 月付/年付 切换提示 */}
      <p className="text-xs text-text-muted mt-4 text-center">
        {cycle === "MONTHLY" ? "按月订阅可随时退订 · 链上 USDT 7×24 自动结算" : "按年订阅一次性付费 · 享受约 30% 价格优惠"}
      </p>

      {activePlan && (
        <CheckoutModal plan={activePlan} isOpen={!!activePlan} onClose={() => setActivePlan(null)} />
      )}
    </>
  );
}
