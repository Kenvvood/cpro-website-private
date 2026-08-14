// src/app/tutorials/[slug]/page.tsx
// 投研研报详情页 (task-0046 → task051 PAYMENT-REBUILD Bug-2 修复)
// L0 游客: 截断到关键章节前, 显示 ContentPaywall
// L1+ 已登录: 全文渲染
// v22.0 Phase 7.24 Batch 9: 加评论区
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContentPaywall } from "@/components/paywall/ContentPaywall";
import { CommentSection, type CommentItem } from "@/components/CommentSection";
import { t as i18n } from "@/lib/i18n";

// task051 PAYMENT-REBUILD: 截断关键章节 (PM D6=D11 决策)
const PAYWALL_KEYWORDS = ["## 实盘案例", "## 关键参数", "## 回测数据"];

// task061 3: 教程详情页动态 metadata (Tutorial.title 由 release.title 提供)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = await prisma.openSourceTutorial.findUnique({
    where: { slug },
    select: {
      marketRegime: true,
      timeframe: true,
      release: { select: { title: true } },
    },
  });
  if (!tutorial) return { title: "研报未找到 - CProTrading" };
  const title = tutorial.release.title;
  const desc = `${tutorial.marketRegime ?? ""} ${tutorial.timeframe ?? ""} 投研研报`.trim();
  return {
    title: `${title} - 投研研报 - CProTrading`,
    description: desc.slice(0, 160),
    openGraph: { title, description: desc, type: "article" },
    alternates: { canonical: `/tutorials/${slug}` },
  };
}

export function truncateMarkdown(content: string): {
  truncated: string;
  isTruncated: boolean;
  paywallHeadings: string[];
} {
  const headings: string[] = [];
  let cutIndex = -1;
  for (const kw of PAYWALL_KEYWORDS) {
    const idx = content.indexOf(kw);
    if (idx !== -1 && (cutIndex === -1 || idx < cutIndex)) {
      cutIndex = idx;
      const lineEnd = content.indexOf("\n", idx);
      headings.push(content.substring(idx, lineEnd === -1 ? idx + kw.length : lineEnd).trim());
    }
  }
  if (cutIndex === -1) {
    return { truncated: content, isTruncated: false, paywallHeadings: [] };
  }
  // 留前 1 行作为过渡 (保留 ## 实盘案例前一段落)
  const beforeCut = content.substring(0, cutIndex);
  const lastPara = beforeCut.lastIndexOf("\n\n");
  return {
    truncated: lastPara > 0 ? beforeCut.substring(0, lastPara) : beforeCut,
    isTruncated: true,
    paywallHeadings: headings,
  };
}

export const dynamic = "force-dynamic";

