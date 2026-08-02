// src/app/open-source/page.tsx
// 路径 D: 开源专区首页 (task-0037)
// 铁律 #283 (默认拒绝) / #285 (商品溯源无真空) / #286 (input 参数面板标准化)
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OpenSourceReleaseCard } from "@/components/open-source/OpenSourceReleaseCard";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function OpenSourcePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; license?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where = {
    ...(params.source ? { originalSource: params.source } : {}),
    ...(params.license ? { license: params.license as any } : {}),
  };

  const [releases, total, byLicense] = await Promise.all([
    prisma.openSourceRelease.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.openSourceRelease.count({ where }),
    prisma.openSourceRelease.groupBy({
      by: ["license"],
      _count: true,
      orderBy: { _count: { license: "desc" } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">开源合规再分发专区</h1>
        <p className="mt-2 text-muted-foreground">
          CProTrading 城诺科技收录 {total.toLocaleString()} 个开源 EA / 指标 / 脚本。
          所有资源保留原作者版权，本平台仅做表达层汉化包装，不修改核心算法。付费会员可下载，已下载者可按原始协议自由再分发。
        </p>
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          ⚠️ 本平台资源仅供编程学习与历史数据回测用途。实盘交易盈亏自负。
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {byLicense.map((b) => (
            <Link
              key={b.license}
              href={`/open-source?license=${b.license}`}
              className="px-3 py-1 rounded-full border border-border bg-muted hover:bg-muted/70 transition"
            >
              {b.license} · {b._count}
            </Link>
          ))}
        </div>
      </header>

      {releases.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>未找到匹配的开源资源</p>
          <Link href="/open-source" className="mt-2 inline-block text-sm underline">
            清除筛选
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {releases.map((r) => (
            <OpenSourceReleaseCard
              key={r.id}
              release={{
                id: r.id,
                title: r.title,
                license: r.license,
                originalSource: r.originalSource,
                originalAuthor: r.originalAuthor,
                requiredPlan: r.requiredPlan,
                isFeatured: r.isFeatured,
                downloadCount: r.downloadCount,
                viewCount: r.viewCount,
                tier: r.tier,
              }}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/open-source?${new URLSearchParams({
                ...(params.source ? { source: params.source } : {}),
                ...(params.license ? { license: params.license } : {}),
                page: String(p),
              }).toString()}`}
              className={`px-3 py-1 rounded border ${
                p === page ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}

      {/* 法律免责 */}
      <footer className="mt-12 p-4 rounded border border-border bg-muted/50 text-xs text-muted-foreground">
        <strong className="text-foreground">合规声明：</strong>
        本专区资源依据开源协议合规再分发，已下载者可按原始协议条款自由再分发。
        所有资源保留原作者版权，CProTrading 仅做技术中性的表达层包装，不修改核心算法。
        {" "}
        <Link href="/legal/gpl-notice" className="underline">
          详见免责声明
        </Link>
        。
      </footer>
    </div>
  );
}