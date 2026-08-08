// src/app/api/payments/usdt/[orderNo]/cancel/route.ts
// 取消订单 (task-0041 + task063 3.2 CSRF)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCsrf, csrfForbidden } from "@/lib/csrf";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  // task063 3.2: CSRF 校验
  const csrf = checkCsrf(req);
  if (!csrf.ok) return csrfForbidden(csrf.reason);

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }
  const { orderNo } = await params;
  // 仅 PENDING 且 txHash=null 允许取消
  const result = await prisma.order.updateMany({
    where: { orderNo, userId, status: "PENDING", txHash: null },
    data: { status: "TIMEOUT" },
  });
  if (result.count === 0) {
    return NextResponse.json(
      { ok: false, error: "订单不允许取消 (可能已提交/已履约)" },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
}