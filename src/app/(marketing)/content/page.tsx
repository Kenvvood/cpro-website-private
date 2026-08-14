// v22.0 Phase 7.24 Batch 7: 大航海时代 3 列 (eahub 风)
//   200px 左目录 + 1fr 主区 + 280px 侧栏 (实时数据 / 排行榜 / 公告)
// 顶部紧凑 header + 钩子 4 行
// 保留 PATCH7.23 投研教程 + 开源合规 2 个 section + 法律免责
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Footer } from "@/components/layout/footer";
import { OpenSourceReleaseCard } from "@/components/open-source/OpenSourceReleaseCard";
import { t } from "@/lib/i18n";
import { BookOpen, Layers, Scale, Trophy, Megaphone, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

export default async function ContentPage() {
  // 并行查: 教程 + release + 排行榜 + 总数
  const [tutorials, releases, total, totalFeatured, byLicense, topTutorials, topReleases] = await Promise.all([
    prisma.openSourceTutorial.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: {
        id: true, slug: true, marketRegime: true, symbols: true,
        timeframe: true, riskLevel: true, strategyLogic: true,
        publishedAt: true, viewCount: true, author: true,
      },
    }),
    prisma.openSourceRelease.findMany({
      where: { isFeatured: true },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
    }),
    prisma.openSourceRelease.count(),
    prisma.openSourceRelease.count({ where: { isFeatured: true } }),
    prisma.openSourceRelease.groupBy({
      by: ["license"], _count: true, orderBy: { _count: { license: "desc" } },
    }),
    prisma.openSourceTutorial.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { slug: true, strategyLogic: true, viewCount: true, marketRegime: true },
    }),
    prisma.openSourceRelease.findMany({
      orderBy: { downloadCount: "desc" },
      take: 5,
      select: { id: true, title: true, downloadCount: true, tier: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 0. 顶部紧凑 Header (3 行分布, 跟 /products 风格统一) */}
      <section className="border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-3 max-w-[1920px] mx-auto flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-accent-purple tracking-widest uppercase">内容中心</span>
              <span className="text-[10px] text-text-muted">投研教程 · 策略分享 · 开源合规再分发</span>
            </div>
            <h1 className="h1">
              <span className="text-accent-blue">大航海</span>时代
              <span className="text-base font-normal text-text-muted ml-3">从跟单到自建 · 源码可读 · 协议合规</span>
            </h1>
            <p className="text-xs text-text-muted leading-relaxed">
              <span className="text-text-secondary font-medium">商业授权再分发</span>
              <span className="mx-1.5">·</span>
              投研教程持续更新 · 严选开源资源 · GPL/MIT 协议保留 · 平台仅做技术中性包装
            </p>
          </div>
          <div className="text-xs text-text-muted num">
            共 <span className="text-accent-purple font-semibold">{tutorials.length}</span> 教程 ·
            <span className="text-accent-purple font-semibold ml-1">{totalFeatured}</span> 精选
          </div>
        </div>
      </section>

      {/* 1. 主体: 3 列 (200 + 1fr + 280) */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-24 py-6 lg:py-8 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr_280px] gap-6 lg:gap-8">
          {/* === 左 200px 目录 === */}
          <aside className="space-y-4">
            <div className="border border-border">
              <h3 className="text-xs text-text-muted tracking-widest uppercase px-4 py-3 border-b border-border">本页目录</h3>
              <nav className="text-sm">
                {[
                  { id: 'tutorials', icon: BookOpen, label: '投研教程', count: tutorials.length },
                  { id: 'releases', icon: Layers, label: '开源专区', count: totalFeatured },
                  { id: 'ranking', icon: Trophy, label: '排行榜', count: topTutorials.length + topReleases.length },
                  { id: 'news', icon: Megaphone, label: '公告', count: 3 },
                  { id: 'legal', icon: Scale, label: '法律免责', count: null },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <a key={s.id} href={`#${s.id}`}
                      className="flex items-center gap-2 px-4 py-2.5 border-b border-border last:border-b-0
                        text-text-secondary hover:text-accent-purple hover:bg-bg-secondary transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="flex-1">{s.label}</span>
                      {s.count !== null && <span className="text-[10px] text-text-muted num">{s.count}</span>}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* 实时数据 */}
            <div className="border border-border">
              <h3 className="text-xs text-text-muted tracking-widest uppercase px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-up" />
                实时数据
              </h3>
              <div className="px-4 py-3 space-y-3 text-xs">
                <StatRow label="教程总数" value={tutorials.length} />
                <StatRow label="开源资源" value={total} />
                <StatRow label="精选资源" value={totalFeatured} />
                <StatRow label="协议种类" value={byLicense.length} />
              </div>
            </div>

            {/* 协议分布 */}
            {byLicense.length > 0 && (
              <div className="border border-border">
                <h3 className="text-xs text-text-muted tracking-widest uppercase px-4 py-3 border-b border-border">协议分布</h3>
                <div className="px-4 py-3 space-y-2 text-xs">
                  {byLicense.slice(0, 4).map((b) => (
                    <div key={b.license} className="flex items-center justify-between">
                      <span className="text-text-secondary">{t.license(b.license).short}</span>
                      <span className="num text-accent-purple font-mono">{b._count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* === 主区 1fr === */}
          <section className="min-w-0 space-y-8">
            {/* 1. 投研教程 (1px 底边线横向 list) */}
            <div id="tutorials">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-purple" />
                  投研教程
                </h2>
                <Link href="/tutorials" className="text-xs text-accent-purple hover:underline">
                  全部教程 →
                </Link>
              </div>
              {tutorials.length === 0 ? (
                <p className="text-sm text-text-muted py-6 border-y border-border text-center">
                  暂无已发布教程, 持续更新中
                </p>
              ) : (
                <div className="border-y border-border">
                  {tutorials.map((tut, i) => (
                    <Link
                      key={tut.id}
                      href={`/tutorials/${tut.slug}`}
                      className="group grid grid-cols-[40px_1fr_120px_80px] items-center gap-3 py-3 px-3 -mx-3
                        border-b border-border last:border-b-0 hover:bg-bg-secondary transition-colors"
                    >
                      <div className="w-8 h-8 rounded border border-border bg-bg-tertiary flex items-center justify-center
                        text-accent-purple font-mono text-xs group-hover:border-accent-purple transition-colors">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-primary leading-snug line-clamp-1 group-hover:text-accent-purple transition-colors">
                          {tut.strategyLogic || tut.slug}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {tut.marketRegime && <span className="px-1.5 py-0.5 border border-border">{tut.marketRegime}</span>}
                          {tut.symbols && <span className="px-1.5 py-0.5 border border-border">{tut.symbols}</span>}
                          {tut.timeframe && <span>{tut.timeframe}</span>}
                          {tut.riskLevel && <span className="text-accent-up">· 风险 {tut.riskLevel}</span>}
                        </div>
                      </div>
                      <div className="text-[10px] text-text-muted num">
                        {tut.publishedAt ? new Date(tut.publishedAt).toLocaleDateString("zh-CN") : ""}
                      </div>
                      <div className="text-xs text-text-muted num text-right">
                        <span className="text-accent-purple">👁</span> {tut.viewCount.toLocaleString()}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 2. 开源合规再分发专区 (1px 底边线横向 list) */}
            <div id="releases">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent-purple" />
                  开源合规再分发专区
                </h2>
                <span className="text-xs text-text-muted">共 {total.toLocaleString()} 个资源 · {totalFeatured} 精选</span>
              </div>
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                持续收录开源 EA / 指标 / 脚本, 保留原作者版权, 平台仅做表达层汉化包装, 不修改核心算法。
                付费会员可下载, 已下载者可按原始协议自由再分发。
              </p>
              {releases.length === 0 ? (
                <div className="text-center text-text-muted text-sm py-8 border-y border-border">
                  暂无精选开源资源
                </div>
              ) : (
                <div className="border-y border-border">
                  {releases.map((r, i) => (
                    <Link
                      key={r.id}
                      href={`/open-source/${r.id}`}
                      className="group grid grid-cols-[40px_120px_1fr_100px_80px] items-center gap-3 py-3 px-3 -mx-3
                        border-b border-border last:border-b-0 hover:bg-bg-secondary transition-colors"
                    >
                      <div className="w-8 h-8 rounded border border-border bg-bg-tertiary flex items-center justify-center
                        text-accent-purple font-mono text-xs group-hover:border-accent-purple transition-colors">
                        ★
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase tracking-wider text-accent-purple font-mono">
                          {t.license(r.license).short}
                        </div>
                        <div className="text-[10px] text-text-muted">{r.tier || 'Tier 2 (Pro)'}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-primary leading-snug line-clamp-1 group-hover:text-accent-purple transition-colors">
                          {r.title}
                        </div>
                        <div className="text-[10px] text-text-muted line-clamp-1 mt-0.5">{r.description}</div>
                      </div>
                      <div className="text-xs text-text-muted num text-right">
                        <span className="text-accent-purple">↓</span> {r.downloadCount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-text-muted num text-right">
                        {r.requiredPlan}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* === 右 280px 侧栏 === */}
          <aside className="space-y-4">
            {/* 排行榜: Top 5 教程 (按 viewCount) */}
            <div id="ranking" className="border border-border">
              <h3 className="text-xs text-text-muted tracking-widest uppercase px-4 py-3 border-b border-border flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-accent-gold" />
                教程 Top 5
              </h3>
              {topTutorials.length === 0 ? (
                <p className="text-xs text-text-muted px-4 py-3">暂无数据</p>
              ) : (
                <ol className="text-xs">
                  {topTutorials.map((tt, i) => (
                    <li key={tt.slug} className="px-4 py-2.5 border-b border-border last:border-b-0">
                      <Link href={`/tutorials/${tt.slug}`}
                        className="flex items-start gap-2 group">
                        <span className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? 'bg-accent-gold text-white' :
                          i === 1 ? 'bg-accent-purple/80 text-white' :
                          i === 2 ? 'bg-accent-blue/80 text-white' :
                          'bg-bg-tertiary text-text-muted'
                        }`}>{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-text-secondary line-clamp-1 group-hover:text-accent-purple transition-colors">
                            {tt.strategyLogic || tt.slug}
                          </div>
                          <div className="text-[10px] text-text-muted num mt-0.5">
                            <span className="text-accent-purple">👁</span> {tt.viewCount.toLocaleString()} · {tt.marketRegime}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* 排行榜: Top 5 release (按 downloadCount) */}
            <div className="border border-border">
              <h3 className="text-xs text-text-muted tracking-widest uppercase px-4 py-3 border-b border-border flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-accent-up" />
                资源 Top 5
              </h3>
              {topReleases.length === 0 ? (
                <p className="text-xs text-text-muted px-4 py-3">暂无数据</p>
              ) : (
                <ol className="text-xs">
                  {topReleases.map((rr, i) => (
                    <li key={rr.id} className="px-4 py-2.5 border-b border-border last:border-b-0">
                      <Link href={`/open-source/${rr.id}`}
                        className="flex items-start gap-2 group">
                        <span className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? 'bg-accent-gold text-white' :
                          i === 1 ? 'bg-accent-purple/80 text-white' :
                          i === 2 ? 'bg-accent-blue/80 text-white' :
                          'bg-bg-tertiary text-text-muted'
                        }`}>{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-text-secondary line-clamp-1 group-hover:text-accent-purple transition-colors">
                            {rr.title}
                          </div>
                          <div className="text-[10px] text-text-muted num mt-0.5">
                            <span className="text-accent-purple">↓</span> {rr.downloadCount.toLocaleString()} · {rr.tier || 'Tier 2 (Pro)'}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* 公告 (3 占位) */}
            <div id="news" className="border border-border">
              <h3 className="text-xs text-text-muted tracking-widest uppercase px-4 py-3 border-b border-border flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-accent-blue" />
                平台公告
              </h3>
              <ul className="text-xs">
                {[
                  { date: '2026-08-10', text: 'MTT-Pro Aurora 趋势跟踪 EA 上线', tag: '新品' },
                  { date: '2026-08-08', text: 'GPL v3 协议专区扩容 +12 资源', tag: '合规' },
                  { date: '2026-08-05', text: '代封装贴牌服务全量开放 (B2B)', tag: 'B2B' },
                ].map((n, i) => (
                  <li key={i} className="px-4 py-2.5 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-text-muted num">{n.date}</span>
                      <span className="text-[10px] text-accent-purple border border-accent-purple/30 px-1.5 py-0.5 rounded-full">{n.tag}</span>
                    </div>
                    <div className="text-text-secondary leading-snug">{n.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* 法律免责 footer */}
        <div id="legal" className="mt-8 pt-4 border-t border-border text-xs text-text-secondary leading-relaxed">
          <strong className="text-text-primary">合规声明：</strong>
          本专区资源依据开源协议合规再分发, 已下载者可按原始协议条款自由再分发。
          所有资源保留原作者版权, CProTrading 仅做技术中性的表达层包装, 不修改核心算法。
          {" "}
          <Link href="/legal/gpl-notice" className="underline text-accent-blue">
            详见免责声明
          </Link>
          。
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="num text-accent-purple font-mono font-semibold">{value.toLocaleString()}</span>
    </div>
  );
}
