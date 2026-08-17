// v22.0 BATCH 28: /admin/tickets/[id] 管理员工单详情 + 回复 (含 internal 备注)
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { STATUS_COLOR, PRIORITY_COLOR, CATEGORY_LABEL } from "@/lib/ticket-types";
import type { TicketStatus, TicketPriority, TicketCategory } from "@/lib/ticket-types";

interface TicketReply {
  id: string;
  ticketId: string;
  authorId: string;
  authorRole: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
}

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInternal, setShowInternal] = useState(true);

  async function load() {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      if (data.ok) setTicket(data.ticket);
      else setError(data.error || "加载失败");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply, isInternal }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error);
        return;
      }
      setReply("");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-text-muted">加载中...</div>;
  }
  if (error && !ticket) {
    return (
      <div className="p-12 text-center">
        <div className="text-red-600 mb-2">{error}</div>
        <Link href="/admin/tickets" className="text-accent-blue hover:underline">
          返回工单列表
        </Link>
      </div>
    );
  }
  if (!ticket) return null;

  const statusColor = STATUS_COLOR[ticket.status as TicketStatus];
  const priorityColor = PRIORITY_COLOR[ticket.priority as TicketPriority];
  const visibleReplies = showInternal
    ? ticket.replies
    : ticket.replies.filter((r) => !r.isInternal);

  return (
    <div className="min-h-screen bg-bg-secondary py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/admin/tickets" className="text-sm text-accent-blue hover:underline">
            ← 返回工单列表
          </Link>
          <label className="flex items-center gap-2 text-xs text-text-muted">
            <input
              type="checkbox"
              checked={showInternal}
              onChange={(e) => setShowInternal(e.target.checked)}
              className="rounded"
            />
            <span>显示内部备注 ({ticket.replies.filter((r) => r.isInternal).length})</span>
          </label>
        </div>

        {/* 工单头部 */}
        <div className="bg-white border border-border rounded-md p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-xs text-text-muted">
                  #{ticket.id.slice(-6).toUpperCase()}
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
                  {CATEGORY_LABEL[ticket.category as TicketCategory]}
                </span>
                <span className="text-xs text-text-muted font-mono">
                  user: {ticket.userId}
                </span>
              </div>
              <h1 className="text-xl font-bold text-text-primary">{ticket.title}</h1>
            </div>
            <select
              value={ticket.status}
              onChange={async (e) => {
                if (!confirm(`状态改为 ${e.target.value}?`)) return;
                // 简化: 通过 reply 接口 + close 接口管理, 暂不实现单独状态切换
                alert("请通过发送回复/关闭工单按钮管理状态");
              }}
              className="text-sm border border-border rounded px-2 py-1"
            >
              <option value="OPEN">待回复</option>
              <option value="IN_PROGRESS">处理中</option>
              <option value="WAITING_USER">等用户</option>
              <option value="RESOLVED">已解决</option>
              <option value="CLOSED">已关闭</option>
            </select>
          </div>
          <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed border-t border-border pt-3">
            {ticket.content}
          </p>
          <div className="text-xs text-text-muted mt-3">
            创建于 {new Date(ticket.createdAt).toLocaleString("zh-CN")}
            {ticket.closedAt && (
              <span className="ml-3 text-green-600">
                关闭于 {new Date(ticket.closedAt).toLocaleString("zh-CN")}
              </span>
            )}
          </div>
        </div>

        {/* 回复列表 */}
        {visibleReplies.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary mb-2">
              回复 ({visibleReplies.length})
            </h2>
            <div className="space-y-2">
              {visibleReplies.map((r) => (
                <div
                  key={r.id}
                  className={`bg-white border border-border rounded-md p-4 ${
                    r.authorRole === "ADMIN" ? "border-l-4 border-l-accent-blue" : ""
                  } ${r.isInternal ? "bg-yellow-50/50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          r.authorRole === "ADMIN"
                            ? "bg-accent-blue/10 text-accent-blue"
                            : "bg-bg-tertiary text-text-secondary"
                        }`}
                      >
                        {r.authorRole === "ADMIN" ? "🛡️ 客服" : "👤 用户"}
                      </span>
                      {r.isInternal && (
                        <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                          🔒 内部备注
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">
                      {new Date(r.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                    {r.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 回复框 */}
        <div className="bg-white border border-border rounded-md p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-2">客服回复</h2>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleReply}>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={isInternal ? "内部备注 (仅 admin 可见, 不发邮件)..." : "回复用户 (会自动发邮件)..."}
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent-blue"
              rows={5}
              maxLength={5000}
              disabled={submitting || ticket.status === "CLOSED"}
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  disabled={submitting}
                  className="rounded"
                />
                <span>内部备注 (仅 admin 可见, 不发邮件)</span>
              </label>
              <button
                type="submit"
                disabled={submitting || !reply.trim() || ticket.status === "CLOSED"}
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "发送中..." : isInternal ? "保存备注" : "发送 + 邮件"}
              </button>
            </div>
          </form>
          {ticket.status === "CLOSED" && (
            <div className="mt-3 text-xs text-text-muted text-center">
              此工单已关闭, 无法继续回复
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
