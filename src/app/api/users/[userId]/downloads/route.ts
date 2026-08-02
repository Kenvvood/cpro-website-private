import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

// GET /api/users/[userId]/downloads - 获取用户下载记录
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    // Verify the user is accessing their own data
    const currentUserId = (session.user as any).id;
    if (currentUserId !== userId) {
      return NextResponse.json(
        { error: "无权访问" },
        { status: 403 }
      );
    }

    const downloads = await prisma.downloadRecord.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            version: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { downloadedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      downloads: downloads.map((d: Record<string, any>) => ({
        id: d.id,
        product: d.product,
        downloadedAt: d.downloadedAt,
      })),
    });
  } catch (error) {
    console.error("获取下载记录错误:", error);
    return NextResponse.json(
      { error: "获取下载记录失败" },
      { status: 500 }
    );
  }
}
