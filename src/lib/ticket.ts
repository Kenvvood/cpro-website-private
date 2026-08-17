// v22.0 BATCH 28 (2026-08-17 11:40): 工单系统核心库 (server-only)
// 用户端: 创建/查自己/回复/关闭
// 管理员端: 查所有/回复(触发邮件)
//
// 类型/常量已拆到 ./ticket-types (client-safe, 供 "use client" 页面 import)
import "server-only";
import { prisma } from "@/lib/prisma";

// 重导出类型/常量 (供 server-side 调用方便, 实际 client-side 用 ticket-types)
export {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  STATUS_COLOR,
  PRIORITY_COLOR,
  CATEGORY_LABEL,
} from "./ticket-types";
export type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "./ticket-types";

export interface CreateTicketInput {
  userId: string;
  title: string;
  content: string;
  category: import("./ticket-types").TicketCategory;
  priority?: import("./ticket-types").TicketPriority;
}

export interface CreateTicketResult {
  ok: boolean;
  ticketId?: string;
  error?: string;
}

// ---- 创建工单 (用户) ----
export async function createTicket(input: CreateTicketInput): Promise<CreateTicketResult> {
  const { userId, title, content, category, priority = "NORMAL" } = input;

  if (!title || title.length < 5 || title.length > 100) {
    return { ok: false, error: "标题需 5-100 字符" };
  }
  if (!content || content.length < 10 || content.length > 5000) {
    return { ok: false, error: "内容需 10-5000 字符" };
  }
  if (!["BILLING", "TECHNICAL", "ACCOUNT", "PRODUCT", "OTHER"].includes(category)) {
    return { ok: false, error: `分类无效: ${category}` };
  }
  if (!["LOW", "NORMAL", "HIGH", "URGENT"].includes(priority)) {
    return { ok: false, error: `优先级无效: ${priority}` };
  }

  // 限流: 每用户 1h 最多 5 个新工单 (防 spam)
  const oneHourAgo = new Date(Date.now() - 3600_000);
  const recentCount = await prisma.ticket.count({
    where: { userId, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= 5) {
    return { ok: false, error: "1 小时内最多 5 个工单, 请稍后再开" };
  }

  const ticket = await prisma.ticket.create({
    data: { userId, title, content, category, priority, status: "OPEN" },
    select: { id: true },
  });

  return { ok: true, ticketId: ticket.id };
}

// ---- 查用户工单列表 ----
export async function listUserTickets(userId: string, limit = 20) {
  return prisma.ticket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      _count: { select: { replies: true } },
    },
  });
}

// ---- 查工单详情 (含回复) ----
export async function getTicketDetail(ticketId: string, viewerId: string, isAdmin: boolean) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      replies: {
        where: isAdmin ? undefined : { isInternal: false },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!ticket) return null;
  // 用户只能看自己的工单
  if (!isAdmin && ticket.userId !== viewerId) return null;
  return ticket;
}

// ---- 用户/管理员回复 ----
export async function addReply(
  ticketId: string,
  authorId: string,
  authorRole: "USER" | "ADMIN",
  content: string,
  isInternal = false
): Promise<{ ok: boolean; error?: string; newStatus?: import("./ticket-types").TicketStatus }> {
  if (!content || content.length < 1 || content.length > 5000) {
    return { ok: false, error: "内容需 1-5000 字符" };
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false, error: "工单不存在" };
  if (ticket.status === "CLOSED") return { ok: false, error: "工单已关闭" };

  await prisma.ticketReply.create({
    data: { ticketId, authorId, authorRole, content, isInternal },
  });

  // 状态机:
  //  - 用户回复 → IN_PROGRESS (待管理员继续)
  //  - 管理员普通回复 → WAITING_USER
  //  - 管理员内部备注 → 不变
  let newStatus: import("./ticket-types").TicketStatus | undefined;
  if (isInternal) {
    newStatus = undefined; // 不动
  } else if (authorRole === "USER") {
    newStatus = "IN_PROGRESS";
  } else {
    newStatus = "WAITING_USER";
  }

  if (newStatus && newStatus !== ticket.status) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: newStatus, updatedAt: new Date() },
    });
  } else {
    // 即使 status 不变, 也更新 updatedAt 让列表置顶
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });
  }

  return { ok: true, newStatus };
}

// ---- 关闭工单 ----
export async function closeTicket(
  ticketId: string,
  closedBy: string,
  isAdmin: boolean
): Promise<{ ok: boolean; error?: string }> {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false, error: "工单不存在" };
  if (ticket.status === "CLOSED") return { ok: false, error: "工单已关闭" };
  if (!isAdmin && ticket.userId !== closedBy) return { ok: false, error: "无权限关闭" };

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "CLOSED", closedAt: new Date(), closedBy },
  });
  return { ok: true };
}

// ---- 管理员查所有工单 ----
export async function listAllTickets(filter?: {
  status?: import("./ticket-types").TicketStatus;
  category?: import("./ticket-types").TicketCategory;
  priority?: import("./ticket-types").TicketPriority;
  limit?: number;
}) {
  return prisma.ticket.findMany({
    where: {
      ...(filter?.status && { status: filter.status }),
      ...(filter?.category && { category: filter.category }),
      ...(filter?.priority && { priority: filter.priority }),
    },
    orderBy: { updatedAt: "desc" },
    take: filter?.limit ?? 50,
    include: {
      _count: { select: { replies: true } },
    },
  });
}

// ---- 统计 (admin dashboard) ----
export async function getTicketStats() {
  const [open, inProgress, waitingUser, resolved, closed, total] = await Promise.all([
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: "WAITING_USER" } }),
    prisma.ticket.count({ where: { status: "RESOLVED" } }),
    prisma.ticket.count({ where: { status: "CLOSED" } }),
    prisma.ticket.count(),
  ]);
  return { open, inProgress, waitingUser, resolved, closed, total };
}
