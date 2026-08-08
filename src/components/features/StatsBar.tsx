import { prisma } from "@/lib/prisma";

// L4 v1.7: 4 KPI → 2 KPI
// task068 v4: DB 错误兜底 — 构建/运行时不阻塞页面渲染
export async function StatsBar() {
  let productCount = 0;
  let tutorialCount = 0;
  try {
    const [pc, tc] = await Promise.all([
      prisma.product.count({ where: { isActive: true, publishedAt: { not: null } } }).catch(() => 0),
      prisma.openSourceTutorial.count({ where: { status: "PUBLISHED", publishedAt: { not: null } } }).catch(() => 0),
    ]);
    productCount = pc;
    tutorialCount = tc;
  } catch {
    /* DB 不可用, 显示 0 占位 */
  }

  const stats = [
    { label: "商品总数", value: productCount.toLocaleString(), suffix: "款" },
    { label: "教程研报", value: tutorialCount.toLocaleString(), suffix: "篇" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      {stats.map((s) => (
        <div key={s.label} className="card-base p-4 lg:p-6">
          <div className="text-3xl font-bold num text-accent-blue">
            {s.value}
            <span className="text-sm text-text-muted ml-1">{s.suffix}</span>
          </div>
          <div className="text-xs text-text-muted mt-2 uppercase tracking-wider">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}