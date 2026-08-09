import { prisma } from "@/lib/prisma";

// L4 v1.7: 4 KPI → 2 KPI (PM 反馈过度展示)
// v21.0 season2: 不再展示具体数字 (PM: 50 款起 + 持续更新, 不应给具体数字)
// v22.0 Phase 2.1-B: 去 card-base → 改 1 张密集行 + 1px 底边线 (fxssi / cn.investing 风格)
export async function StatsBar() {
  // 保留查询以备未来需要动态数字 (counts util)
  await Promise.all([
    prisma.product.count({ where: { isActive: true, publishedAt: { not: null } } }),
    prisma.openSourceTutorial.count({ where: { status: "PUBLISHED", publishedAt: { not: null } } }),
  ]);

  const stats = [
    { label: "商品中心", tag: "严选 MQL 量化武器", note: "持续更新中" },
    { label: "投研教程", tag: "基于开源 EA 深度解析", note: "每周新增" },
    { label: "实战工具", tag: "XAUUSD / 外汇计算器", note: "客户端运算" },
    { label: "开源专区", tag: "合规再分发协议", note: "可商用" },
  ];

  return (
    // v22.0 Phase 7.0: 4 列 data strip + 时间戳右对齐 (浅灰底色由 page.tsx 提供)
    <div className="flex items-center divide-x divide-border">
      {stats.map((s) => (
        <div key={s.label} className="flex-1 py-3 px-4 first:pl-0 last:pr-0">
          <div className="text-sm font-semibold text-text-primary">
            {s.tag}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">
            {s.label} · <span className="text-accent-up">{s.note}</span>
          </div>
        </div>
      ))}
      <div className="text-[10px] text-text-muted num pl-4 shrink-0">
        更新于 2026-08-09
      </div>
    </div>
  );
}
