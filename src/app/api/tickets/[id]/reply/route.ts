// v22.0 BATCH 28: /api/tickets/[id]/reply 用户回复
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addReply, getTicketDetail } from "@/lib/ticket";
import { prisma } from "@/lib/prisma";
import { sendTicketReply } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  let body: { content?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "body 需 JSON" }, { status: 400 });
  }

  const { content } = body;
  if (!content) {
    return NextResponse.json({ ok: false, error: "content 必填" }, { status: 400 });
  }

  const result = await addReply(id, userId, "USER", content.trim());
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  // 触发管理员邮件 (查工单 + 用户, 给所有 ADMIN 发)
  try {
    const ticket = await getTicketDetail(id, userId, false);
    if (ticket) {
      // 找所有 admin email
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true, username: true },
      });
      for (const admin of admins) {
        if (admin.email) {
          await sendTicketReply(admin.email, {
            ticketId: id,
            title: ticket.title,
            reply: content.trim(),
            adminName: ticket.userId === userId ? "用户回复" : admin.username || "Admin",
          }).catch((e) => console.error("[ticket-reply] email failed:", e));
        }
      }
    }
  } catch (e) {
    console.error("[ticket-reply] 邮件触发失败 (不影响主流程):", e);
  }

  return NextResponse.json({ ok: true, newStatus: result.newStatus });
}
