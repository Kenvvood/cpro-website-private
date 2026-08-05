// src/app/tutorials/page.tsx
// task052 L4: TV 风拉平 + 风险徽章改 accent 语义色
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RISK_BADGE: Record<string, string> = {
  低: "border-accent-up/30 bg-accent-up/10 text-accent-up",
  中: "border-accent-gold/30 bg-accent-gold/10 text-accent-gold",
  高: "border-accent-down/30 bg-accent-down/10 text-accent-down",
};

export default async function TutorialsPage() {
  const tutorials = await prisma.openSourceTutorial.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      release: { select: { title: true, license: true, originalSource: true } },
    },
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8 border-b border-border pb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">投研研报</h1>
            <span className="text-xs text-text-muted uppercase tracking-widest">CProTrading Research</span>
          </div>
          <p className="text-sm text-text-secondary">
            基于开源 EA 源码深度解析 · 严选合规再分发协议 · 每篇研报配套实盘风险提示
          </p>
          <p className="mt-2 text-xs text-text-muted num">
            作者: CProTrading 投研团队 · 发布总数 {tutorials.length.toLocaleString()} 篇
          </p>
        </header>

        {tutorials.length === 0 ? (
          <div className="card-base p-12 text-center text-text-muted">暂无已发布研报</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorials.map((t) => (
              <TutCard key={t.id} t={t} />
            ))}
          </div>
        )}

        <footer className="mt-12 card-base p-4 text-xs text-text-secondary">
          <strong className="text-text-primary">免责声明：</strong>
          本研报由 CProTrading 城诺科技投研团队基于开源源码分析撰写，不构成任何投资建议。
          实盘交易盈亏自负。联系方式：微信 Lookee333
        </footer>
      </main>
    </div>
  );
}

function TutCard({ t }: { t: any }) {
  return (
    <Link
      href={`/tutorials/${t.slug}`}
      className="card-base p-5 hover:border-border-focus transition-colors group block"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-text-primary leading-tight line-clamp-2 group-hover:text-accent-blue">
          {t.release.title}
        </h3>
        {t.riskLevel && (
          <span className={`shrink-0 px-2 py-0.5 border rounded-sm text-xs ${RISK_BADGE[t.riskLevel] ?? "border-border text-text-muted"}`}>
            {t.riskLevel}风险
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <span className="px-2 py-0.5 bg-bg-tertiary text-text-secondary rounded-sm">{t.marketRegime}</span>
        {t.timeframe && (
          <span className="px-2 py-0.5 bg-bg-tertiary text-text-secondary rounded-sm">{t.timeframe}</span>
        )}
        <span className="px-2 py-0.5 bg-bg-tertiary text-text-secondary rounded-sm">{t.release.license}</span>
      </div>
      <p className="text-xs text-text-secondary line-clamp-2">{t.strategyLogic}</p>
      <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted flex justify-between num">
        <span>👁 {t.viewCount.toLocaleString()}</span>
        <span>📄 阅读全文 →</span>
      </div>
    </Link>
  );
}