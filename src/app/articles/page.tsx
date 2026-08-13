// src/app/articles/page.tsx — 文章列表页 (v22.0 Phase 7.24 Batch 12)
// PM 反馈 2026-08-12: /articles 列表页 404, Footer 加入口需要列表存在
// 风格: 跟 /tutorials 一致 (3 栏卡片 + 风险徽章), 数据源 prisma.article
// 文章分 PURE 纯文章 / OPEN_SOURCE 源码文章 (PM v3 决策)
import Link from "next/link";
import { Calendar, Eye, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/config/brand";
import { buildSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildSeoMetadata({
  title: "精选文章 - MQL5 实战 · 黄金套利 · 仓位管理 | CProTrading",
  description: "严选 EA 开发心得 · 黄金套利实战 · 仓位管理 · 风险控制 · 部署教程, 5+ 篇实战文章持续更新。",
  path: "/articles",
  image: "/og-articles.png",
  keywords: ["精选文章", "MQL5", "XAUUSD", "黄金", "套利", "仓位管理", "风险控制", "EA 部署"],
});

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  PURE:        { label: "纯文章",  color: "border-accent-blue/30 bg-accent-blue/10 text-accent-blue" },
  OPEN_SOURCE: { label: "源码解读", color: "border-accent-gold/30 bg-accent-gold/10 text-accent-gold" },
};

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      type: true,
      publishedAt: true,
      viewCount: true,
    },
    take: 60,
  });

  return (
    <div className="min-h-screen bg-bg-primary pt-2 sm:pt-12 lg:pt-14">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12">
        <header className="mb-8 border-b border-border pb-6">
          <div className="flex items-baseline gap-3 mb-2 flex-wrap">
            <h1 className="h1 text-text-primary">精选文章</h1>
            <span className="text-xs text-text-muted">{BRAND.mtt.full} 投研</span>
          </div>
          <p className="text-sm text-text-secondary">
            严选 EA 开发心得 · 黄金套利实战 · 仓位管理 · 风险控制 · 部署教程
          </p>
          <p className="mt-2 text-xs text-text-muted num">
            作者: 山治廿一 · CProTrading 城诺科技 · 持续更新中
          </p>
        </header>

        {articles.length === 0 ? (
          <div className="text-center text-text-muted text-sm py-8 border-y border-border">
            暂无已发布文章 · 正在筹备中
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}

        <footer className="mt-12 border-t border-border pt-4 text-xs text-text-secondary leading-relaxed">
          <strong className="text-text-primary">免责声明：</strong>
          本平台文章为 CProTrading 城诺科技投研团队基于公开资料及实盘经验整理，不构成任何投资建议。
          实盘交易盈亏自负。联系方式：微信 Lookee333
        </footer>
      </main>
    </div>
  );
}

interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  type: string;
  publishedAt: Date | null;
  viewCount: number;
}

function ArticleCard({ article: a }: { article: ArticleListItem }) {
  const typeBadge = TYPE_BADGE[a.type] ?? TYPE_BADGE.PURE;
  const date = a.publishedAt ? new Date(a.publishedAt) : null;
  const dateStr = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";

  return (
    <Link
      href={`/articles/${a.slug}`}
      className="card-base p-5 hover:border-border-focus transition-colors group block"
    >
      {/* 类型徽章 + 日期 */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`shrink-0 px-2 py-0.5 border rounded-sm text-[10px] ${typeBadge.color}`}>
          {typeBadge.label}
        </span>
        {dateStr && (
          <span className="text-[10px] text-text-muted num flex items-center gap-1">
            <Calendar size={10} />
            {dateStr}
          </span>
        )}
      </div>

      {/* 标题 */}
      <h3 className="text-base font-semibold text-text-primary leading-tight line-clamp-2 mb-2 group-hover:text-accent-blue">
        {a.title}
      </h3>

      {/* 摘要 */}
      {a.summary && (
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3">
          {a.summary}
        </p>
      )}

      {/* 底部 meta: 阅读数 / 原文 */}
      <div className="flex items-center gap-3 text-[10px] text-text-muted pt-3 border-t border-border">
        <span className="flex items-center gap-1">
          <Eye size={10} />
          <span className="num">{a.viewCount.toLocaleString()}</span>
        </span>
        <span className="flex items-center gap-1">
          <FileText size={10} />
          <span className="num">纯文章</span>
        </span>
        <span className="ml-auto text-accent-blue group-hover:underline">阅读 →</span>
      </div>
    </Link>
  );
}
