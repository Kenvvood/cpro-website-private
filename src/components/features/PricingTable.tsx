import Link from "next/link";
import { PLAN_LABEL_CN, USDT_RATES, PLAN_DURATION_DAYS } from "@/lib/payment-config";

// L4 v1.6: 会员价表 3 档 (实色金/蓝/边框 · 中央月付高亮)
// v22.0 Phase 2.1-D: 去 3 卡片 → 1 张密集表格 (反 AI 卡片感)
// 借鉴 fxssi / cn.investing 风格: 1 张表 3 行
export function PricingTable() {
  const plans = [
    { plan: "WEEKLY" as const,  label: "周付会员", desc: "7 天入门 · 严选资源不限次",                                       highlight: false },
    { plan: "MONTHLY" as const, label: "月付会员", desc: "30 天持续 · 含投研教程 · 每周更新",                              highlight: true  },
    { plan: "ANNUAL" as const,  label: "年付会员", desc: "365 天长期 · 节省 70% · 新工具优先",                              highlight: false },
  ];

  return (
    // 1 张密集表格 (3 行, fxssi 价格表风格)
    <div className="border-y border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
            <th className="text-left py-2 px-2 font-normal">档位</th>
            <th className="text-left py-2 px-2 font-normal hidden sm:table-cell">权益</th>
            <th className="text-right py-2 px-2 font-normal">价格</th>
            <th className="text-right py-2 px-2 font-normal hidden sm:table-cell">时长</th>
            <th className="text-right py-2 px-2 font-normal w-32">操作</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr
              key={p.plan}
              className={`border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors ${
                p.highlight ? "bg-accent-blue/5" : ""
              }`}
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  {p.highlight && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-blue" />
                  )}
                  <span className={`text-sm font-semibold ${p.highlight ? "text-accent-blue" : "text-text-primary"}`}>
                    {p.label}
                  </span>
                </div>
              </td>
              <td className="py-3 px-2 text-xs text-text-secondary hidden sm:table-cell">
                {p.desc}
              </td>
              <td className="py-3 px-2 text-right num">
                <span className="text-lg font-bold text-accent-blue">${USDT_RATES[p.plan]}</span>
                <span className="text-[10px] text-text-muted ml-1">USDT</span>
              </td>
              <td className="py-3 px-2 text-right text-xs text-text-muted num hidden sm:table-cell">
                {PLAN_DURATION_DAYS[p.plan]} 天
              </td>
              <td className="py-3 px-2 text-right">
                <Link
                  href="/membership"
                  className={`inline-block text-xs font-semibold px-3 py-1.5 ${
                    p.plan === "ANNUAL" ? "btn-gold" : p.highlight ? "btn-primary" : "btn-outline"
                  }`}
                >
                  立即订阅
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
