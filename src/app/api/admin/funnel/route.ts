// src/app/api/admin/funnel/route.ts
// task056 Phase 7: 漏斗 5 阶段 + 7 KPI 聚合 API
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// task060 S0 1.1: 强制 ADMIN 鉴权 (架构师 8/8 [已批准])
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 并行聚合：5 阶段漏斗 + 7 KPI
    const [
      l0AnonViews,         // L0 匿名浏览
      l1Registered,        // L1 注册用户总数
      l2ActiveMembers,     // L2 活跃付费会员
      totalUsers,          // 所有注册用户
      recentMembers,       // 7 天新增会员
      membershipsByPlan,   // 3 档付费分布
      paidUsdtSum,         // USDT 累计流水
      downloads,           // 下载总数
      viewPaidRequired,    // 白嫖拦截次数
      totalRevenue,        // 总营收
    ] = await Promise.all([
      prisma.openSourceAccessLog.count({
        where: { userId: null, action: "VIEW" },
      }),
      prisma.user.count(),
      prisma.membership.count({
        where: { status: "ACTIVE", expireAt: { gt: now } },
      }),
      prisma.user.count(),
      prisma.membership.count({
        where: { status: "ACTIVE", createdAt: { gte: weekAgo } },
      }),
      prisma.membership.groupBy({
        by: ["plan"],
        where: { status: "ACTIVE", expireAt: { gt: now } },
        _count: true,
      }),
      prisma.membership.aggregate({
        where: { status: "ACTIVE" },
        _sum: { paidAmount: true },
      }),
      prisma.downloadRecord.count(),
      prisma.openSourceAccessLog.count({
        where: { action: "VIEW_PAID_REQUIRED" },
      }),
      prisma.order.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { amount: true },
      }),
    ]);

    // 5 阶段漏斗
    const funnel = [
      { stage: "L0 浏览", count: l0AnonViews, color: "bg-text-muted" },
      { stage: "L1 注册", count: l1Registered, color: "bg-accent-blue" },
      { stage: "L1 看付费教程", count: downloads, color: "bg-accent-up" },
      { stage: "L2 付费", count: l2ActiveMembers, color: "bg-accent-gold" },
      { stage: "L2 下载", count: downloads, color: "bg-accent-down" },
    ];

    // 7 KPI
    const kpis = {
      l0ToL1: l1Registered,                    // L0 → L1 注册数
      l1ToL2: l2ActiveMembers,                 // L1 → L2 付费数
      newMembersWeek: recentMembers,           // 7 天新增付费
      weeklyUsdt: Number(paidUsdtSum._sum.paidAmount ?? 0),
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      whitePicketBlockRate: viewPaidRequired,  // 白嫖拦截次数
      downloadCount: downloads,
    };

    // 3 档付费分布
    const planDistribution = membershipsByPlan.reduce<Record<string, number>>((acc, m) => {
      acc[m.plan] = m._count;
      return acc;
    }, { WEEKLY: 0, MONTHLY: 0, ANNUAL: 0 });

    return NextResponse.json({
      success: true,
      funnel,
      kpis,
      planDistribution,
      totalUsers,
      lastUpdated: now.toISOString(),
    });
  } catch (error) {
    console.error("Admin funnel error:", error);
    return NextResponse.json(
      { error: "获取漏斗数据失败" },
      { status: 500 }
    );
  }
}