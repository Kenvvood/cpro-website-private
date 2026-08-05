import Link from "next/link";
import { Search, CreditCard, Rocket, ArrowRight, Users } from "lucide-react";

// L4 v1.9 激进档: 3 步 → 3 步 (保留 v1.7 简洁 + 零 emoji)
// 实际是 4 区块: 浏览 → 订阅 → 部署 + 创作者申请入口
// PM 决策: 保留简洁, 加 "申请入驻" 按钮作为第 4 个 CTA

const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "浏览策略",
    body: "从产品中心按品种 / 风险 / 周期筛选, 详情页查看回测曲线与参数说明。",
  },
  {
    n: "02",
    icon: CreditCard,
    title: "订阅 USDT",
    body: "选择周 / 月 / 年付 USDT 套餐, 链上转账后订单 4 小时内自动开通。",
  },
  {
    n: "03",
    icon: Rocket,
    title: "部署实盘",
    body: "订阅期内不限次数下载 MQL4 / MQL5 源码, 导入 MT4/MT5 终端直接上线。",
  },
];

export function HowItWorks() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-semibold text-text-primary mb-1">
          工作流 · 从浏览到部署
        </h2>
        <p className="text-xs text-text-muted">
          3 步闭环 · 链上 USDT 收银 · 工作室级流程
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.n} className="relative">
              <div className="card-base p-5 h-full hover:border-border-focus transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold num text-accent-blue/40 select-none">
                    {s.n}
                  </span>
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-accent-blue/10">
                    <Icon size={18} className="text-accent-blue" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {s.body}
                </p>
              </div>
              {/* 箭头 (桌面端, 2 条) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 items-center justify-center text-border-strong">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 创作者申请入口 (借 erbotapp /creator 路由) */}
      <div className="mt-6 card-base p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-accent-gold/10 shrink-0">
            <Users size={18} className="text-accent-gold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              您有优质 EA？
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              申请入驻创作者中心，提交可验证观摩账户与策略资料，平台协助您找到真正感兴趣的用户。
            </p>
          </div>
        </div>
        <Link
          href="/creator/apply"
          className="btn-outline inline-flex items-center gap-2 text-sm shrink-0"
        >
          申请入驻
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
