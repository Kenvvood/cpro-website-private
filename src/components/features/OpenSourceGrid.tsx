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
      <div className="text-center text-text-muted text-sm py-8 border-y border-border">
        暂无开源资源
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-accent-down mb-4">
        ⚠️ 本平台资源仅供编程学习与回测用途 · 实盘交易盈亏自负
      </p>
      <div className="border-y border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
              <th className="text-left py-2 px-2 font-normal w-12">#</th>
              <th className="text-left py-2 px-2 font-normal hidden sm:table-cell w-20">协议</th>
              <th className="text-left py-2 px-2 font-normal">标题</th>
              <th className="text-left py-2 px-2 font-normal hidden md:table-cell">作者</th>
              <th className="text-left py-2 px-2 font-normal hidden lg:table-cell">来源</th>
              <th className="text-right py-2 px-2 font-normal hidden sm:table-cell w-16">下载</th>
              <th className="text-right py-2 px-2 font-normal hidden md:table-cell w-20">订阅</th>
            </tr>
          </thead>
          <tbody>
            {releases.map((r, i) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                <td className="py-2.5 px-2 text-text-muted num text-xs w-12">{String(i + 1).padStart(2, "0")}</td>
                <td className="py-2.5 px-2 text-xs text-accent-blue hidden sm:table-cell w-20">{r.license}</td>
                <td className="py-2.5 px-2">
                  <Link href={`/open-source/${r.id}`} className="text-text-primary font-medium hover:text-accent-blue line-clamp-1">
                    {r.title}
                  </Link>
                </td>
                <td className="py-2.5 px-2 text-xs text-text-secondary hidden md:table-cell">{r.originalAuthor}</td>
                <td className="py-2.5 px-2 text-xs text-text-muted hidden lg:table-cell line-clamp-1">{r.originalSource}</td>
                <td className="py-2.5 px-2 text-right text-xs text-text-muted num hidden sm:table-cell w-16">
                  {r.downloadCount.toLocaleString()}
                </td>
                <td className="py-2.5 px-2 text-right text-xs text-accent-gold hidden md:table-cell w-20">
                  {r.requiredPlan}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}