// src/app/open-source/[slug]/page.tsx
// 详情页: middleware 拦截 + 详情展示 + 下载按钮
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasActiveMembership } from "@/lib/membership";
import { OpenSourceDownloadButton } from "@/components/open-source/OpenSourceDownloadButton";

export const dynamic = "force-dynamic";

const LICENSE_DESCRIPTION: Record<string, string> = {
  GPL_3: "GPL-3.0 强 copyleft — 集成 GPL-3 代码会强制整个 EA 也按 GPL-3 分发",
  GPL_2: "GPL-2.0 强 copyleft — 同上约束",
  APACHE_2_0: "Apache-2.0 宽松 — 保留版权 + LICENSE 副本即可商用",
  MIT: "MIT 极简 — 保留版权即可商用",
  BSD_3: "BSD-3-Clause 宽松 — 保留版权即可商用",
  UNLICENSE: "Unlicense 公有领域 — 无限制",
  LGPL: "LGPL — 动态链接可商用，静态链接需审查",
  MPL_2_0: "Mozilla Public License 2.0 — 文件级 copyleft",
  PROPRIETARY: "专有协议 — 需原作者明确授权",
  NO_LICENSE: "无明确许可 — 不可商用集成，仅供合规再分发",
  UNKNOWN: "未知协议 — 默认仅供合规再分发",
};

export default async function OpenSourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const release = await prisma.openSourceRelease.findUnique({
    where: { id: slug },
  });
  if (!release) return notFound();

  // 访问日志
  await prisma.openSourceAccessLog.create({
    data: {
      userId: userId ?? null,
      releaseId: release.id,
      action: "VIEW",
      ipAddress: null,
      userAgent: null,
      referrer: null,
    },
  });

  // 查询关联教程 (用于交叉引流)
  const tutorial = await prisma.openSourceTutorial.findUnique({
    where: { releaseId: release.id },
    select: { slug: true },
  });
  const tutorialSlug = tutorial?.slug;

  // 更新 viewCount
  await prisma.openSourceRelease.update({
    where: { id: release.id },
    data: { viewCount: { increment: 1 } },
  });

  // 会员门禁
  const hasAccess = userId
    ? await hasActiveMembership(userId, release.requiredPlan as any)
    : false;

  const licDesc = LICENSE_DESCRIPTION[release.license] ?? "未知协议";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/open-source" className="text-sm text-muted-foreground hover:text-foreground">
        ← 返回开源专区
      </Link>

      <article className="mt-6">
        <header className="border-b border-border pb-6">
          <h1 className="text-3xl font-bold">{release.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
              {release.license}
            </span>
            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
              来源: {release.originalSource}
            </span>
            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
              作者: {release.originalAuthor}
            </span>
            {release.tier && (
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {release.tier}
              </span>
            )}
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-3">协议说明</h2>
            <p className="text-sm text-muted-foreground">{licDesc}</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">CProTrading 包装说明</h2>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>启动弹窗：Alert 注入，标注金融免责</li>
              <li>三署名 #property copyright：原作者 / CProTrading 城诺科技 / link</li>
              <li>Input 参数面板：保留原作者注释；缺注释时自动追加中文金融术语</li>
              <li>核心算法：100% 不动，仅表达层包装</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">合规声明</h2>
            <p className="text-sm text-muted-foreground">
              本资源由 CProTrading 城诺科技依据{" "}
              <Link href="/legal/gpl-notice" className="underline">
                开源协议
              </Link>{" "}
              合规再分发。已下载者可按原始协议条款自由再分发，但必须保留原作者版权与 LICENSE 副本。
            </p>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-lg border border-border bg-card p-6">
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>👁 浏览</span>
                  <span className="font-mono">{release.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>⬇ 下载</span>
                  <span className="font-mono">{release.downloadCount.toLocaleString()}</span>
                </div>
              </div>

              <hr className="my-4 border-border" />

              {/* 交叉引流: 投研研报 (仅当有关联教程时显示) */}
              {tutorialSlug && (
                <Link
                  href={`/tutorials/${tutorialSlug}`}
                  className="block w-full mb-2 text-center px-4 py-2 rounded border border-border bg-muted/30 hover:bg-muted/60 text-sm"
                >
                  📄 阅读投研研报
                </Link>
              )}

              <OpenSourceDownloadButton
                releaseId={release.id}
                hasAccess={hasAccess}
                isLoggedIn={!!userId}
                requiredPlan={release.requiredPlan}
              />
            </div>
          </aside>
        </section>
      </article>
    </div>
  );
}