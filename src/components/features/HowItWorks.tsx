import Link from "next/link";
import { Search, CreditCard, Download, Rocket, ArrowRight } from "lucide-react";

// L4 v1.6: 借 TradingView 中文站 onboarding 风格
// 4 步: 浏览 → 订阅 → 下载 → 部署
// 严守 PM D5: 无试用, 直接付费 USDT
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
    title: "订阅会员",
    body: "选择周 / 月 / 年付 USDT 套餐, 链上转账后订单 4 小时内自动开通。",
  },
  {
    n: "03",
    icon: Download,
    title: "下载源码",
    body: "订阅期内不限次数下载 MQL4 / MQL5 源码 + 参数集 + 回测报告。",
  },
  {
    n: "04",
    icon: Rocket,
    title: "部署实盘",
    body: "源码导入 MT4/MT5 终端, 按参数集初始化即可上线, 工作室多账户复制。",
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
          4 步闭环 · 工作室级流程, 链上 USDT 收银
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
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
              {/* 箭头 (桌面端, 3 条) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 items-center justify-center text-border-strong">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/membership"
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          立即开通会员
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
