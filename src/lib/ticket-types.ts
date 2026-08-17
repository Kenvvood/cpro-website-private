// v22.0 BATCH 28: 工单系统类型 + 常量 (Client Component 安全)
// server-only 逻辑在 lib/ticket.ts, 这里只放纯类型/常量
// Client Component (dashboard/tickets/new) 可直接 import

export const TICKET_CATEGORIES = ["BILLING", "TECHNICAL", "ACCOUNT", "PRODUCT", "OTHER"] as const;
export const TICKET_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_USER", "RESOLVED", "CLOSED"] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const STATUS_COLOR: Record<TicketStatus, { bg: string; text: string; label: string }> = {
  OPEN: { bg: "bg-blue-100", text: "text-blue-700", label: "待回复" },
  IN_PROGRESS: { bg: "bg-yellow-100", text: "text-yellow-700", label: "处理中" },
  WAITING_USER: { bg: "bg-purple-100", text: "text-purple-700", label: "等您回复" },
  RESOLVED: { bg: "bg-green-100", text: "text-green-700", label: "已解决" },
  CLOSED: { bg: "bg-gray-100", text: "text-gray-600", label: "已关闭" },
};

export const PRIORITY_COLOR: Record<TicketPriority, { bg: string; text: string; label: string }> = {
  LOW: { bg: "bg-gray-100", text: "text-gray-600", label: "低" },
  NORMAL: { bg: "bg-blue-50", text: "text-blue-600", label: "普通" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-700", label: "高" },
  URGENT: { bg: "bg-red-100", text: "text-red-700", label: "紧急" },
};

export const CATEGORY_LABEL: Record<TicketCategory, string> = {
  BILLING: "订阅/退款",
  TECHNICAL: "EA 技术",
  ACCOUNT: "账号问题",
  PRODUCT: "产品建议",
  OTHER: "其他",
};
