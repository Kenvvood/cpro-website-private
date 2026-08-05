import Link from "next/link";
import { ArrowLeft, FileText, Download, RotateCcw } from "lucide-react";
import { Footer } from "@/components/layout/footer";

// L4 v1.9 激进档: 我的众筹页 (借 erbotapp cf-my 结构)
// 静态 mock, 简化版 (无登录态, 直接 mock 当前用户数据)

const MY_ORDERS = [
  {
    id: "ORD-2026-08-001",
    title: "AveragingBySignal Pro",
    slug: "averagingbysignal-pro",
    type: "参与众筹",
    amount: 49,
    network: "TRC20",
    status: "待支付",
    rejectionReason: null,
  },
  {
    id: "ORD-2026-08-002",
    title: "EURUSD London Breakout",
    slug: "eurusd-london-breakout",
    type: "单独购买",
    amount: 79,
    network: "BEP20",
    status: "已支付",
    rejectionReason: null,
  },
  {
    id: "ORD-2026-07-008",
    title: "Multi-Pair Grid V2",
    slug: "multi-pair-grid",
    type: "参与众筹",
    amount: 69,
    network: "TRC20",
    status: "已完成",
    rejectionReason: null,
  },
];

const STATUS_COLOR: Record<string, string> = {
  待支付: "border-accent-gold/30 text-accent-gold",
  已支付: "border-accent-up/30 text-accent-up",
  已完成: "border-accent-blue/30 text-accent-blue",
  审核未通过: "border-red-500/30 text-red-400",
  审核中: "border-accent-blue/30 text-accent-blue",
  已退款: "border-text-muted/30 text-text-muted",
};

export default function MyCrowdfundingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-12 space-y-12">
        {/* 返回链接 */}
        <div>
          <Link
            href="/crowdfunding"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-blue"
          >
            <ArrowLeft size={14} />
            返回众筹列表
          </Link>
        </div>

        {/* 标题 */}
        <section>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-2">
            我的众筹
          </h1>
          <p className="text-sm text-text-secondary">
            众筹订单、单独购买、交付和退款记录均与会员订单独立
          </p>
        </section>

        {/* 风险提示 */}
        <section className="card-base p-4 border-l-4 border-accent-gold">
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="text-accent-gold font-semibold">注：</span>
            v1.9 雏形版仅展示 mock 数据，完整版（含支付、退款、链上验证）将在 v1.10 上线。
          </p>
        </section>

        {/* 订单列表 */}
        <section>
          <h2 className="text-xl lg:text-2xl font-semibold text-text-primary mb-6">
            订单记录（{MY_ORDERS.length}）
          </h2>
          {MY_ORDERS.length === 0 ? (
            <div className="card-base p-12 text-center text-text-muted">
              暂无众筹订单
            </div>
          ) : (
            <div className="card-base overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-bg-secondary">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-text-muted">项目</th>
                      <th className="text-left p-3 text-xs font-semibold text-text-muted">方式</th>
                      <th className="text-left p-3 text-xs font-semibold text-text-muted">金额</th>
                      <th className="text-left p-3 text-xs font-semibold text-text-muted">网络</th>
                      <th className="text-left p-3 text-xs font-semibold text-text-muted">状态</th>
                      <th className="text-left p-3 text-xs font-semibold text-text-muted">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MY_ORDERS.map((o) => (
                      <tr key={o.id} className="border-t border-border">
                        <td className="p-3">
                          <Link
                            href={`/crowdfunding/${o.slug}`}
                            className="text-text-primary hover:text-accent-blue font-semibold"
                          >
                            {o.title}
                          </Link>
                          <div className="text-xs text-text-muted num mt-0.5">
                            {o.id}
                          </div>
                        </td>
                        <td className="p-3 text-text-secondary">{o.type}</td>
                        <td className="p-3 text-text-primary num font-semibold">
                          {o.amount} USDT
                        </td>
                        <td className="p-3 text-text-secondary">{o.network}</td>
                        <td className="p-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-sm border font-semibold ${
                              STATUS_COLOR[o.status] ?? ""
                            }`}
                          >
                            {o.status}
                          </span>
                          {o.rejectionReason && (
                            <div className="text-xs text-red-400 mt-1">
                              {o.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {o.status === "待支付" && (
                              <button className="btn-outline text-xs px-3 py-1.5 inline-flex items-center gap-1">
                                <FileText size={12} />
                                提交交易哈希
                              </button>
                            )}
                            {o.status === "已完成" && (
                              <button className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1">
                                <Download size={12} />
                                下载 EA
                              </button>
                            )}
                            {o.status === "已支付" && o.type === "参与众筹" && (
                              <button className="text-xs text-red-400 hover:underline inline-flex items-center gap-1">
                                <RotateCcw size={12} />
                                申请退款
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 创作者申请引导 */}
        <section className="card-base p-5 text-center">
          <p className="text-sm text-text-secondary mb-3">
            您有优质 EA 想发起众筹？<Link href="/creator/apply" className="text-accent-blue hover:underline">申请成为创作者</Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