function renderMarkdown(md: string) {
  // 极简 Markdown 渲染 (标题/列表/表格/段落/粗体)
  // task060 S0 1.3a: boldify() 内部已 sanitize; 此处不再二次注入
  const lines = md.split("\n");
  const out: any[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("# ")) {
      out.push(<h1 key={i} className="text-3xl font-bold mt-0 mb-6">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      out.push(<h2 key={i} className="text-2xl font-semibold mt-10 mb-4 pb-2 border-b border-border">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      out.push(<h3 key={i} className="text-xl font-semibold mt-6 mb-3">{line.slice(4)}</h3>);
    } else if (line.startsWith("|") && line.trim().endsWith("|")) {
      // 表格行
      const cells = line.split("|").map(c => c.trim()).filter(c => c);
      const isSep = cells.every(c => /^[-:]+$/.test(c));
      if (!isSep) {
        out.push(
          <tr key={i}>
            {cells.map((c, idx) => (
              <td key={idx} className="border border-border px-3 py-2 text-sm" dangerouslySetInnerHTML={{ __html: boldify(c) }} />
            ))}
          </tr>
        );
      }
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      out.push(<li key={i} className="ml-6 list-disc text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: boldify(line.slice(2)) }} />);
    } else if (line.trim() === "") {
      // skip
    } else if (line.trim() === "---") {
      out.push(<hr key={i} className="my-8 border-border" />);
    } else {
      out.push(<p key={i} className="text-sm leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: boldify(line) }} />);
    }
    i++;
  }
  // 收集表格行 (tr) 合成 table
  const blocks: any[] = [];
  let buf: any[] = [];
  for (const el of out) {
    if (el && el.type === "tr") {
      buf.push(el);
    } else {
      if (buf.length > 0) {
        blocks.push(
          <table key={`t${blocks.length}`} className="w-full border-collapse my-4">
            <tbody>{buf}</tbody>
          </table>
        );
        buf = [];
      }
      blocks.push(el);
    }
  }
  if (buf.length > 0) {
    blocks.push(
      <table key={`t${blocks.length}`} className="w-full border-collapse my-4">
        <tbody>{buf}</tbody>
      </table>
    );
  }
  return blocks;
}

// task060 S0 1.3a: 最小化 HTML escape + 标签白名单 (防 LLM 内容 XSS)
// (取代 boldify 旧版仅做 **text** 替换, 直接注入 DOM)
const ALLOWED_TAGS = new Set(["strong", "em", "code", "br"]);

function sanitize(html: string): string {
  // 1) 转义全部 HTML 实体 (防 <script>, <img onerror>, <iframe> 等)
  let safe = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  // 2) 仅放行 <strong> <em> <code> <br> 四类标签 (bold/italic/code/break)
  safe = safe.replace(
    /&lt;(strong|em|code|br)(\s+[^&]*?)?\s*\/?&gt;/gi,
    (_m, tag) => {
      if (!ALLOWED_TAGS.has(tag.toLowerCase())) return "";
      return tag.toLowerCase() === "br" ? "<br/>" : `<${tag.toLowerCase()}>`;
    }
  );
  // 3) 闭合标签 (简单反转义成可输出的标签)
  safe = safe.replace(
    /&lt;\/(strong|em|code)&gt;/gi,
    (_m, tag) => `</${tag.toLowerCase()}>`
  );
  return safe;
}

function boldify(s: string) {
  // 仅在 **...** 包裹的"已知安全"文本中插入 <strong> 标签
  return s.replace(
    /\*\*([^*\n]+)\*\*/g,
    (_m, text) => `<strong>${sanitize(text)}</strong>`
  );
}

const RISK_BADGE: Record<string, string> = {
  低: "bg-green-500/15 text-green-700 border-green-500/30",
  中: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  高: "bg-red-500/15 text-red-700 border-red-500/30",
};

export default async function TutorialDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tutorial = await prisma.openSourceTutorial.findUnique({
    where: { slug },
    include: {
      release: {
        select: { id: true, title: true, license: true, originalSource: true },
      },
    },
  });
  if (!tutorial) return notFound();

  // 自增 view
  await prisma.openSourceTutorial.update({
    where: { id: tutorial.id },
    data: { viewCount: { increment: 1 } },
  });

  // task051 Bug-2: L0 游客 → 截断; L1+ 已登录 → 全文
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;
  const { truncated, isTruncated, paywallHeadings } = truncateMarkdown(tutorial.content);
  const renderContent = isLoggedIn ? tutorial.content : truncated;

  // 兼容纯文本 / JSON 数组: 优先当 JSON 解析, 失败则按 [text] 包装 (v22.0 b9 p12)
  const warnings: string[] = (() => {
    if (!tutorial.riskWarnings) return [];
    try {
      const parsed = JSON.parse(tutorial.riskWarnings);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [tutorial.riskWarnings];
    }
  })();

  // Batch 9: 评论区 (targetType='TUTORIAL', targetId=tutorial.id)
  const dbComments = await prisma.comment.findMany({
    where: { targetType: 'TUTORIAL', targetId: tutorial.id },
    orderBy: { createdAt: 'asc' },
  });
  const authorIds = Array.from(new Set(dbComments.map(c => c.authorId)));
  const authors = authorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, username: true, role: true },
      })
    : [];
  const authorMap = new Map(authors.map(a => [a.id, a]));

  // 点赞统计 + 当前用户点赞状态
  const commentIds = dbComments.map(c => c.id);
  const [likeAgg, userLikes] = commentIds.length > 0
    ? await Promise.all([
        prisma.like.groupBy({
          by: ['targetId'],
          where: { targetType: 'COMMENT', targetId: { in: commentIds } },
          _count: { _all: true },
        }),
        session?.user?.id
          ? prisma.like.findMany({
              where: { targetType: 'COMMENT', targetId: { in: commentIds }, userId: session.user.id },
              select: { targetId: true },
            })
          : Promise.resolve([] as { targetId: string }[]),
      ])
    : [[], [] as { targetId: string }[]];
  const likeCountMap = new Map((likeAgg as any[]).map(l => [l.targetId, l._count._all]));
  const likedSet = new Set((userLikes as { targetId: string }[]).map(l => l.targetId));

  const comments: CommentItem[] = dbComments.map(c => {
    const a = authorMap.get(c.authorId);
    return {
      id: c.id,
      authorId: c.authorId,
      authorName: a?.username ?? '匿名会员',
      authorRole: a?.role,
      content: c.content,
      status: c.status as any,
      sensitiveWords: c.sensitiveWords,
      forwardCount: c.forwardCount,
      likeCount: likeCountMap.get(c.id) ?? 0,
      liked: likedSet.has(c.id),
      createdAt: c.createdAt.toISOString(),
      parentId: c.parentId,
    };
  });

  // 当前用户角色 (CommentSection 用)
  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? session.user.username ?? '会员',
        role: (session.user.role as any) ?? 'MEMBER',
        isSubscriber: false,
      }
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-2 sm:pt-12 lg:pt-14 py-12">
      <Link href="/tutorials" className="text-sm text-muted-foreground hover:text-foreground">
        ← 返回研报列表
      </Link>

      <article className="mt-6">
        {/* === 顶部徽章条 === */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/30 text-xs font-semibold uppercase tracking-wider">
            CProTrading 投研
          </span>
          <span className="px-2.5 py-1 rounded bg-muted text-xs">
            {i18n.regime(tutorial.marketRegime).short}
          </span>
          {tutorial.timeframe && (
            <span className="px-2.5 py-1 rounded bg-muted text-xs">
              {i18n.timeframe(tutorial.timeframe).short}
            </span>
          )}
          {tutorial.riskLevel && (
            <span className={`px-2.5 py-1 rounded border text-xs ${RISK_BADGE[tutorial.riskLevel] ?? "bg-muted"}`}>
              {tutorial.riskLevel}风险
            </span>
          )}
          {tutorial.maxDrawdownPct && (
            <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-700 border border-red-500/30 text-xs">
              最大回撤 {Number(tutorial.maxDrawdownPct)}%
            </span>
          )}
        </div>

        {/* === 作者署名 === */}
        <div className="text-xs text-muted-foreground mb-6 pb-6 border-b border-border">
          <span className="font-semibold text-foreground">作者：CProTrading 投研团队</span>
          <span className="mx-2">·</span>
          <span>来源：{tutorial.release.originalSource}</span>
          <span className="mx-2">·</span>
          <span>协议：{i18n.license(tutorial.release.license).short}</span>
          <span className="mx-2">·</span>
          <span>{tutorial.viewCount.toLocaleString()} 次阅读</span>
        </div>

        {/* === 正文 Markdown 渲染 === */}
        <div className="prose-content">
          {renderMarkdown(renderContent)}
        </div>

        {/* task051 PAYMENT-REBUILD Bug-2 修复: L0 游客截断钩子 */}
        {isTruncated && !isLoggedIn && (
          <ContentPaywall
            paywallHeadings={paywallHeadings}
            callbackUrl={`/tutorials/${slug}`}
          />
        )}

        {/* === 风险提示醒目块 === */}
        {warnings.length > 0 && (
          <aside className="mt-10 p-4 rounded border-2 border-red-500/40 bg-red-500/5">
            <h3 className="text-red-700 font-bold mt-0 mb-2">⚠️ 实盘风险提示</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </aside>
        )}

        {/* === 商业 CTA === */}
        <aside className="mt-10 p-6 rounded border border-border bg-card">
          <h3 className="font-bold mt-0 mb-2">📄 阅读关联开源资源</h3>
          <p className="text-sm text-muted-foreground mb-3">
            本研报基于 <code className="font-mono">{tutorial.release.title}</code> 源码撰写。
            付费会员可下载该 EA 的双署名版本 (含中文 input 注释 + 启动弹窗)。
          </p>
          <Link
            href={`/open-source/${tutorial.release.id}`}
            className="inline-block px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
          >
            → 查看开源资源
          </Link>
        </aside>

        {/* === 评论区 (Batch 9) === */}
        <CommentSection
          targetType="TUTORIAL"
          targetId={tutorial.id}
          comments={comments}
          currentUser={currentUser}
        />

        {/* === 底部免责声明 === */}
        <footer className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground">
          <p>
            <strong>免责声明：</strong>
            本研报由 CProTrading 城诺科技投研团队基于开源源码分析撰写, 仅作编程学习与历史数据回测用途。
            实盘市场环境复杂多变, 任何使用本站工具导致的交易亏损, 均由用户自行承担。
          </p>
          <p className="mt-2">
            联系方式：微信 Lookee333 · 法律维权：同上
          </p>
        </footer>
      </article>
    </div>
  );
}