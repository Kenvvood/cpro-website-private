// src/app/tutorials/page.tsx
// 投研研报列表页 (task-0046)
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TutorialsPage() {
  const tutorials = await prisma.openSourceTutorial.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      release: {
        select: { title: true, license: true, originalSource: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-10 border-b border-border pb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight">投研研报</h1>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">CProTrading Research</span>
        </div>
        <p className="mt-3 text-muted-foreground">
          CProTrading 城诺科技量化投研团队 · 基于开源 EA 源码深度解析 ·
          严选合规再分发协议 · 每篇研报配套实盘风险提示
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          作者署名：CProTrading 投研团队 · 发布总数 {tutorials.length} 篇
        </p>
      </header>

      {tutorials.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>暂无已发布研报</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tutorials.map((t) => (
            <TutCard key={t.id} t={t} />
          ))}
        </div>
      )}

      <footer className="mt-12 p-4 rounded border border-border bg-muted/30 text-xs text-muted-foreground">
        <strong className="text-foreground">免责声明：</strong>
        本研报由 CProTrading 投研团队基于开源源码分析撰写, 不构成任何投资建议。
        实盘交易盈亏自负, 任何使用本站工具导致的交易亏损, 均由用户自行承担。
        联系方式：微信 Lookee333
      </footer>
    </div>
  );
}

function TutCard({ t }: { t: any }) {
  const riskColor: Record<string, string> = {
    低: "bg-green-500/15 text-green-700 border-green-500/30",
    中: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    高: "bg-red-500/15 text-red-700 border-red-500/30",
  };
  return (
    <Link
      href={`/tutorials/${t.slug}`}
      className="group block rounded-lg border border-border bg-card p-5 hover:border-primary hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold leading-tight group-hover:text-primary transition line-clamp-2">
          {t.release.title}
        </h3>
        {t.riskLevel && (
          <span className={`shrink-0 px-2 py-0.5 rounded border text-xs ${riskColor[t.riskLevel] ?? "bg-muted"}`}>
            {t.riskLevel}风险
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {t.marketRegime}
        </span>
        {t.timeframe && (
          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {t.timeframe}
          </span>
        )}
        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {t.release.license}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {t.strategyLogic}
      </p>
      <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex justify-between">
        <span>👁 {t.viewCount.toLocaleString()}</span>
        <span>📄 阅读全文 →</span>
      </div>
    </Link>
  );
}