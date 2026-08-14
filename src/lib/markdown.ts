// src/lib/markdown.ts — Markdown 截断工具
// v22.0 BATCH 16 PATCH 7.5: 从 tutorials/[slug]/page.tsx 移出, 避免 page.tsx 顶层 export
// Next.js 16 page.tsx 只允许 default/generateMetadata/generateStaticParams 等, 其他 export 会 fail build

const PAYWALL_KEYWORDS = ["## 实盘案例", "## 关键参数", "## 回测数据"];

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
  // 留前 1 段作为过渡 (保留 ## 实盘案例前一段落)
  const beforeCut = content.substring(0, cutIndex);
  const lastPara = beforeCut.lastIndexOf("\n\n");
  return {
    truncated: lastPara > 0 ? beforeCut.substring(0, lastPara) : beforeCut,
    isTruncated: true,
    paywallHeadings: headings,
  };
}
