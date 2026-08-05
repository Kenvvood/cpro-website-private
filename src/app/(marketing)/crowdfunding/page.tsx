import Link from "next/link";
import { ArrowRight, Clock, Users, TrendingUp, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/layout/footer";

// L4 v1.9 激进档: 众筹列表页 (借 erbotapp cf-card 卡片结构)
// 静态 mock 数据, 简化版上线 (无支付+退款, v1.9 雏形, 完整版 v1.10)
const CAMPAIGNS = [
  {
    slug: "averagingbysignal-pro",
    title: "AveragingBySignal Pro",
    summary: "基于均线 + RSI 信号加仓的均值回归策略，适配 XAUUSD M15",
    platform: "MT4",
    strategyType: "均值回归",
    riskLevel: "高",
    progress: 65,
    raised: 6500,
    target: 10000,
    participants: 38,
    targetPeople: 50,
    crowdPrice: 49,
    directPrice: 99,
    daysLeft: 5,
    status: "众筹中",
  },
  {
    slug: "eurusd-london-breakout",
    title: "EURUSD London Breakout",
    summary: "伦敦开盘区间突破策略，跟随欧洲时段波动，适配 EURUSD H1",
    platform: "MT5",
    strategyType: "趋势突破",
    riskLevel: "中",
    progress: 42,
    raised: 4200,
    target: 10000,
    participants: 21,
    targetPeople: 40,
    crowdPrice: 39,
    directPrice: 79,
    daysLeft: 12,
    status: "众筹中",
  },
  {
    slug: "gbpusd-news-trader",
    title: "GBPUSD News Trader",
    summary: "重大经济数据前后波动策略，专攻非农 / CPI 行情",
    platform: "MT5",
    strategyType: "事件驱动",
    riskLevel: "高",
    progress: 88,
    raised: 8800,
    target: 10000,
    participants: 47,
    targetPeople: 50,
    crowdPrice: 59,
    directPrice: 119,
    daysLeft: 2,
    status: "即将成功",
  },
  {
    slug: "multi-pair-grid",
    title: "Multi-Pair Grid V2",
    summary: "12 品种网格策略，参数自适应 + 动态仓位",
    platform: "MT4",
    strategyType: "网格马丁",
    riskLevel: "中",
    progress: 100,
    raised: 12000,
    target: 12000,
    participants: 60,
    targetPeople: 60,
    crowdPrice: 69,
    directPrice: 139,
    daysLeft: 0,
    status: "众筹成功",
  },
];

export default function CrowdfundingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-12 space-y-12">
        {/* Hero 区块 */}
        <section>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-xs font-semibold border border-border rounded-sm bg-bg-secondary w-fit">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-blue" />
            <span>可验证 EA 联合采购 · 雏形版</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 leading-tight">
            先看真实表现，<br />
            再决定是否<span className="text-accent-blue">参与</span>。
          </h1>
          <p className="text-base text-text-secondary max-w-3xl leading-relaxed">
            观摩账户、回测资料与项目规则公开展示。低价参与联合采购，也可直接单独购买、立即交付。
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-accent-blue" />
              <span>观摩账户验证</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-accent-blue" />
              <span>链上付款留痕</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-accent-blue" />
              <span>成功后站内交付</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-accent-blue" />
              <span>失败可申请退款</span>
            </div>
          </div>
        </section>

        {/* 风险提示 */}
        <section className="card-base p-4 border-l-4 border-accent-gold">
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="text-accent-gold font-semibold">风险提示：</span>
            平台验证证据、付款和交付过程，不承诺 EA 未来盈利。请根据自身风险承受能力参与。
          </p>
        </section>

        {/* 众筹卡片网格 */}
        <section>
          <h2 className="text-xl lg:text-2xl font-semibold text-text-primary mb-6">
            EA 众筹项目（{CAMPAIGNS.length}）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMPAIGNS.map((c) => (
              <Link
                key={c.slug}
                href={`/crowdfunding/${c.slug}`}
                className="card-base p-5 hover:border-border-focus transition-colors group"
              >
                {/* 状态徽章 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-sm font-semibold">
                      {c.platform}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-bg-tertiary text-text-secondary rounded-sm">
                      {c.strategyType}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold ${
                        c.riskLevel === "高"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                      }`}
                    >
                      {c.riskLevel} 风险
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold ${
                      c.progress >= 100
                        ? "bg-accent-up/10 text-accent-up border border-accent-up/20"
                        : c.progress >= 80
                        ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                        : "bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* 标题 + 摘要 */}
                <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-accent-blue">
                  {c.title}
                </h3>
                <p className="text-xs text-text-secondary mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {c.summary}
                </p>

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-gold"
                      style={{ width: `${Math.min(c.progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs">
                    <span className="text-text-primary num font-semibold">
                      {c.raised.toLocaleString()} / {c.target.toLocaleString()} USDT
                    </span>
                    <span className="text-text-muted num">{c.progress}%</span>
                  </div>
                </div>

                {/* 统计 + 价格 */}
                <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      <span className="num">{c.participants} / {c.targetPeople}</span>
                    </span>
                    {c.daysLeft > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        <span className="num">{c.daysLeft} 天</span>
                      </span>
                    )}
                  </div>
                  <span className="text-accent-blue group-hover:underline flex items-center gap-1">
                    <span className="font-semibold num">${c.crowdPrice}</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 单独购买提示 */}
        <section className="card-base p-5 text-center">
          <p className="text-sm text-text-secondary mb-3">
            也可以直接 <span className="text-accent-blue font-semibold">单独购买</span>，付款确认后立即交付，不受众筹结果影响
          </p>
          <Link
            href="/membership"
            className="btn-outline inline-flex items-center gap-2 text-sm"
          >
            <TrendingUp size={14} />
            成为会员享折扣
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
