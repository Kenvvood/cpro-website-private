// v22.0 BATCH 28: /api/tickets 列表 + 新建
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createTicket,
  listUserTickets,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
} from "@/lib/ticket";

export const dynamic = "force-dynamic";

// GET /api/tickets - 查当前用户工单列表
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }
  const tickets = await listUserTickets(userId, 50);
  return NextResponse.json({ ok: true, tickets });
}

// POST /api/tickets - 新建工单
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  let body: {
    title?: string;
    content?: string;
    category?: string;
    priority?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "body 需 JSON" }, { status: 400 });
  }

  const { title, content, category, priority } = body;
  if (!title || !content || !category) {
    return NextResponse.json(
      { ok: false, error: "title/content/category 必填" },
      { status: 400 }
    );
  }
  if (!TICKET_CATEGORIES.includes(category as any)) {
    return NextResponse.json(
      { ok: false, error: `category 必为 ${TICKET_CATEGORIES.join("/")} 之一` },
      { status: 400 }
    );
  }
  const priorityValid = priority ? TICKET_PRIORITIES.includes(priority as any) : true;
  if (!priorityValid) {
    return NextResponse.json(
      { ok: false, error: `priority 必为 ${TICKET_PRIORITIES.join("/")} 之一` },
      { status: 400 }
    );
  }

  const result = await createTicket({
    userId,
    title: title.trim(),
    content: content.trim(),
    category: category as any,
    priority: (priority as any) || "NORMAL",
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, ticketId: result.ticketId });
}
