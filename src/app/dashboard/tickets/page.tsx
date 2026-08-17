// v22.0 BATCH 28: /dashboard/tickets 用户工单列表
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TicketStatus, TicketPriority, TicketCategory, STATUS_COLOR, PRIORITY_COLOR, CATEGORY_LABEL } from "@/lib/ticket";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "我的工单 - 客服支持 | CProTrading 城诺科技",
  description: "查看我提交的工单状态、回复和管理员处理进度。",
  path: "/dashboard/tickets",
  keywords: ["工单", "客服", "支持", "CProTrading"],
});

export const dynamic = "force-dynamic";

export default async function MyTicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?redirect=/dashboard/tickets");
  }
  const userId = (session.user as any).id as string;

  const tickets = await prisma.ticket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { _count: { select: { replies: true } } },
  });

  return (
    <div className="min-h-screen bg-bg-secondary py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">我的工单</h1>
            <p className="text-sm text-text-muted mt-1">提交问题、查看回复、管理工单状态</p>
          </div>
          <Link
            href="/dashboard/tickets/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <span>+ 新建工单</span>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white border border-border rounded-md p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">还没有工单</h2>
            <p className="text-sm text-text-muted mb-4">
              遇到问题? 创建第一个工单, 我们 4h 内回复
            </p>
            <Link
              href="/dashboard/tickets/new"
              className="btn-primary inline-flex items-center gap-2"
            >
              + 新建工单
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-md overflow-hidden">
            {tickets.map((t, i) => {
              const statusColor = STATUS_COLOR[t.status as TicketStatus];
              const priorityColor = PRIORITY_COLOR[t.priority as TicketPriority];
              return (
                <Link
                  key={t.id}
                  href={`/dashboard/tickets/${t.id}`}
                  className={`block px-4 py-4 hover:bg-bg-secondary transition-colors ${
                    i < tickets.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-text-muted">
                          #{t.id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                        >
                          {statusColor.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${priorityColor.bg} ${priorityColor.text}`}
                        >
                          {priorityColor.label}
                        </span>
                        <span className="text-xs text-text-muted">
                          {CATEGORY_LABEL[t.category as TicketCategory]}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary line-clamp-1">
                        {t.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-1 line-clamp-1">
                        {t.content.slice(0, 100)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-text-muted">
                        {new Date(t.updatedAt).toLocaleString("zh-CN", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-xs text-accent-purple mt-1">
                        💬 {t._count.replies} 回复
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
