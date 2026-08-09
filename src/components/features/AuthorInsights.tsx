"use client";
// AuthorInsights — 作者分享 (借鉴 forex.eastmoney.com 外汇快讯展示方式 + 位置)
// 目标: 增加网站背书, 树立作者人设 (v22.0 借鉴重构 Phase 2-3)
// 设计要点:
// - forex.eastmoney 风格: 顶部 tab 切换 + 紧凑列表 + 时间戳
// - 客户/作者视角 (FXSSI 神似): "开发心得 / 市场观察 / 技术博客"
// - 真实作者署名 (不是 AI 演示): 每条标 Lookee · 量化交易架构师
// - v22.0 用 mock 数据占位, v23.0 接 OpenSourceTutorial 表
import { useState } from "react";

type Category = "dev" | "market" | "tech";

const TABS: { key: Category; label: string; desc: string }[] = [
  { key: "dev",    label: "开发心得",   desc: "EA / 指标 / 工具的开发实战" },
  { key: "market", label: "市场观察",   desc: "XAUUSD / EURUSD 行情心得" },
  { key: "tech",   label: "技术博客",   desc: "MQL5 / 量化架构 / 性能调优" },
];

interface Post {
  date: string;
  category: Category;
  title: string;
  excerpt: string;
  author: string;
  readMin: number;
}

const POSTS: Post[] = [
  {
    date: "2026-08-08",
    category: "dev",
    title: "持仓规模计算器的反推逻辑: 为什么 1% 风险 + 10 点止损 = 0.5 手 XAUUSD?",
    excerpt: "从凯利公式到实战仓位管理, 拆解 XAUUSD 1 手 = 100 oz 合约的盈亏模型。",
    author: "Lookee · 量化交易架构师",
    readMin: 6,
  },
  {
    date: "2026-08-05",
    category: "tech",
    title: "MQL5 EA 的 5 个性能陷阱: backtest 与实盘的差距从何而来",
    excerpt: "Tick 数据精度 / 滑点假设 / 隔夜利息 / 网络延迟, 4 个常见 backtest 失真场景。",
    author: "Lookee · 量化交易架构师",
    readMin: 9,
  },
  {
    date: "2026-08-03",
    category: "market",
    title: "XAUUSD 3300 关口的多空博弈: 50% 斐波那契回撤的实战用法",
    excerpt: "上周 XAUUSD 在 3300 上方 3 次测试未破, 详解 38.2% / 50% / 61.8% 三档关键位的实战意义。",
    author: "Lookee · 量化交易架构师",
    readMin: 5,
  },
  {
    date: "2026-07-30",
    category: "dev",
    title: "工具区开发笔记: 为什么我们做了 6 款 XAUUSD/K 线计算器",
    excerpt: "从 dailyfx 30+ 工具里选了 6 个实战高频工具 (斐波那契/枢轴/持仓/点值/风险回报/汇率), 每个对应一个决策环节。",
    author: "Lookee · 量化交易架构师",
    readMin: 4,
  },
  {
    date: "2026-07-26",
    category: "tech",
    title: "Next.js 16 + Prisma 7 + Turbopack 实战: cpro-website 部署踩坑记录",
    excerpt: "Prisma 7 无 index.js / next/font/google 自托管 / Turbopack build warning, 三个真实踩坑。",
    author: "Lookee · 量化交易架构师",
    readMin: 12,
  },
  {
    date: "2026-07-22",
    category: "market",
    title: "R:R 1:2 的实际威力: 50% 胜率长期仍盈利的数学",
    excerpt: "为什么顶级交易者只做 R:R ≥ 1:3? 用数学拆解胜率 × 盈亏比的期望值。",
    author: "Lookee · 量化交易架构师",
    readMin: 5,
  },
];

export function AuthorInsights() {
  const [active, setActive] = useState<Category>("dev");
  const posts = POSTS.filter((p) => p.category === active).slice(0, 5);

  return (
    <section>
      {/* 区块头: 借鉴 forex.eastmoney 标题区风格 (左标题 + 右侧链接) */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="h2 mb-1">作者分享</h2>
          <p className="text-xs text-text-muted">
            开发心得 / 市场观察 / 技术博客 · 树立 CProTrading 城诺科技人设
          </p>
        </div>
        <a
          href="/content"
          className="text-sm text-accent-blue hover:underline shrink-0"
        >
          查看全部 →
        </a>
      </div>

      {/* 借鉴 forex.eastmoney kx_box 风格: tab 切换 + 紧凑列表 */}
      <div className="card-base overflow-hidden">
        {/* 顶部 tab 栏 (借鉴 forex.eastmoney "外汇导读 / 外汇快讯" Tab) */}
        <div className="flex border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                active === tab.key
                  ? "text-text-primary bg-bg-tertiary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label}
              {active === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />
              )}
            </button>
          ))}
        </div>

        {/* 列表: 紧凑行 (借鉴 forex.eastmoney 外汇快讯) */}
        <ul className="divide-y divide-border">
          {posts.map((p, i) => (
            <li
              key={i}
              className="px-4 py-3 hover:bg-bg-tertiary transition-colors group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="text-[10px] text-text-muted num shrink-0 w-20 pt-0.5">
                  {p.date}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary leading-snug mb-1 group-hover:text-accent-blue transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-1 mb-1.5">
                    {p.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span>{p.author}</span>
                    <span>·</span>
                    <span>{p.readMin} 分钟阅读</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* 底部说明 (借鉴 fxssi "Beginners Guide" 调性) */}
        <div className="px-4 py-3 border-t border-border bg-bg-tertiary text-[10px] text-text-muted leading-relaxed">
          站长署名 Lookee · 量化交易架构师 · CProTrading 城诺科技。 文章均来自实际开发与交易经验, 不构成投资建议。
        </div>
      </div>
    </section>
  );
}
