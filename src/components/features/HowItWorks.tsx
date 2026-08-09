import Link from "next/link";
import { Search, CreditCard, Rocket, ArrowRight } from "lucide-react";

// L4 v1.7: 4 步 → 3 步 (PM 反馈"画蛇添足")
// 浏览 → 订阅 → 部署 (删"下载"这步多余, 部署是订阅后的必然流程)
// 桌面端保留 2 条箭头连接
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
          3 步闭环 · 链上 USDT 收银 · 工作室级服务
        </p>
      </div>

      <div className="border-y border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
              <th className="text-left py-2 px-2 font-normal w-12">#</th>
              <th className="text-left py-2 px-2 font-normal w-32">步骤</th>
              <th className="text-left py-2 px-2 font-normal hidden md:table-cell w-12">→</th>
              <th className="text-left py-2 px-2 font-normal">说明</th>
            </tr>
          </thead>
          <tbody>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <tr key={s.n} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                  <td className="py-3 px-2 text-text-muted num text-xs w-12">{s.n}</td>
                  <td className="py-3 px-2 w-32">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-accent-blue shrink-0" />
                      <span className="text-text-primary font-medium">{s.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-text-muted text-xs hidden md:table-cell w-12">
                    {i < STEPS.length - 1 ? "→" : "✓"}
                  </td>
                  <td className="py-3 px-2 text-text-secondary text-xs leading-relaxed">
                    {s.body}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
