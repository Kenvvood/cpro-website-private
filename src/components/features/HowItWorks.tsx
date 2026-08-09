import Link from "next/link";
import { Search, CreditCard, Rocket, ArrowRight } from "lucide-react";

// v22.0 Phase 7.0: 2 栏杂志风重构 (PM 反馈 "首页排版呆板")
// - 之前: 标题 + 1 张密集表 (跟其他板块同节奏, 显呆板)
// - 现在: 左 30% 标题区 (h2 大 + 副标 + 简介 + 底部 CTA) / 右 70% 步骤区
//   3 个 step 横向 card-less 大字编号 (01/02/03) + icon + 标题 + 描述
// 借鉴 cn.investing 头条区 2 栏 + 杂志感
const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "浏览策略",
    body: "从产品中心按品种 / 风险 / 周期筛选, 详情页查看回测曲线与参数说明。",
    tag: "免费",
  },
  {
    n: "02",
    icon: CreditCard,
    title: "订阅 USDT",
    body: "选择周 / 月 / 年付 USDT 套餐, 链上转账后订单 4 小时内自动开通。",
    tag: "链上",
  },
  {
    n: "03",
    icon: Rocket,
    title: "部署实盘",
    body: "订阅期内不限次数下载 MQL4 / MQL5 源码, 导入 MT4/MT5 终端直接上线。",
    tag: "实盘",
  },
];

export function HowItWorks() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12 items-start">
      {/* 左 30% 标题区 */}
      <div className="space-y-4 lg:sticky lg:top-20">
        <div className="text-[10px] uppercase tracking-wider text-accent-blue font-semibold">
          工作流
        </div>
        <h2 className="text-2xl lg:text-3xl font-semibold text-text-primary leading-snug">
          从浏览到部署
          <br />
          <span className="text-text-muted text-lg">3 步闭环</span>
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
          严选合规再分发, 链上 USDT 收银, 工作室级服务。
          订阅即开通, 不画饼, 不套路。
        </p>
        <div className="pt-2">
          <Link
            href="/membership"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            立即开通会员
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* 右 70% 步骤区: 3 个 step 横向大编号 + 1px 顶线分组 */}
      <div className="divide-y divide-border border-t border-border">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.n} className="py-3 grid grid-cols-[auto_1fr] gap-4 items-start hover:bg-bg-primary transition-colors -mx-2 px-2">
              <div className="flex flex-col items-start gap-2 w-16">
                <span className="text-3xl lg:text-4xl font-bold num text-accent-blue/40 leading-none">
                  {s.n}
                </span>
                <Icon size={18} className="text-accent-blue" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-text-primary">{s.title}</h3>
                  <span className="text-[10px] text-text-muted px-1.5 py-0.5 border border-border bg-bg-primary">
                    {s.tag}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{s.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
