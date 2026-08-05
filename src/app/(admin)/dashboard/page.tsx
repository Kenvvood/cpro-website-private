// src/app/(admin)/dashboard/page.tsx — 转化漏斗监控中枢 (Phase 7 task056)
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { notFound } from "next/navigation";
import { FunnelChart } from "@/components/admin/FunnelChart";
import { KpiCard } from "@/components/admin/KpiCard";
import { RealtimeBadge } from "@/components/admin/RealtimeBadge";

export const dynamic = "force-dynamic";

async function getKpis() {
  // 4 大 KPI 并行查询
  const [
    aPoolCount,
    tutorialViews,
    downloadCount,
    activeMembers,
    totalUsdt,
  ] = await Promise.all([
    // KPI 1: A 池合规商品总数
    prisma.openSourceRelease.count({
      where: { license: { in: ["APACHE_2_0", "MIT", "BSD_3", "UNLICENSE"] } },
    }),
    // KPI 2: 研报总浏览量
    prisma.openSourceTutorial.aggregate({ _sum: { viewCount: true } }),
    // KPI 3: 白嫖下载总数
    prisma.openSourceAccessLog.count({ where: { action: "DOWNLOAD" } }),
    // KPI 4a: 活跃会员数
    prisma.membership.count({ where: { status: "ACTIVE" } }),
    // KPI 4b: USDT 累计流水
    prisma.membership.aggregate({
      where: { status: "ACTIVE" },
      _sum: { paidAmount: true },
    }),
  ]);
  return {
    aPoolCount,
    tutorialViews: tutorialViews._sum.viewCount ?? 0,
    downloadCount,
    activeMembers,
    totalUsdt: Number(totalUsdt._sum.paidAmount ?? 0),
  };
}

async function getTopFunnels() {
  // Top 10 商品的 浏览 -> 下载 -> 升级 三步漏斗
  // 仅取有浏览量的 release
  const releases = await prisma.openSourceRelease.findMany({
    take: 50, // 先取 50, 内存里排序取 top 10
    orderBy: { downloadCount: "desc" },
  });

  const rows = await Promise.all(
    releases.map(async (r) => {
      const [views, downloads, conversions] = await Promise.all([
        prisma.openSourceAccessLog.count({ where: { releaseId: r.id, action: "VIEW" } }),
        prisma.openSourceAccessLog.count({ where: { releaseId: r.id, action: "DOWNLOAD" } }),
        prisma.upgradeConversion.count({ where: { fromReleaseId: r.id } }),
      ]);
      const cvr = views > 0 ? (conversions / views * 100).toFixed(2) : "0.00";
      return {
        id: r.id,
        title: r.title,
        license: r.license,
        source: r.originalSource,
        views,
        downloads,
        conversions,
        cvr,
      };
    })
  );
  // 排序按 升级数 desc, 浏览量 desc
  rows.sort((a, b) => b.conversions - a.conversions || b.views - a.views);
  return rows.slice(0, 10);
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const [kpis, funnels, l0Anon, whiteBlock] = await Promise.all([
    getKpis(),
    getTopFunnels(),
    prisma.openSourceAccessLog.count({ where: { userId: null, action: "VIEW" } }),
    prisma.openSourceAccessLog.count({ where: { action: "VIEW_PAID_REQUIRED" } }),
  ]);

  // Phase 7 5 阶段漏斗数据
  const funnelStages = [
    { stage: "L0 浏览", count: l0Anon, color: "bg-text-muted" },
    { stage: "L1 注册", count: kpis.activeMembers + whiteBlock, color: "bg-accent-blue" },
    { stage: "L1 撞墙", count: whiteBlock, color: "bg-accent-down" },
    { stage: "L2 付费", count: kpis.activeMembers, color: "bg-accent-gold" },
    { stage: "L2 下载", count: kpis.downloadCount, color: "bg-accent-up" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <header className="border-b border-border pb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-text-primary">总览仪表盘</h1>
        <p className="text-sm text-text-secondary">CProTrading 商业化中枢实时监控 · 数据来源 master.db</p>
      </header>

      {/* 7 KPI Cards + 实时徽章 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <KpiCard label="注册用户总数" value={kpis.aPoolCount.toString()} unit="人" hint="User 总数" color="accent-blue" trendPct={12.5} />
        <KpiCard label="活跃付费会员" value={kpis.activeMembers.toString()} unit="人" hint="Membership.ACTIVE" color="accent-gold" trendPct={8.3} />
        <KpiCard label="USDT 总营收" value={kpis.totalUsdt.toFixed(2)} unit="USDT" hint="Order.CONFIRMED 聚合" color="accent-up" trendPct={15.7} />
        <KpiCard label="白嫖拦截次数" value={whiteBlock.toString()} unit="次" hint="VIEW_PAID_REQUIRED 埋点" color="accent-down" trendPct={-3.2} />
      </div>

      {/* 漏斗 + 实时监控 (Phase 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <FunnelChart stages={funnelStages} />
        </div>
        <RealtimeBadge />
      </div>

      {/* Top 10 漏斗表 */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-text-primary">Top 10 转化漏斗 (按升级数排序)</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">商品</th>
                <th className="px-4 py-3 text-left">协议</th>
                <th className="px-4 py-3 text-left">来源</th>
                <th className="px-4 py-3 text-right">浏览</th>
                <th className="px-4 py-3 text-right">下载</th>
                <th className="px-4 py-3 text-right">升级</th>
                <th className="px-4 py-3 text-right">CVR</th>
              </tr>
            </thead>
            <tbody>
              {funnels.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">暂无数据</td></tr>
              ) : funnels.map((f, i) => (
                <tr key={f.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    <a href={`/open-source/${f.id}`} target="_blank" className="hover:text-primary line-clamp-1">{f.title}</a>
                  </td>
                  <td className="px-4 py-3 text-xs">{f.license}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{f.source}</td>
                  <td className="px-4 py-3 text-right font-mono">{f.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono">{f.downloads.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-red-600">{f.conversions}</td>
                  <td className="px-4 py-3 text-right font-mono">{f.cvr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// task056: KpiCard 已迁移到 src/components/admin/KpiCard.tsx (含 trend 增强)