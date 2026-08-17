// v22.0 BATCH 28: /admin/tickets 管理员工单列表
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TicketStatus, TicketPriority, TicketCategory, STATUS_COLOR, PRIORITY_COLOR, CATEGORY_LABEL } from "@/lib/ticket";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "工单管理 - 客服支持后台 | CProTrading",
  description: "管理员查看所有用户工单、回复、关闭工单。",
  path: "/admin/tickets",
});

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?redirect=/admin/tickets");
  }
  if ((session.user as any).role !== "ADMIN") {
    return (
      <div className="p-12 text-center">
        <div className="text-red-600 text-lg">403 - 需要 ADMIN 权限</div>
        <Link href="/" className="text-accent-blue hover:underline mt-2 inline-block">
          返回首页
        </Link>
      </div>
    );
  }

  // 统计
  const [open, inProgress, waitingUser, resolved, closed, total] = await Promise.all([
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: "WAITING_USER" } }),
    prisma.ticket.count({ where: { status: "RESOLVED" } }),
    prisma.ticket.count({ where: { status: "CLOSED" } }),
    prisma.ticket.count(),
  ]);

  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      _count: { select: { replies: true } },
      // 用户信息 (看是谁开的工单)
    },
  });

  return (
    <div className="min-h-screen bg-bg-secondary py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">🎫 工单管理</h1>
          <p className="text-sm text-text-muted mt-1">查看所有用户工单, 回复并管理状态</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
          <StatCard label="总计" value={total} color="text-text-primary" />
          <StatCard label="待回复" value={open} color="text-blue-600" />
          <StatCard label="处理中" value={inProgress} color="text-yellow-600" />
          <StatCard label="等用户" value={waitingUser} color="text-purple-600" />
          <StatCard label="已解决" value={resolved} color="text-green-600" />
          <StatCard label="已关闭" value={closed} color="text-gray-600" />
        </div>

        {/* 列表 */}
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-12 text-center text-text-muted">还没有工单</div>
          ) : (
            tickets.map((t, i) => {
              const statusColor = STATUS_COLOR[t.status as TicketStatus];
              const priorityColor = PRIORITY_COLOR[t.priority as TicketPriority];
              return (
                <Link
                  key={t.id}
                  href={`/admin/tickets/${t.id}`}
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
                        <span className="text-xs text-text-muted font-mono">
                          user: {t.userId.slice(-6)}
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
                        💬 {t._count.replies}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-border rounded-md p-3">
      <div className="text-xs text-text-muted">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
