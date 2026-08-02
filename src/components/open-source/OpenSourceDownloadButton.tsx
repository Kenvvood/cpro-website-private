// src/components/open-source/OpenSourceDownloadButton.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import type { MembershipPlan } from "@/generated/prisma/enums";

export interface OpenSourceDownloadButtonProps {
  releaseId: string;
  hasAccess: boolean;
  isLoggedIn: boolean;
  requiredPlan: string;
}

export function OpenSourceDownloadButton({
  releaseId,
  hasAccess,
  isLoggedIn,
  requiredPlan,
}: OpenSourceDownloadButtonProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const plan: MembershipPlan =
    requiredPlan === "ANNUAL_36" ? "ANNUAL_36" : "MONTHLY_16";

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
          onClick={() => setShowCheckout(true)}
          className="block w-full text-center px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
        >
          升级会员 (¥{requiredPlan === "MONTHLY_16" ? "99/月" : "278/年"})
        </button>
        <CheckoutModal plan={plan} isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
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