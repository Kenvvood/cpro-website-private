// src/app/api/admin/realtime/route.ts
// task056 Phase 7: 实时监控 API (30s 轮询数据源)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      activeMembers,           // 当前活跃付费会员
      recentOrders,            // 最近 1h 新订单
      recentDownloads,         // 最近 1h 下载
      recentPaidRequiredBlocks,// 最近 1h 白嫖拦截
    ] = await Promise.all([
      prisma.membership.count({
        where: { status: "ACTIVE", expireAt: { gt: now } },
      }),
      prisma.order.count({
        where: { createdAt: { gte: lastHour } },
      }),
      prisma.downloadRecord.count({
        where: { downloadedAt: { gte: lastHour } },
      }),
      prisma.openSourceAccessLog.count({
        where: { action: "VIEW_PAID_REQUIRED", createdAt: { gte: lastHour } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      online: {
        activeMembers,
        recentOrders,
        recentDownloads,
        recentPaidRequiredBlocks,
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin realtime error:", error);
    return NextResponse.json(
      { error: "获取实时数据失败" },
      { status: 500 }
    );
  }
}