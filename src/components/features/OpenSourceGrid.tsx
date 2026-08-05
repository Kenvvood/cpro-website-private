import Link from "next/link";
import { prisma } from "@/lib/prisma";

// task052 L2 C16: 开源专区双署名卡 (4 列)
export async function OpenSourceGrid() {
  const releases = await prisma.openSourceRelease.findMany({
    where: { publishedAt: { not: null } },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: 4,
    select: {
      id: true,
      title: true,
      originalAuthor: true,
      originalSource: true,
      license: true,
      tier: true,
      requiredPlan: true,
      downloadCount: true,
    },
  });

  if (releases.length === 0) {
    return (
      <div className="card-base p-12 text-center text-text-muted">
        暂无开源资源
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-accent-down mb-4">
        ⚠️ 本平台资源仅供编程学习与回测用途 · 实盘交易盈亏自负
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {releases.map((r) => (
          <Link
            key={r.id}
            href={`/open-source/${r.id}`}
            className="card-base p-4 border-t-2 border-t-accent-gold hover:border-border-focus transition-colors group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs px-2 py-0.5 bg-bg-tertiary text-accent-blue rounded-sm">
                {r.license}
              </span>
              {r.tier && (
                <span className="text-xs text-text-muted">{r.tier}</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-accent-blue">
              {r.title}
            </h3>
            <p className="text-xs text-text-muted mb-3 line-clamp-1">
              作者: {r.originalAuthor}
            </p>
            <p className="text-xs text-text-muted mb-3 line-clamp-1">
              来源: {r.originalSource}
            </p>
            <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
              <span className="num">↓ {r.downloadCount.toLocaleString()}</span>
              <span className="text-accent-gold">{r.requiredPlan}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}