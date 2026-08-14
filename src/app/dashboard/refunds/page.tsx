// /dashboard/refunds/page.tsx — 订阅退款 (v22.0 Phase 7.24 Batch 14B)
// PM 拍板 2026-08-12:
//   - 5 档时间阶梯: 0-3=100 / 4-7=70 / 8-15=40 / 16-30=20 / 30+=0
//   - 4 档下载门槛: 0=100 / 1-3=70 / 4+=50 / 8+=0
//   - 实际退款比例 = min(时间档, 下载档)
//   - 不冻结账号, 走阶梯自动卡住

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle, Check, X, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calcRefund, REFUND_RULES_DESCRIPTION } from '@/lib/refundPolicy';
import { RefundActions } from './RefundActions';

export const dynamic = 'force-dynamic';

interface EligibleOrder {
  id: string;
  orderNo: string;
  amount: number;
  paidAt: Date;
  plan: string;
  durationDays: number;
  downloadCount: number;
  calculation: ReturnType<typeof calcRefund>;
}

async function getEligibleOrders(userId: string, downloadCount: number): Promise<EligibleOrder[]> {
  // CONFIRMED + 没退过的订单, 按 paidAt 倒序
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: 'CONFIRMED',
      paidAt: { not: null },
      refunds: { none: {} },
    },
    orderBy: { paidAt: 'desc' },
    take: 10,
  });

  return orders.map((o) => {
    const orderAmount = Number(o.amount);
    const calc = calcRefund(o.paidAt!, orderAmount, downloadCount);
    return {
      id: o.id,
      orderNo: o.orderNo,
      amount: orderAmount,
      paidAt: o.paidAt!,
      plan: o.plan,
      durationDays: o.durationDays,
      downloadCount,
      calculation: calc,
    };
  });
}

