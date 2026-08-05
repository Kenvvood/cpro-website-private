import { prisma } from "@/lib/prisma";

// L4 v1.7: 4 KPI → 2 KPI (PM 反馈过度展示)
// 只留 "商品总数" + "教程研报", 跟黄金外汇核心业务直接相关
// 删 "开源版本" + "当前可商用" 分散指标
// L4 v1.5 修复保留: publishedAt 过滤 (DB 11,242 全 NULL, 显示 0 诚实)
export async function StatsBar() {
  const [productCount, tutorialCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true, publishedAt: { not: null } } }),
    prisma.openSourceTutorial.count({ where: { status: "PUBLISHED", publishedAt: { not: null } } }),
  ]);

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
