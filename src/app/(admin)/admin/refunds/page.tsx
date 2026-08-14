// (admin)/admin/refunds/page.tsx — Admin 退款审批面板 (v22.0 Phase 7.24 BATCH 15 PATCH 10)
// PM 拍板 2026-08-13: admin 实际审批 UI
// - Server component 列表
// - 客户端 RefundReviewActions 通过/拒绝
// - 跟 admin 已有的 tabs/stats 风格对齐 (dark theme + 紧凑)
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { RefreshCw, CheckCircle2, XCircle, Clock, Search, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { RefundReviewActions } from './RefundReviewActions';

export const dynamic = 'force-dynamic';

type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

const STATUS_LABEL: Record<RefundStatus | 'ALL', string> = {
  ALL: '全部',
  PENDING: '待审批',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
  COMPLETED: '已退款',
};

const STATUS_COLOR: Record<RefundStatus, string> = {
  PENDING: 'bg-accent-blue/20 text-accent-blue',
  APPROVED: 'bg-accent-up/20 text-accent-up',
  REJECTED: 'bg-red-500/20 text-red-400',
  COMPLETED: 'bg-accent-gold/20 text-accent-gold',
};

const STATUS_ICON: Record<RefundStatus, React.ReactNode> = {
  PENDING: <Clock size={12} />,
  APPROVED: <CheckCircle2 size={12} />,
  REJECTED: <XCircle size={12} />,
  COMPLETED: <RefreshCw size={12} />,
};

interface SearchParams {
  status?: string;
  search?: string;
  page?: string;
}

export default async function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const params = await searchParams;
  const status = (params.status as RefundStatus | 'ALL') || 'PENDING';
  const search = params.search || '';
  const page = Math.max(parseInt(params.page || '1', 10), 1);
  const pageSize = 20;

  const where: any = {};
  if (status !== 'ALL') where.status = status;
  if (search) {
    where.OR = [
      { order: { orderNo: { contains: search, mode: 'insensitive' } } },
      { user: { username: { contains: search, mode: 'insensitive' } } },
      { user: { phone: { contains: search } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [refunds, total, stats] = await Promise.all([
    prisma.refund.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        order: { select: { orderNo: true, plan: true, amount: true, paidAt: true, durationDays: true } },
      },
    }),
    prisma.refund.count({ where }),
    prisma.refund.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  // Refund schema 无 user relation, 单独查
  const userIds = Array.from(new Set(refunds.map((r) => r.userId)));
  const users = userIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, phone: true, email: true },
      })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const statsMap: Record<string, number> = {};
  stats.forEach((s) => { statsMap[s.status] = s._count.status; });

  const totalPages = Math.ceil(total / pageSize);
  const hasRefunds = refunds.length > 0;

  return (
    <div className="space-y-6">
      {/* 顶部 Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="h2 text-gray-100 flex items-center gap-2">
            <RefreshCw size={20} className="text-accent" />
            退款审批
          </h1>
          <p className="text-xs text-text-muted mt-1">
            处理用户退款申请 · 阶梯自动卡住白嫖 · 链上 USDT 结算
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 border border-accent-blue/30 bg-accent-blue/5 rounded text-accent-blue">
            待审批 <span className="font-bold ml-1">{statsMap.PENDING || 0}</span>
          </div>
          <div className="px-3 py-1.5 border border-accent-up/30 bg-accent-up/5 rounded text-accent-up">
            已通过 <span className="font-bold ml-1">{statsMap.APPROVED || 0}</span>
          </div>
          <div className="px-3 py-1.5 border border-red-500/30 bg-red-500/5 rounded text-red-400">
            已拒绝 <span className="font-bold ml-1">{statsMap.REJECTED || 0}</span>
          </div>
        </div>
      </header>

      {/* 筛选 Tab */}
      <div className="flex items-center gap-1 border-b border-border">
        {(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'ALL'] as const).map((s) => {
          const active = status === s;
          const count = s === 'ALL' ? Object.values(statsMap).reduce((a, b) => a + b, 0) : statsMap[s] || 0;
          return (
            <Link
              key={s}
              href={{ pathname: '/admin/refunds', query: { ...params, status: s, page: 1 } }}
              className={`px-4 py-2.5 text-xs font-medium transition-colors relative ${
                active
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {STATUS_LABEL[s]} <span className="text-text-muted ml-1">({count})</span>
              {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
            </Link>
          );
        })}
      </div>

      {/* 搜索栏 */}
      <form className="flex items-center gap-3" action="/admin/refunds">
        <input type="hidden" name="status" value={status} />
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="搜索订单号 / 用户名 / 手机号 / 邮箱..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded bg-bg-card border border-border text-gray-100 placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-medium bg-accent text-bg-primary rounded hover:opacity-90"
        >
          搜索
        </button>
        {search && (
          <Link
            href={{ pathname: '/admin/refunds', query: { status } }}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            清除
          </Link>
        )}
      </form>

      {/* 列表 */}
      {hasRefunds ? (
        <div className="space-y-3">
          {refunds.map((r) => {
            const age = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            const isStale = r.status === 'PENDING' && age >= 7;
            return (
              <div
                key={r.id}
                className={`card-base p-4 ${isStale ? 'border-red-500/40' : ''}`}
              >
                <div className="grid grid-cols-12 gap-4">
                  {/* 左: 订单 + 用户 (col-span-4) */}
                  <div className="col-span-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 ${STATUS_COLOR[r.status as RefundStatus]}`}>
                        {STATUS_ICON[r.status as RefundStatus]}
                        {STATUS_LABEL[r.status as RefundStatus]}
                      </span>
                      {isStale && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 inline-flex items-center gap-1">
                          <AlertCircle size={10} /> {age} 天未处理
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm text-gray-100">{r.order.orderNo}</div>
                    <div className="text-xs text-text-muted space-y-0.5">
                      <div>👤 {(() => { const u = userMap.get(r.userId); return u ? (u.username || u.phone || u.email || u.id.slice(0, 8)) : r.userId.slice(0, 8); })()}</div>
                      <div className="num">¥{Number(r.order.amount).toFixed(2)} / {r.order.durationDays} 天 · {r.order.plan}</div>
                      <div className="num text-text-muted text-[10px]">
                        支付 {new Date(r.order.paidAt!).toLocaleString('zh-CN', { hour12: false })}
                      </div>
                    </div>
                  </div>

                  {/* 中: 阶梯 (col-span-4) */}
                  <div className="col-span-4 space-y-2">
                    <div className="text-[10px] text-text-muted uppercase tracking-wider">阶梯计算 (min 规则)</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 border border-border rounded">
                        <div className="text-text-muted text-[10px] mb-0.5">⏱ 时间档</div>
                        <div className="flex items-center justify-between">
                          <span className="num text-text-secondary">{r.timeBucket} 天</span>
                          <span className="num font-semibold text-text-primary">退 {r.timeRefundPct}%</span>
                        </div>
                      </div>
                      <div className="p-2 border border-border rounded">
                        <div className="text-text-muted text-[10px] mb-0.5">📦 下载档</div>
                        <div className="flex items-center justify-between">
                          <span className="num text-text-secondary">{r.downloadBucket}</span>
                          <span className="num font-semibold text-text-primary">退 {r.downloadRefundPct}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded bg-accent-up/10 border border-accent-up/30 flex items-center justify-between">
                      <span className="text-xs text-accent-up">实际退款</span>
                      <span className="text-sm font-bold num text-accent-up">
                        {r.actualRefundPct}% · ¥{Number(r.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted">
                      申请时累计下载 <span className="num text-text-primary">{r.refundedCount}</span> 个资源
                    </div>
                  </div>

                  {/* 右: 理由 + 操作 (col-span-4) */}
                  <div className="col-span-4 space-y-2">
                    <div className="text-[10px] text-text-muted uppercase tracking-wider">退款理由</div>
                    <div className="text-xs text-text-primary leading-relaxed bg-bg-tertiary p-2 rounded max-h-16 overflow-y-auto">
                      {r.reason}
                    </div>
                    {r.status === 'PENDING' ? (
                      <RefundReviewActions refundId={r.id} />
                    ) : (
                      <div className="text-[10px] text-text-muted pt-1 border-t border-border space-y-0.5">
                        {r.txHash && <div className="num">Tx: {r.txHash.slice(0, 14)}…{r.txHash.slice(-6)}</div>}
                        {r.adminNote && <div>备注: {r.adminNote}</div>}
                        {r.processedAt && (
                          <div className="num">{new Date(r.processedAt).toLocaleString('zh-CN', { hour12: false })}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-base p-12 text-center text-text-muted text-sm">
          <CheckCircle2 size={32} className="mx-auto mb-3 text-accent-up opacity-50" />
          {search ? `没有找到匹配 "${search}" 的退款记录` : `${STATUS_LABEL[status as RefundStatus | 'ALL']} 列表为空`}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div>
            共 <span className="text-text-primary num">{total}</span> 条 ·
            第 <span className="text-text-primary num">{page}</span> / {totalPages} 页
          </div>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={{ pathname: '/admin/refunds', query: { ...params, page: page - 1 } }}
                className="px-3 py-1.5 border border-border rounded hover:border-accent"
              >
                上一页
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{ pathname: '/admin/refunds', query: { ...params, page: page + 1 } }}
                className="px-3 py-1.5 border border-border rounded hover:border-accent inline-flex items-center gap-1"
              >
                下一页 <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
