// src/app/(member)/membership/page.tsx
// 会员订阅页 (task-0041)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembershipPlans } from "@/components/checkout/MembershipPlans";
import { hasActiveMembership } from "@/lib/membership";

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const currentMembership = userId
    ? await prisma.membership.findFirst({
        where: { userId, status: "ACTIVE" },
        orderBy: { expireAt: "desc" },
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">CProTrading 会员订阅</h1>
      <p className="text-muted-foreground mb-8">
        付费会员解锁持续收录的合规开源再分发资源 · 含中文教程 · 含专属社区
      </p>

      {currentMembership && (
        <div className="mb-6 p-4 rounded border border-green-500/30 bg-green-500/5">
          <div className="font-semibold text-green-700">✓ 您当前是会员</div>
          <div className="text-sm text-muted-foreground">
            套餐: {currentMembership.plan} · 到期:{" "}
            {currentMembership.expireAt.toLocaleString("zh-CN")}
          </div>
        </div>
      )}

      <MembershipPlans loggedIn={!!userId} />

      <p className="mt-8 text-xs text-muted-foreground text-center">
        ⚠️ 实盘交易盈亏自负, 本平台资源仅供技术交流与回测用途
      </p>
    </div>
  );
}