export default async function RefundsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?redirect=/dashboard/refunds');
  }
  const userId = session.user.id;

  // 累计下载量
  const downloadCount = await prisma.downloadRecord.count({ where: { userId } });

  // 可退订单 + 阶梯计算
  const eligibleOrders = await getEligibleOrders(userId, downloadCount);

  // 我的退款记录
  const refunds = await prisma.refund.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      order: { select: { orderNo: true, plan: true, durationDays: true } },
    },
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pt-2 sm:pt-12 lg:pt-14">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-base font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            订阅退款
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 说明卡片 (顶部) */}
        <section className="p-4 border border-accent-blue/30 bg-accent-blue/5 rounded text-sm">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-accent-blue mt-0.5 shrink-0" />
            <div className="space-y-1 text-text-muted text-xs leading-relaxed">
              <p>订阅会员可在 30 天内申请退款, 实际退款比例按 <strong className="text-text-primary">时间档 + 下载档</strong> 双重阶梯计算, 取 <strong className="text-text-primary">min(时间档%, 下载档%)</strong>。</p>
              <p>累计下载 <strong className="text-text-primary">{downloadCount}</strong> 个资源。退订后 <strong className="text-text-primary">不冻结账号</strong>, 但下载量累计计算, 重复退订会被阶梯自动锁死。</p>
            </div>
          </div>
        </section>

        {/* 1. 可退款订单 */}
        <section>
          <h2 className="text-sm font-semibold mb-3 text-text-primary">可退款的订单</h2>
          {eligibleOrders.length === 0 ? (
            <div className="p-6 border border-border bg-bg-secondary rounded text-center text-text-muted text-sm">
              暂无可退款的订单 (已退过 或 没有 CONFIRMED 订单)
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleOrders.map((o) => {
                const c = o.calculation;
                const eligible = c.actualPct > 0;
                return (
                  <div
                    key={o.id}
                    className={`p-4 border rounded ${
                      eligible
                        ? 'border-border bg-bg-secondary'
                        : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-text-primary num">{o.orderNo}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-blue/20 text-accent-blue">
                          {o.plan}
                        </span>
                        <span className="text-xs text-text-muted num">
                          ¥{o.amount.toFixed(2)} / {o.durationDays} 天
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted num">
                        {new Date(o.paidAt).toLocaleString('zh-CN', { hour12: false })}
                      </span>
                    </div>

                    {/* 阶梯计算 */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="p-2 border border-border rounded">
                        <div className="text-text-muted text-[10px] mb-1">⏱ 时间档</div>
                        <div className="flex items-center justify-between">
                          <span className="num">{c.timeBucket} 天</span>
                          <span className="font-semibold text-text-primary num">退 {c.timePct}%</span>
                        </div>
                      </div>
                      <div className="p-2 border border-border rounded">
                        <div className="text-text-muted text-[10px] mb-1">📦 下载档</div>
                        <div className="flex items-center justify-between">
                          <span className="num">{o.downloadCount} 个</span>
                          <span className="font-semibold text-text-primary num">退 {c.downloadPct}%</span>
                        </div>
                      </div>
                    </div>

                    {/* 实际退款结果 */}
                    <div className={`p-3 rounded mb-3 ${eligible ? 'bg-accent-up/10 border border-accent-up/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className={eligible ? 'text-accent-up' : 'text-red-500'}>
                          实际退款 <strong className="num">{c.actualPct}%</strong>
                        </span>
                        <span className={`font-bold num ${eligible ? 'text-accent-up' : 'text-red-500'}`}>
                          ¥{c.refundAmount.toFixed(2)} / ¥{c.orderAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {eligible ? (
                      <RefundActions
                        orderId={o.id}
                        orderNo={o.orderNo}
                        refundAmount={c.refundAmount}
                        actualPct={c.actualPct}
                      />
                    ) : (
                      <div className="text-xs text-red-500 text-center">
                        ⚠ 已超出退款窗口, 无法申请 (时间 30+ 天 / 下载 8+ 个)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. 我的退款记录 */}
        <section>
          <h2 className="text-sm font-semibold mb-3 text-text-primary">我的退款记录</h2>
          {refunds.length === 0 ? (
            <div className="p-6 border border-border bg-bg-secondary rounded text-center text-text-muted text-sm">
              暂无退款记录
            </div>
          ) : (
            <div className="border border-border bg-bg-secondary rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-bg-tertiary">
                  <tr>
                    <th className="px-3 py-2 text-left text-text-muted font-semibold">订单号</th>
                    <th className="px-3 py-2 text-left text-text-muted font-semibold">金额</th>
                    <th className="px-3 py-2 text-left text-text-muted font-semibold">阶梯</th>
                    <th className="px-3 py-2 text-left text-text-muted font-semibold">状态</th>
                    <th className="px-3 py-2 text-left text-text-muted font-semibold">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-3 py-2 num text-text-primary">{r.order.orderNo}</td>
                      <td className="px-3 py-2 num text-text-primary">¥{Number(r.amount).toFixed(2)}</td>
                      <td className="px-3 py-2 num text-text-muted text-[10px]">
                        {r.timeBucket} → {r.timeRefundPct}% / {r.downloadBucket} → {r.downloadRefundPct}% / <strong className="text-text-primary">{r.actualRefundPct}%</strong>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          r.status === 'PENDING' ? 'bg-accent-blue/20 text-accent-blue' :
                          r.status === 'APPROVED' || r.status === 'COMPLETED' ? 'bg-accent-up/20 text-accent-up' :
                          r.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                          'bg-text-muted/20 text-text-muted'
                        }`}>
                          {r.status === 'PENDING' ? '审批中' :
                           r.status === 'APPROVED' ? '已通过' :
                           r.status === 'COMPLETED' ? '已退款' :
                           r.status === 'REJECTED' ? '已拒绝' : r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 num text-text-muted text-[10px]">
                        {new Date(r.createdAt).toLocaleString('zh-CN', { hour12: false })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 3. 退款规则 (折叠) */}
        <details className="p-4 border border-border bg-bg-secondary rounded">
          <summary className="cursor-pointer text-sm font-semibold text-text-primary flex items-center gap-2">
            <Info className="w-4 h-4" />
            退款规则说明 (5 档时间 + 4 档下载 + min 规则)
          </summary>
          <pre className="mt-3 text-xs text-text-muted whitespace-pre-wrap leading-relaxed font-sans">
            {REFUND_RULES_DESCRIPTION}
          </pre>
        </details>
      </main>
    </div>
  );
}
