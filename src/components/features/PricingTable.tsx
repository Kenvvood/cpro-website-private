import Link from "next/link";
import { PLAN_LABEL_CN, USDT_RATES, PLAN_DURATION_DAYS } from "@/lib/payment-config";

// L4 v1.6: 会员价表 3 档 (实色金/蓝/边框 · 中央月付高亮)
// 删 stale 数字 "19,328 资源" / "2,042 开源资源" (L4 v1.5 编译产物 sed 改过, 源码未改)
// 严守 PM D5: 3 档纯付费 USDT, 无 FREE_TRIAL
export function PricingTable() {
  const plans = [
    { plan: "WEEKLY" as const, label: "周付会员", desc: "7 天全站资源无限下载 · 周付 USDT", highlight: false },
    { plan: "MONTHLY" as const, label: "月付会员", desc: "30 天全站资源无限下载 · 含投研教程", highlight: true },
    { plan: "ANNUAL" as const, label: "年付会员", desc: "365 天年付套餐 · 节省 70% · 含 6 月持续更新", highlight: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {plans.map((p) => (
        <div
          key={p.plan}
          className={`relative card-base p-6 flex flex-col ${
            p.highlight ? "border-2 border-accent-blue" : ""
          }`}
        >
          {p.highlight && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-sm bg-accent-blue text-white font-semibold">
              推荐
            </span>
          )}
          <div className="text-base font-semibold text-text-primary mb-2">
            {p.label}
          </div>
          <div className="text-3xl font-bold num text-accent-blue mb-1">
            ${USDT_RATES[p.plan]}
            <span className="text-sm text-text-muted ml-2">USDT</span>
          </div>
          <div className="text-xs text-text-muted mb-4">
            {PLAN_DURATION_DAYS[p.plan]} 天 · USDT 收款
          </div>
          <p className="text-sm text-text-secondary mb-6 min-h-[3rem] leading-relaxed">
            {p.desc}
          </p>
          <Link
            href="/membership"
            className={`mt-auto text-center ${
              p.plan === "ANNUAL" ? "btn-gold" : p.highlight ? "btn-primary" : "btn-outline"
            }`}
          >
            立即订阅
          </Link>
        </div>
      ))}
    </div>
  );
}