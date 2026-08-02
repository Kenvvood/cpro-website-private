import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [userCount, monthStart, products, downloadsCount] = await Promise.all([
      prisma.user.count(),
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          downloadCount: true,
        },
        orderBy: { downloadCount: "desc" },
      }),
      prisma.downloadRecord.count(),
    ]);

    const thisMonthUsers = await prisma.user.count({
      where: {
        createdAt: { gte: monthStart },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: userCount,
        thisMonthUsers,
        totalDownloads: downloadsCount,
        products,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "获取统计数据失败" },
      { status: 500 }
    );
  }
}