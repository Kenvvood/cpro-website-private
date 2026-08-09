import { prisma } from "@/lib/prisma";

// L4 v1.7: 4 KPI → 2 KPI (PM 反馈过度展示)
// v21.0 season2: 不再展示具体数字 (PM: 50 款起 + 持续更新, 不应给具体数字)
// 保留 DB 查询供未来动态展示, 但 UI 只显示"持续更新中"承诺
export async function StatsBar() {
  // 保留查询以备未来需要动态数字 (counts util)
  await Promise.all([
    prisma.product.count({ where: { isActive: true, publishedAt: { not: null } } }),
    prisma.openSourceTutorial.count({ where: { status: "PUBLISHED", publishedAt: { not: null } } }),
  ]);

  const stats = [
    { label: "商品中心", tag: "严选 MQL 量化武器", note: "持续更新中" },
    { label: "投研教程", tag: "基于开源 EA 深度解析", note: "每周新增" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      {stats.map((s) => (
        <div key={s.label} className="card-base p-4 lg:p-6">
          <div className="text-lg font-semibold text-accent-blue">
            {s.tag}
          </div>
          <div className="text-xs text-text-muted mt-2 uppercase tracking-wider">
            {s.label}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {s.note}
          </div>
        </div>
      ))}
    </div>
  );
}
