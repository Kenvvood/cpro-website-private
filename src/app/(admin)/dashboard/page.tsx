// src/app/(admin)/dashboard/page.tsx — 转化漏斗监控中枢 (Phase 7 task-0048)
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { notFound } from "next/navigation";

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

  const kpis = await getKpis();
  const funnels = await getTopFunnels();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">总览仪表盘</h1>
        <p className="text-sm text-muted-foreground mt-1">CProTrading 商业化中枢实时监控</p>
      </div>

      {/* 4 大 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="A 池合规商品" value={kpis.aPoolCount.toString()} unit="EA / 指标" hint="Apache / MIT / BSD / Unlicense" color="primary" />
        <KpiCard label="研报总浏览量" value={kpis.tutorialViews.toLocaleString()} unit="次" hint="OpenSourceTutorial.viewCount 聚合" color="green" />
        <KpiCard label="白嫖下载总数" value={kpis.downloadCount.toLocaleString()} unit="次" hint="OpenSourceAccessLog DOWNLOAD 计数" color="amber" />
        <KpiCard label="USDT 转化总额" value={kpis.totalUsdt.toFixed(2)} unit="USDT" hint={`活跃会员 ${kpis.activeMembers} 人`} color="red" />
      </div>

      {/* Top 10 漏斗表 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Top 10 转化漏斗 (按升级数排序)</h2>
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

function KpiCard({ label, value, unit, hint, color }: { label: string; value: string; unit: string; hint: string; color: "primary" | "green" | "amber" | "red" }) {
  const colorMap = {
    primary: "border-primary/30 bg-primary/5",
    green: "border-green-500/30 bg-green-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    red: "border-red-500/30 bg-red-500/5",
  };
  const valColor = {
    primary: "text-primary",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
  };
  return (
    <div className={`rounded-lg border-2 ${colorMap[color]} p-5`}>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-bold ${valColor[color]}`}>{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}