import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveMembership } from "@/lib/membership";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// POST /api/downloads/[productId] - 记录下载
// task051 PAYMENT-REBUILD Bug-1 封堵: 必须有有效会员才能下载
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { productId } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "产品不存在" },
        { status: 404 }
      );
    }

    // task051 Bug-1 修复: 必须有符合 requiredPlan 的有效会员
    const hasAccess = await hasActiveMembership(userId, product.requiredPlan);
    if (!hasAccess) {
      // task056 Phase 7: 埋点 - 白嫖拦截日志
      await prisma.openSourceAccessLog.create({
        data: {
          userId,
          releaseId: product.id,
          action: "VIEW_PAID_REQUIRED",
          ipAddress: null,
          userAgent: null,
          referrer: null,
        },
      }).catch(() => { /* 埋点失败不阻断主流程 */ });
      return NextResponse.json(
        { error: "需要付费会员才能下载", requiredPlan: product.requiredPlan },
        { status: 403 }
      );
    }

    // Create download record and increment count in transaction
    await prisma.$transaction([
      prisma.downloadRecord.create({
        data: {
          userId,
          productId,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      downloadUrl: product.fileUrl,
    });
  } catch (error) {
    // If download record already exists, just return the URL
    if ((error as any)?.code === "P2002") {
      const { productId } = await params;
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      return NextResponse.json({
        success: true,
        downloadUrl: product?.fileUrl,
        alreadyDownloaded: true,
      });
    }

    console.error("记录下载错误:", error);
    return NextResponse.json(
      { error: "记录下载失败" },
      { status: 500 }
    );
  }
}
