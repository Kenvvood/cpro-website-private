// src/app/open-source/[slug]/download/route.ts
// 下载 API: middleware 拦截 + 会员校验 + 物理文件返回
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveMembership } from "@/lib/membership";
import { prisma } from "@/lib/prisma";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const REDISTRIBUTE_DIR = path.join(process.cwd(), "cpro_patched_redistribute");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=/open-source/${slug}`, req.url));
  }

  const release = await prisma.openSourceRelease.findUnique({ where: { id: slug } });
  if (!release) {
    return NextResponse.json({ ok: false, error: "release not found" }, { status: 404 });
  }

  const hasAccess = await hasActiveMembership(userId, release.requiredPlan as any);
  if (!hasAccess) {
    return NextResponse.redirect(new URL("/membership", req.url));
  }

  // 物理文件路径 (经 path_resolver 解析 - 适配 D:\CodeBase 历史路径)
  let physical = release.fileUrl;
  if (physical.startsWith("D:\\CodeBase\\") || physical.startsWith("D:/CodeBase/")) {
    const tail = physical.replace(/^D:[\/\\]CodeBase[\/\\]/, "").replace(/\\/g, "/");
    physical = path.join(PROJECT_ROOT, tail);
  } else if (physical.startsWith("source-collection/") || physical.startsWith("source-collection\\")) {
    physical = path.join(PROJECT_ROOT, physical.replace(/\\/g, "/"));
  } else {
    physical = path.join(REDISTRIBUTE_DIR, release.originalSource, release.originalAuthor, path.basename(release.fileUrl));
  }

  if (!fs.existsSync(physical)) {
    return NextResponse.json(
      { ok: false, error: "file missing on disk", path: physical },
      { status: 500 }
    );
  }

  // 记录日志 + 自增 downloadCount
  await Promise.all([
    prisma.openSourceAccessLog.create({
      data: {
        userId,
        releaseId: release.id,
        action: "DOWNLOAD",
        ipAddress: req.headers.get("x-forwarded-for") ?? null,
        userAgent: req.headers.get("user-agent") ?? null,
        referrer: req.headers.get("referer") ?? null,
      },
    }),
    prisma.openSourceRelease.update({
      where: { id: release.id },
      data: { downloadCount: { increment: 1 } },
    }),
  ]);

  // 记录 DOWNLOAD 埋点 (Phase 7 task-0048)
  // 容错: 即使记录失败也不阻塞下载主流程 (架构师叮嘱)
  try {
    await prisma.openSourceAccessLog.create({
      data: {
        userId,
        releaseId: release.id,
        action: "DOWNLOAD",
        ipAddress: req.headers.get("x-forwarded-for") ?? null,
        userAgent: req.headers.get("user-agent") ?? null,
        referrer: req.headers.get("referer") ?? null,
      },
    });
    // 自增 downloadCount
    await prisma.openSourceRelease.update({
      where: { id: release.id },
      data: { downloadCount: { increment: 1 } },
    });
  } catch (e) {
    console.error("[download埋点失败, 不阻塞下载]", e);
  }

  const stat = fs.statSync(physical);
  const stream = fs.createReadStream(physical);
  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(stat.size),
      "Content-Disposition": `attachment; filename="${path.basename(physical)}"`,
    },
  });
}