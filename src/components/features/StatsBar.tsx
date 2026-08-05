import { prisma } from "@/lib/prisma";

// task052 L2 C14: Stats Bar (克制版 · 4 列紧凑数字 · 无 glow)
// 数据源: 真实 DB 读取
export async function StatsBar() {
  const [productCount, openSourceCount, tutorialCount, readyCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.openSourceRelease.count({ where: { publishedAt: { not: null } } }),
    prisma.openSourceTutorial.count({ where: { status: "PUBLISHED" } }),
    prisma.product.count({ where: { isActive: true, fileUrl: { not: "" } } }),
  ]);

  const stats = [
    { label: "商品总数", value: productCount.toLocaleString(), suffix: "款" },
    { label: "开源版本", value: openSourceCount.toLocaleString(), suffix: "个" },
    { label: "教程研报", value: tutorialCount.toLocaleString(), suffix: "篇" },
    { label: "当前可商用", value: readyCount.toLocaleString(), suffix: "款" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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