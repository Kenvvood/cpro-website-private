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
      <div className="text-center text-text-muted text-sm py-8 border-y border-border">
        暂无教程研报
      </div>
    );
  }

  const RISK_COLOR: Record<string, string> = {
    低: "text-accent-up",
    中: "text-accent-gold",
    高: "text-accent-down",
  };

  return (
    <div className="border-y border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
            <th className="text-left py-2 px-2 font-normal w-12">#</th>
            <th className="text-left py-2 px-2 font-normal w-16 hidden sm:table-cell">风险</th>
            <th className="text-left py-2 px-2 font-normal">标题</th>
            <th className="text-left py-2 px-2 font-normal hidden md:table-cell w-32">作者</th>
            <th className="text-right py-2 px-2 font-normal hidden sm:table-cell w-16">阅读</th>
          </tr>
        </thead>
        <tbody>
          {tutorials.map((t, i) => (
            <tr key={t.slug} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
              <td className="py-2.5 px-2 text-text-muted num text-xs w-12">{String(i + 1).padStart(2, "0")}</td>
              <td className={`py-2.5 px-2 text-xs w-16 hidden sm:table-cell ${RISK_COLOR[t.riskLevel] ?? "text-text-muted"}`}>
                {t.riskLevel ? `${t.riskLevel}风险` : "—"}
              </td>
              <td className="py-2.5 px-2">
                <Link href={`/tutorials/${t.slug}`} className="text-text-primary font-medium hover:text-accent-blue line-clamp-1">
                  {t.release?.title ?? t.strategyLogic}
                </Link>
              </td>
              <td className="py-2.5 px-2 text-xs text-text-secondary hidden md:table-cell w-32">
                {t.author ?? "CProTrading 投研团队"}
              </td>
              <td className="py-2.5 px-2 text-right text-xs text-text-muted num hidden sm:table-cell w-16">
                {t.viewCount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}