import Link from "next/link";
import { prisma } from "@/lib/prisma";

// task052 L2 C17: 投研教程网格 (3 列 · 风险徽章)
export async function TutorialGrid() {
  const tutorials = await prisma.openSourceTutorial.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 6,
    select: {
      slug: true,
      strategyLogic: true,  // OpenSourceTutorial 无 title 字段, 用 strategyLogic 当标题
      riskLevel: true,
      marketRegime: true,
      author: true,
      publishedAt: true,
      viewCount: true,
      release: {
        select: { title: true },
      },
    },
  });

  if (tutorials.length === 0) {
    return (
      <div className="card-base p-12 text-center text-text-muted">
        暂无教程研报
      </div>
    );
  }

  const RISK_BADGE: Record<string, string> = {
    低: "text-accent-up border-accent-up/30 bg-accent-up/10",
    中: "text-accent-gold border-accent-gold/30 bg-accent-gold/10",
    高: "text-accent-down border-accent-down/30 bg-accent-down/10",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tutorials.map((t) => (
        <Link
          key={t.slug}
          href={`/tutorials/${t.slug}`}
          className="card-base p-4 hover:border-border-focus transition-colors group"
        >
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 bg-bg-tertiary text-accent-blue rounded-sm">
              CProTrading 投研
            </span>
            {t.riskLevel && (
              <span className={`text-xs px-2 py-0.5 border rounded-sm ${RISK_BADGE[t.riskLevel] ?? "text-text-muted border-border"}`}>
                {t.riskLevel}风险
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-accent-blue">
            {t.release?.title ?? t.strategyLogic}
          </h3>
          <div className="text-xs text-text-muted pt-3 border-t border-border flex justify-between">
            <span>{t.author ?? "CProTrading 投研团队"}</span>
            <span className="num">👁 {t.viewCount.toLocaleString()}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}