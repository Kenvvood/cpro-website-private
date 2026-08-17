// v22.0 BATCH 28: /dashboard/tickets/new 新建工单表单 (Client Component)
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, CATEGORY_LABEL } from "@/lib/ticket-types";

const CATEGORY_DESCR: Record<string, string> = {
  BILLING: "订阅/退款/USDT 支付",
  TECHNICAL: "EA 部署/参数/使用",
  ACCOUNT: "登录/注册/会员",
  PRODUCT: "产品建议/Bug",
  OTHER: "其他咨询",
};

export default function NewTicketPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("TECHNICAL");
  const [priority, setPriority] = useState<string>("NORMAL");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, priority }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "提交失败");
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard/tickets/${data.ticketId}`);
    } catch (err: any) {
      setError(err.message || "网络错误");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard/tickets"
            className="text-sm text-accent-blue hover:underline"
          >
            ← 返回工单列表
          </Link>
        </div>

        <div className="bg-white border border-border rounded-md p-6">
          <h1 className="text-2xl font-bold text-text-primary mb-1">新建工单</h1>
          <p className="text-sm text-text-muted mb-6">
            详细描述问题, 我们 4h 内回复 (URGENT 工单优先)
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                问题分类 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {TICKET_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-3 py-2 border rounded text-sm transition-colors ${
                      category === c
                        ? "border-accent-blue bg-accent-blue/10 text-accent-blue font-medium"
                        : "border-border text-text-secondary hover:border-accent-blue/50"
                    }`}
                  >
                    {CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-1.5">{CATEGORY_DESCR[category]}</p>
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                优先级
              </label>
              <div className="flex gap-2">
                {TICKET_PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1.5 border rounded text-sm transition-colors ${
                      priority === p
                        ? "border-accent-blue bg-accent-blue/10 text-accent-blue font-medium"
                        : "border-border text-text-secondary hover:border-accent-blue/50"
                    }`}
                  >
                    {p === "LOW" && "低"}
                    {p === "NORMAL" && "普通"}
                    {p === "HIGH" && "高"}
                    {p === "URGENT" && "🚨 紧急 (4h)"}
                  </button>
                ))}
              </div>
            </div>

            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                标题 <span className="text-red-500">*</span>{" "}
                <span className="text-xs text-text-muted font-normal">(5-100 字符)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="简短描述问题 (例: 黄金网格 EA 启动报错 4017)"
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent-blue"
                maxLength={100}
                required
              />
              <div className="text-xs text-text-muted mt-1 text-right">
                {title.length} / 100
              </div>
            </div>

            {/* 内容 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                详细描述 <span className="text-red-500">*</span>{" "}
                <span className="text-xs text-text-muted font-normal">(10-5000 字符)</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="详细描述问题: 复现步骤 / 错误信息 / 期望结果 / 已尝试方案..."
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent-blue font-mono"
                rows={10}
                maxLength={5000}
                required
              />
              <div className="text-xs text-text-muted mt-1 text-right">
                {content.length} / 5000
              </div>
            </div>

            {/* 提交 */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "提交中..." : "提交工单"}
              </button>
              <Link href="/dashboard/tickets" className="btn-outline">
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
