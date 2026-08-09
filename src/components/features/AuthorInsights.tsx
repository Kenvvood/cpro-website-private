"use client";
// AuthorInsights — 作者分享 (v22.0 Phase 2.1 重构)
// PM 反馈: 不要"底部附加区", 要"整体纵向嵌入横跨几个模块"
// 设计: 2 栏布局 (左: tab + 文章列表 / 右: 作者卡片 + 标签云)
// 借鉴 forex.eastmoney.com 的"外汇吧/名家专栏" 嵌入风格
import { useState } from "react";
import { UserIcon } from "lucide-react";

type Category = "dev" | "market" | "tech";

const TABS: { key: Category; label: string; desc: string }[] = [
  { key: "dev",    label: "开发心得", desc: "EA / 指标 / 工具的开发实战" },
  { key: "market", label: "市场观察", desc: "XAUUSD / EURUSD 行情心得" },
  { key: "tech",   label: "技术博客", desc: "MQL5 / 量化架构 / 性能调优" },
];

interface Post {
  date: string;
  category: Category;
  title: string;
  excerpt: string;
  readMin: number;
  views: number;
}

const POSTS: Post[] = [
  // 开发心得 (dev) - 4 篇
  { date: "2026-08-08", category: "dev", title: "持仓规模计算器的反推逻辑: 为什么 1% 风险 + 10 点止损 = 0.5 手 XAUUSD?",
    excerpt: "从凯利公式到实战仓位管理, 拆解 XAUUSD 1 手 = 100 oz 合约的盈亏模型。", readMin: 6, views: 1248 },
  { date: "2026-07-30", category: "dev", title: "工具区开发笔记: 为什么我们做了 6 款 XAUUSD/K 线计算器",
    excerpt: "从 dailyfx 30+ 工具里选了 6 个实战高频工具, 每个对应一个决策环节。", readMin: 4, views: 892 },
  { date: "2026-07-20", category: "dev", title: "MQL5 源码可读原则: 我们如何让 EA 像开源教科书一样透明",
    excerpt: "变量命名 / 函数注释 / 风控参数表, 3 个让源码自解释的实操规范。", readMin: 8, views: 1456 },
  { date: "2026-07-12", category: "dev", title: "Prisma 7 部署踩坑: dev.db 在 Vercel/ECS 上的可移植性方案",
    excerpt: "SQLite 库在 serverless vs 传统服务器的不同处理思路, cpro-website 怎么选。", readMin: 10, views: 723 },
  // 市场观察 (market) - 3 篇
  { date: "2026-08-03", category: "market", title: "XAUUSD 3300 关口的多空博弈: 50% 斐波那契回撤的实战用法",
    excerpt: "上周 XAUUSD 在 3300 上方 3 次测试未破, 详解 38.2% / 50% / 61.8% 三档关键位的实战意义。", readMin: 5, views: 2103 },
  { date: "2026-07-26", category: "market", title: "R:R 1:2 的实际威力: 50% 胜率长期仍盈利的数学",
    excerpt: "为什么顶级交易者只做 R:R ≥ 1:3? 用数学拆解胜率 × 盈亏比的期望值。", readMin: 5, views: 1872 },
  { date: "2026-07-15", category: "market", title: "EURUSD 1.10 关口非农数据前后的 1 小时波动规律",
    excerpt: "近 6 次非农 EURUSD 在 1.10 上下的反应, 总结 3 类入场机会的胜率。", readMin: 7, views: 1024 },
  // 技术博客 (tech) - 3 篇
  { date: "2026-07-26", category: "tech", title: "Next.js 16 + Prisma 7 + Turbopack 实战: cpro-website 部署踩坑记录",
    excerpt: "Prisma 7 无 index.js / next/font/google 自托管 / Turbopack build warning, 三个真实踩坑。", readMin: 12, views: 658 },
  { date: "2026-07-08", category: "tech", title: "MQL5 EA 的 5 个性能陷阱: backtest 与实盘的差距从何而来",
    excerpt: "Tick 数据精度 / 滑点假设 / 隔夜利息 / 网络延迟, 4 个常见 backtest 失真场景。", readMin: 9, views: 1421 },
  { date: "2026-06-30", category: "tech", title: "ECS + Cloud Assistant 部署: aliyun-service daemon 不稳定的 workaround",
    excerpt: "Cloud Assistant 频繁 Aborted 的根因 + pm2 startup systemd 长期方案 + reboot 修复脚本。", readMin: 11, views: 534 },
];

// 所有标签 (右侧卡片用)
const TAGS = [
  "XAUUSD", "EURUSD", "MQL5", "MQL4", "斐波那契", "枢轴点", "持仓规模",
  "Risk/Reward", "Prisma 7", "Next.js 16", "Turbopack", "ECS", "Cloud Assistant", "pm2",
];

