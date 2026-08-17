// v22.0 BATCH 28: /api/admin/tickets 查所有工单 (admin 鉴权)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listAllTickets, getTicketStats, TICKET_STATUSES, TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/lib/ticket";
import type { TicketStatus, TicketCategory, TicketPriority } from "@/lib/ticket";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return { error: "未登录", status: 401 };
  if (userRole !== "ADMIN") return { error: "需 ADMIN 权限", status: 403 };
  return { userId };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as TicketStatus | null;
  const category = searchParams.get("category") as TicketCategory | null;
  const priority = searchParams.get("priority") as TicketPriority | null;

  // 校验枚举
  if (status && !TICKET_STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: `status 无效` }, { status: 400 });
  }
  if (category && !TICKET_CATEGORIES.includes(category)) {
    return NextResponse.json({ ok: false, error: `category 无效` }, { status: 400 });
  }
  if (priority && !TICKET_PRIORITIES.includes(priority)) {
    return NextResponse.json({ ok: false, error: `priority 无效` }, { status: 400 });
  }

  const [tickets, stats] = await Promise.all([
    listAllTickets({
      status: status || undefined,
      category: category || undefined,
      priority: priority || undefined,
      limit: 100,
    }),
    getTicketStats(),
  ]);
  return NextResponse.json({ ok: true, tickets, stats });
}
