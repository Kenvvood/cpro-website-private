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