export function AuthorInsights() {
  const [active, setActive] = useState<Category>("dev");
  const posts = POSTS.filter((p) => p.category === active);

  return (
    <section>
      {/* 区块头: 左侧标题 + 右侧 '查看全部' 链接 (借鉴 forex.eastmoney "外汇吧" 嵌入风格) */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="h2 mb-1">作者分享</h2>
          <p className="text-xs text-text-muted">
            站长 Lookee · 量化交易架构师 · CProTrading 城诺科技 · 真实开发与交易经验分享
          </p>
        </div>
        <a href="/content" className="text-sm text-accent-blue hover:underline shrink-0">
          查看全部 →
        </a>
      </div>

      {/* 2 栏布局 (借鉴 forex.eastmoney 中部偏左"外汇快讯/外汇吧"嵌入) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* 左: 卡片 (tab + 文章列表) */}
        <div className="card-base overflow-hidden">
          {/* 顶部 tab 栏 (借鉴 forex.eastmoney kx_box 风格) */}
          <div className="flex border-b border-border">
            {TABS.map((tab) => {
              const count = POSTS.filter((p) => p.category === tab.key).length;
              return (
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
                  <span className={`ml-1.5 text-[10px] num ${active === tab.key ? "text-accent-blue" : "text-text-muted"}`}>
                    ({count})
                  </span>
                  {active === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 文章列表 (紧凑 + 长) - "纵向延伸" 5-7 篇文章 */}
          <ul className="divide-y divide-border">
            {posts.map((p, i) => (
              <li
                key={i}
                className="px-4 py-4 hover:bg-bg-tertiary transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="text-[10px] text-text-muted num shrink-0 w-20 pt-0.5">
                    {p.date}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary leading-snug mb-1.5 group-hover:text-accent-blue transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-2">
                      {p.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-text-muted">
                      <span className="num">👁 {p.views.toLocaleString()}</span>
                      <span>·</span>
                      <span>{p.readMin} 分钟阅读</span>
                      <span>·</span>
                      <span className="text-text-secondary">Lookee</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 底部: 整体说明 (fxssi "Beginners Guide" 调性) */}
          <div className="px-4 py-3 border-t border-border bg-bg-tertiary text-[10px] text-text-muted leading-relaxed">
            所有文章均为 Lookee 真实开发与交易经验。 引用请注明 CProTrading 城诺科技。 不构成投资建议。
          </div>
        </div>

        {/* 右: 作者卡片 (借鉴 fxssi "Get Started" CTA + 真人信息) */}
        <div className="space-y-4">
          {/* 作者卡片 */}
          <div className="card-base p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-bg-tertiary border border-border flex items-center justify-center text-text-muted">
                <UserIcon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary">Lookee</div>
                <div className="text-[10px] text-text-muted">量化交易架构师 · CProTrading 城诺科技</div>
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              8 年外汇黄金量化经验, 主导 cpro-website 全栈架构与 MQL5 EA 严选库。 专注 XAUUSD 主流对交易策略研发。
            </p>
            <div className="space-y-2 text-[10px] text-text-muted border-t border-border pt-3">
              <div className="flex justify-between">
                <span>文章总数</span>
                <span className="num text-text-secondary">{POSTS.length} 篇</span>
              </div>
              <div className="flex justify-between">
                <span>总阅读</span>
                <span className="num text-text-secondary">
                  {POSTS.reduce((s, p) => s + p.views, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>最近更新</span>
                <span className="num text-text-secondary">2026-08-08</span>
              </div>
            </div>
            <a
              href="/content"
              className="mt-4 block w-full text-center text-sm font-semibold py-2 border border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-white transition-colors"
            >
              关注 Lookee
            </a>
          </div>

          {/* 标签云 (借鉴 cn.investing "自选组合" 风格) */}
          <div className="card-base p-5">
            <div className="text-xs uppercase tracking-wider text-text-muted mb-3">热门标签</div>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((t) => (
                <a
                  key={t}
                  href={`/content?tag=${encodeURIComponent(t)}`}
                  className="text-[10px] px-2 py-1 border border-border text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors"
                >
                  {t}
                </a>
              ))}
            </div>
          </div>

          {/* 数据卡 (借鉴 fxssi "Web Tools" CTA 风格) */}
          <div className="card-base p-5 bg-accent-blue/5 border-accent-blue/30">
            <div className="text-xs text-text-muted mb-1">持续更新中</div>
            <div className="text-2xl num font-bold text-accent-blue mb-1">每周新增</div>
            <div className="text-[10px] text-text-secondary leading-relaxed">
              开发心得 + 市场观察 + 技术博客 · 围绕 XAUUSD / EURUSD 实战
            </div>
            <a
              href="/tools"
              className="mt-3 block w-full text-center text-sm font-semibold py-2 btn-primary"
            >
              6 款实战工具 →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
