// src/components/open-source/OpenSourceDownloadButton.tsx
// task051 PAYMENT-REBUILD Bug-3 修复: 三档动态化 + CheckoutModal 复用
"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { DownloadPaywall } from "@/components/paywall/DownloadPaywall";
import type { MembershipPlan } from "@/generated/prisma/enums";

export interface OpenSourceDownloadButtonProps {
  releaseId: string;
  hasAccess: boolean;
  isLoggedIn: boolean;
  requiredPlan: string;
}

const PLAN_LABEL: Record<string, string> = {
  WEEKLY: '周付 ($3.6)',
  MONTHLY: '月付 ($8.8)',
  ANNUAL: '年付 ($36.6)',
};

export function OpenSourceDownloadButton({
  releaseId,
  hasAccess,
  isLoggedIn,
  requiredPlan,
}: OpenSourceDownloadButtonProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const [activePlan, setActivePlan] = useState<MembershipPlan | null>(null);

  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?callbackUrl=/open-source/${releaseId}`}
        className="block w-full text-center px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
      >
        登录后下载
      </Link>
    );
  }
  if (!hasAccess) {
    return (
      <>
        <button
          onClick={() => setShowPaywall(true)}
          className="block w-full text-center px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
        >
          ⚡ 升级会员解锁下载 (需 {PLAN_LABEL[requiredPlan] ?? requiredPlan})
        </button>
        <DownloadPaywall
          isOpen={showPaywall}
          requiredPlan={requiredPlan as MembershipPlan}
          onClose={() => setShowPaywall(false)}
          onSelectPlan={(p) => {
            setShowPaywall(false);
            setActivePlan(p);
          }}
        />
        {activePlan && (
          <CheckoutModal plan={activePlan} isOpen={!!activePlan} onClose={() => setActivePlan(null)} />
        )}
      </>
    );
  }
  return (
    <a
      href={`/open-source/${releaseId}/download`}
      className="block w-full text-center px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
    >
      下载
    </a>
  );
}