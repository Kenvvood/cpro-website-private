import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Users, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";

// L4 v1.9 激进档: 众筹详情页 (借 erbotapp cf-detail 结构)
// 静态 mock, 简化版

const CAMPAIGNS: Record<string, {
  title: string;
  summary: string;
  description: string;
  platform: string;
  strategyType: string;
  riskLevel: string;
  progress: number;
  raised: number;
  target: number;
  participants: number;
  targetPeople: number;
  crowdPrice: number;
  directPrice: number;
  daysLeft: number;
  broker: string;
  server: string;
  accountType: string;
  accountNature: string;
}> = {
  "averagingbysignal-pro": {
    title: "AveragingBySignal Pro",
    summary: "基于均线 + RSI 信号加仓的均值回归策略，适配 XAUUSD M15",
    description: "策略核心：识别 XAUUSD M15 周期上均线 + RSI 双信号共振点，按信号强度动态加仓。风控：单笔最大亏损 2%，日最大回撤 5%，达到上限自动停止加仓。回测：2018-2024 年 XAUUSD 真实数据，年化收益 38%，最大回撤 12%，胜率 62%。",
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
    broker: "IC Markets",
    server: "IC Markets-Live06",
    accountType: "ECN Standard",
    accountNature: "实盘账户",
  },
  "eurusd-london-breakout": {
    title: "EURUSD London Breakout",
    summary: "伦敦开盘区间突破策略，跟随欧洲时段波动，适配 EURUSD H1",
    description: "策略核心：识别伦敦开盘 8:00-10:00 GMT 区间，区间突破后顺势开仓。风控：固定止损 50 pips，移动止盈 80 pips。回测：2019-2024 年 EURUSD 真实数据，年化收益 24%，最大回撤 8%，胜率 58%。",
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
    broker: "Pepperstone",
    server: "Pepperstone-Live",
    accountType: "Razor Account",
    accountNature: "实盘账户",
  },
  "gbpusd-news-trader": {
    title: "GBPUSD News Trader",
    summary: "重大经济数据前后波动策略，专攻非农 / CPI 行情",
    description: "策略核心：在重大经济数据发布前 30 分钟布设双向挂单，发布后 5 分钟内任意方向触发即平仓反向单。风控：单次最大亏损 1%，月最大回撤 6%。回测：2020-2024 年 GBPUSD 真实数据，年化收益 31%，最大回撤 9%，胜率 71%。",
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
    broker: "XM",
    server: "XM-Real 17",
    accountType: "XM Ultra Low",
    accountNature: "实盘账户",
  },
  "multi-pair-grid": {
    title: "Multi-Pair Grid V2",
    summary: "12 品种网格策略，参数自适应 + 动态仓位",
    description: "策略核心：在 12 个主要货币对上布设网格，参数根据近 30 天波动率自动调整，仓位根据账户余额动态缩放。风控：单品种最大持仓 3 层，全账户最大回撤 10%。回测：2018-2024 年多品种真实数据，年化收益 28%，最大回撤 7%，胜率 78%。",
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
    broker: "FBS",
    server: "FBS-Real-9",
    accountType: "Pro Account",
    accountNature: "实盘账户",
  },
};

