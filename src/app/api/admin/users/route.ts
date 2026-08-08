import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// task060 S0 1.1: 强制 ADMIN 鉴权 (架构师 8/8 [已批准])
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { phone: { contains: search } },
              { wechatOpenid: { contains: search } },
            ],
          }
        : undefined,
      include: {
        downloadRecords: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      users: users.map((u: Record<string, any>) => ({
        id: u.id,
        phone: (u.phone ?? '').replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
        wechat: u.wechatOpenid || "未绑定",
        createdAt: u.createdAt.toISOString().split("T")[0],
        downloadCount: u.downloadRecords.length,
      })),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "获取用户列表失败" },
      { status: 500 }
    );
  }
}