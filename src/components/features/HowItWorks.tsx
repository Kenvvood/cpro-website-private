import Link from "next/link";
import { Search, CreditCard, Rocket, ArrowRight } from "lucide-react";

// v22.0 Phase 7.10: 简化 - 去掉自己的 1fr_2fr 标题区 (跟 E AuthorInsights 共享 page.tsx 的 grid)
// 之前: 板块自带 1fr_2fr 左标题 + 右步骤 (双 grid 嵌套)
// 现在: 板块只输出 标题 + 步骤, 左标题区从 E 那边借, 步骤区宽度自动跟 E 主表同宽
// v22.0 Phase 7.24 Batch 1: 工作流背景换白色 (PM 决策, 突出卡片化效果)
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
    // v22.0 Phase 7.24 Batch 1 PATCH: 去 p-4 (父容器改白底后, page.tsx 已有 py-6/8/10, 重复 padding 让留白过多)
    <section className="bg-white -mx-2 px-2">
      {/* 板块头: h2 跟 E AuthorInsights 对齐 (h2 + 副标 + 同行 CTA) */}
      <div className="flex justify-between items-end mb-3 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="h2">工作流</h2>
            <span className="text-[10px] uppercase tracking-wider text-accent-blue font-semibold border border-accent-blue/30 px-1.5 py-0.5">
              3 步闭环
            </span>
          </div>
          <p className="text-xs text-text-muted">
            严选合规再分发 · 链上 USDT 收银 · 工作室级服务 · 订阅即开通
          </p>
        </div>
        <Link href="/membership" className="btn-primary inline-flex items-center gap-2 text-sm shrink-0">
          立即开通会员
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 3 步: 大编号 + 1px 顶线分组, 跟 E 主表宽度自动对齐 (都共享 page.tsx 的 1fr 列)
          v22.0 Phase 7.12: 压缩行高 py-3 → py-2 (PM: '工作流高度压缩更紧凑')
          v22.0 Phase 7.24 Batch 1: hover 改 bg-tertiary (白底上 hover 浅灰可见, 原 bg-primary=白 hover 无效果) */}
      <div className="divide-y divide-border border-t border-border">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.n} className="py-2 grid grid-cols-[auto_1fr] gap-4 items-start hover:bg-bg-tertiary transition-colors -mx-2 px-2">
              <div className="flex flex-col items-start gap-1.5 w-16">
                <span className="text-2xl lg:text-3xl xl:text-4xl font-bold num text-accent-blue/40 leading-none">
                  {s.n}
                </span>
                <Icon size={18} className="text-accent-blue" />
              </div>
              <div className="space-y-1 min-w-0">
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