export function generateStaticParams() {
  return Object.keys(CAMPAIGNS).map((slug) => ({ slug }));
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = CAMPAIGNS[slug];
  if (!c) notFound();

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

        {/* 项目详情 + 购买卡 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左: 项目信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 标签 + 标题 */}
            <div>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-xs px-2 py-0.5 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-sm font-semibold">
                  {c.platform}
                </span>
                <span className="text-xs px-2 py-0.5 bg-bg-tertiary text-text-secondary rounded-sm">
                  {c.strategyType}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-sm font-semibold ${
                    c.riskLevel === "高"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                  }`}
                >
                  {c.riskLevel} 风险
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 leading-tight">
                {c.title}
              </h1>
              <p className="text-base text-text-secondary leading-relaxed">
                {c.summary}
              </p>
            </div>

            {/* 项目说明 */}
            <div className="card-base p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                项目详细说明
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {c.description}
              </p>
            </div>

            {/* 观摩账户信息 */}
            <div className="card-base p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-accent-blue" />
                观摩账户信息
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-text-muted mb-1">经纪商</dt>
                  <dd className="text-text-primary font-semibold">{c.broker}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted mb-1">服务器</dt>
                  <dd className="text-text-primary font-semibold">{c.server}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted mb-1">账户类型</dt>
                  <dd className="text-text-primary font-semibold">{c.accountType}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted mb-1">账户性质</dt>
                  <dd className="text-text-primary font-semibold">{c.accountNature}</dd>
                </div>
              </dl>
              <p className="text-xs text-text-muted mt-4">
                观摩账号与密码：登录或订阅后可见
              </p>
            </div>

            {/* 众筹规则 */}
            <div className="card-base p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                众筹规则说明
              </h2>
              <ul className="text-sm text-text-secondary space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-accent-up mt-0.5 shrink-0" />
                  <span>达到目标金额后众筹成功，系统向参与用户开放下载</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-accent-up mt-0.5 shrink-0" />
                  <span>截止时间未达到目标则众筹失败，参与用户可申请退款</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-accent-up mt-0.5 shrink-0" />
                  <span>单独购买付款确认后立即交付，不受众筹结果影响</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-accent-up mt-0.5 shrink-0" />
                  <span>EA 众筹为独立板块，原网站会员权益不抵扣众筹费用</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 右: 购买卡（sticky） */}
          <div className="lg:col-span-1">
            <div className="card-base p-6 lg:sticky lg:top-20 space-y-4">
              {/* 进度 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-text-primary num">
                    {c.raised.toLocaleString()} / {c.target.toLocaleString()} USDT
                  </span>
                  <span className="text-sm text-accent-blue num font-semibold">{c.progress}%</span>
                </div>
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-gold"
                    style={{ width: `${Math.min(c.progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* 统计 */}
              <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-border">
                <div>
                  <div className="text-base font-bold text-text-primary num">{c.participants}</div>
                  <div className="text-xs text-text-muted">已参与</div>
                </div>
                <div>
                  <div className="text-base font-bold text-text-primary num">{c.targetPeople}</div>
                  <div className="text-xs text-text-muted">目标人数</div>
                </div>
                <div>
                  <div className="text-base font-bold text-text-primary num">{c.target.toLocaleString()}</div>
                  <div className="text-xs text-text-muted">目标 USDT</div>
                </div>
              </div>

              {/* 倒计时 */}
              {c.daysLeft > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted flex items-center gap-1">
                    <Clock size={12} />
                    剩余时间
                  </span>
                  <span className="text-text-primary font-semibold num">{c.daysLeft} 天</span>
                </div>
              )}

              {/* 众筹价 */}
              <div className="card-base p-4 border border-accent-blue/30">
                <div className="text-xs text-text-muted mb-1">参与众筹价</div>
                <div className="text-2xl font-bold text-accent-blue num">
                  ${c.crowdPrice} <span className="text-xs text-text-muted">USDT</span>
                </div>
                <button
                  className="btn-primary w-full mt-3 inline-flex items-center justify-center gap-2"
                  disabled={c.progress >= 100}
                >
                  {c.progress >= 100 ? "众筹已成功" : "参与众筹"}
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* 单独购买价 */}
              <div className="card-base p-4">
                <div className="text-xs text-text-muted mb-1">单独购买价</div>
                <div className="text-2xl font-bold text-text-primary num">
                  ${c.directPrice} <span className="text-xs text-text-muted">USDT</span>
                </div>
                <button className="btn-outline w-full mt-3 inline-flex items-center justify-center gap-2">
                  立即单独购买
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* 合作创作者 */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-text-muted leading-relaxed">
                  您有优质 EA？<Link href="/creator/apply" className="text-accent-blue hover:underline">申请合作</Link>，平台协助您找到感兴趣的用户。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
