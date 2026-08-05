"use client";
// src/components/paywall/DownloadPaywall.tsx
// task051 PAYMENT-REBUILD: L1 注册用户下载锁定钩子
// 弹出 3 档套餐选择, 用户选定后由父组件触发 CheckoutModal
import { useState } from "react";
import type { MembershipPlan } from "@/generated/prisma/enums";

interface DownloadPaywallProps {
  isOpen: boolean;
  requiredPlan: MembershipPlan;
  onClose: () => void;
  onSelectPlan: (plan: MembershipPlan) => void;
}

const PLAN_OPTIONS: Array<{
  plan: MembershipPlan;
  label: string;
  priceUSDT: string;
  highlight?: boolean;
  desc: string;
}> = [
  {
    plan: "WEEKLY",
    label: "周付",
    priceUSDT: "$3.6 USDT",
    desc: "7 天全站解锁",
  },
  {
    plan: "MONTHLY",
    label: "月付",
    priceUSDT: "$8.8 USDT",
    desc: "30 天无限下载 · 推荐",
    highlight: true,
  },
  {
    plan: "ANNUAL",
    label: "年付",
    priceUSDT: "$36.6 USDT",
    desc: "365 天 · 省 70%",
  },
];

export function DownloadPaywall({ isOpen, requiredPlan, onClose, onSelectPlan }: DownloadPaywallProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary border border-border rounded-md max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">⚡ 升级会员，解锁下载</h2>
          <button
            onClick={onClose}
            className="text-2xl text-text-muted hover:text-text-primary"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-4">
          本资源需要 <span className="font-mono text-accent-blue">{requiredPlan}</span> 会员才能下载。
          开通后立即解锁 19,328 款资源无限制下载。
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {PLAN_OPTIONS.map((p) => (
            <button
              key={p.plan}
              onClick={() => onSelectPlan(p.plan)}
              className={`p-3 rounded-md border transition-colors text-left ${
                p.highlight
                  ? "border-accent-blue bg-bg-tertiary"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <div className="text-xs text-text-muted mb-1">{p.label}</div>
              <div className="text-base font-bold font-mono mb-1">{p.priceUSDT}</div>
              <div className="text-xs text-text-secondary">{p.desc}</div>
            </button>
          ))}
        </div>

        <p className="text-xs text-text-muted text-center">
          USDT 收款 · 30 分钟支付窗口 · 链上确认后立即生效
        </p>
      </div>
    </div>
  );
}