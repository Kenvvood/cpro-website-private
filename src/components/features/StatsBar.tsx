import { prisma } from "@/lib/prisma";

// L4 v1.9 激进档 (PM 决策): 2 KPI → 3 KPI
// 加 "编译成功率 56.8%" 真实数字, 替代 erbotapp "1200+ 资源" 那种空口号
const COMPILE_RATE = 56.8;
const COMPILE_TOTAL = 1175;
const COMPILE_PENDING = 892;

export async function StatsBar() {
  const [productCount, tutorialCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true, publishedAt: { not: null } } }),
    prisma.openSourceTutorial.count({ where: { status: "PUBLISHED", publishedAt: { not: null } } }),
  ]);

  const stats = [
    { label: "商品总数", value: productCount.toLocaleString(), suffix: "款" },
    { label: "教程研报", value: tutorialCount.toLocaleString(), suffix: "篇" },
    {
      label: "MT4/MT5 编译成功率",
      value: `${COMPILE_RATE}`,
      suffix: `%`,
      meta: `${COMPILE_TOTAL.toLocaleString()} 编译通过 · ${COMPILE_PENDING.toLocaleString()} 持续优化`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card-base p-4 lg:p-6">
          <div className="text-3xl font-bold num text-accent-blue">
            {s.value}
            <span className="text-sm text-text-muted ml-1">{s.suffix}</span>
          </div>
          <div className="text-xs text-text-muted mt-2 uppercase tracking-wider">
            {s.label}
          </div>
          {"meta" in s && s.meta && (
            <div className="text-xs text-text-muted mt-1.5">{s.meta}</div>
          )}
        </div>
      ))}
    </div>
  );
}
