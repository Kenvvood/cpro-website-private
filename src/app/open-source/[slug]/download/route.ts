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

// task060 S0 1.2b: 路径白名单根 (防目录穿越)
const ALLOWED_ROOTS = [PROJECT_ROOT, REDISTRIBUTE_DIR].map((p) =>
  path.resolve(p)
);

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

  // task060 S0 1.2b: 路径白名单 + realpath 校验 (防目录穿越 / symlink 攻击)
  const resolved = path.resolve(physical);
  const inAllowed = ALLOWED_ROOTS.some(
    (root) => resolved === root || resolved.startsWith(root + path.sep)
  );
  if (!inAllowed) {
    console.error(`[BLOCKED path-traversal] release=${release.id} resolved=${resolved}`);
    return NextResponse.json(
      { ok: false, error: "路径越界" },
      { status: 403 }
    );
  }
  let realPath = resolved;
  try {
    realPath = fs.realpathSync(resolved);
  } catch {
    /* 文件不存在 */
  }
  const realInAllowed = ALLOWED_ROOTS.some(
    (root) => realPath === root || realPath.startsWith(root + path.sep)
  );
  if (!realInAllowed) {
    console.error(`[BLOCKED symlink-escape] release=${release.id} realPath=${realPath}`);
    return NextResponse.json(
      { ok: false, error: "路径越界" },
      { status: 403 }
    );
  }

  if (!fs.existsSync(realPath)) {
    return NextResponse.json(
      { ok: false, error: "文件暂未就绪" },
      { status: 500 }
    );
  }

  // task060 S0 1.2b: 去重埋点 (旧版 line 53-69 + line 71-90 重复写 DOWNLOAD)
  try {
    await prisma.$transaction([
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
  } catch (e) {
    console.error("[download埋点失败, 不阻塞下载]", e);
  }

  const stat = fs.statSync(realPath);
  const stream = fs.createReadStream(realPath);
  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(stat.size),
      "Content-Disposition": `attachment; filename="${path.basename(realPath)}"`,
    },
  });
}