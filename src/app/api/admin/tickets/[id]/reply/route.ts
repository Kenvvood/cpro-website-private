// v22.0 BATCH 28: /api/admin/tickets/[id]/reply 管理员回复 (触发邮件)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addReply, getTicketDetail } from "@/lib/ticket";
import { sendTicketReply } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const adminId = (session?.user as any)?.id as string | undefined;
  const adminName = (session?.user as any)?.name || "客服";
  if (!adminId) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }
  if (userRole !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "需 ADMIN 权限" }, { status: 403 });
  }

  const { id } = await params;
  let body: { content?: string; isInternal?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "body 需 JSON" }, { status: 400 });
  }

  const { content, isInternal = false } = body;
  if (!content) {
    return NextResponse.json({ ok: false, error: "content 必填" }, { status: 400 });
  }

  // 加回复
  const result = await addReply(id, adminId, "ADMIN", content.trim(), isInternal);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  // 内部备注不发邮件
  if (isInternal) {
    return NextResponse.json({ ok: true, newStatus: result.newStatus });
  }

  // 普通回复 → 给工单创建人发邮件
  try {
    const ticket = await getTicketDetail(id, adminId, true);
    if (ticket?.userId) {
      // 找用户 email
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.findUnique({
        where: { id: ticket.userId },
        select: { email: true, username: true },
      });
      if (user?.email) {
        await sendTicketReply(user.email, {
          ticketId: id,
          title: ticket.title,
          reply: content.trim(),
          adminName,
        }).catch((e) => console.error("[admin-ticket-reply] email failed:", e));
      }
    }
  } catch (e) {
    console.error("[admin-ticket-reply] 邮件触发失败 (不影响主流程):", e);
  }

  return NextResponse.json({ ok: true, newStatus: result.newStatus });
}
