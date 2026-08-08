import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveMembership } from "@/lib/membership";
import { checkCsrf, csrfForbidden } from "@/lib/csrf";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// POST /api/downloads/[productId] - 记录下载
// task051 PAYMENT-REBUILD Bug-1 封堵 + task063 3.2 CSRF
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // task063 3.2: CSRF 校验
    const csrf = checkCsrf(request);
    if (!csrf.ok) return csrfForbidden(csrf.reason);

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

    // task060 S0 1.2: 禁止返回 /public 下的文件 URL (架构师 8/8 C 方案)
    // (DB 中残留的 /public/downloads/* 路径全部拦截，付费用户联系客服)
    const fileUrl = product.fileUrl ?? "";
    if (fileUrl.startsWith("/public/") || fileUrl.startsWith("/downloads/")) {
      console.error(`[BLOCKED] product ${productId} fileUrl in /public: ${fileUrl}`);
      return NextResponse.json(
        { error: "该资源暂未就绪，请联系管理员" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: fileUrl,
    });
  } catch (error) {
    // task060 S0 1.2: C 方案暴力止血 - 禁止返回 /public 下的付费文件路径
    // (架构师 8/8 [已批准] C 方案)
    if ((error as any)?.code === "P2002") {
      const { productId } = await params;
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      // ⚠️ 兜底拦截：若 DB 中残留 /public/* 路径，全部返回"暂未就绪"
      // (与 sub-commit 1.2b 物理迁移配合, 后续把 1316 个 ZIP 移出 public 目录)
      const fileUrl = product?.fileUrl ?? "";
      if (fileUrl.startsWith("/public/") || fileUrl.startsWith("/downloads/")) {
        console.error(`[BLOCKED] product ${productId} fileUrl in /public: ${fileUrl}`);
        return NextResponse.json(
          { error: "该资源暂未就绪，请联系管理员" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        downloadUrl: fileUrl,
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
