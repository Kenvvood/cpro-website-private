// v22.0 BATCH 28: /api/tickets/[id] 详情
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTicketDetail } from "@/lib/ticket";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const userRole = (session?.user as any)?.role;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const isAdmin = userRole === "ADMIN";
  const ticket = await getTicketDetail(id, userId, isAdmin);
  if (!ticket) {
    return NextResponse.json({ ok: false, error: "工单不存在或无权限" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, ticket });
}
