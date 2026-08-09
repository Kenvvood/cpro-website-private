"use client";
// AuthorInsights — 作者分享 (v22.0 Phase 2.1-F 重构)
// PM 反馈: '整齐的卡片方式排布就非常的AI'
// 重构: 1 张密集表格 (3 tab 切换在表头上方) + 1 个作者卡 + 1 个标签云 (全部无 card-base)
// 借鉴 fxssi / cn.investing / forex.eastmoney 风格: 密集行 + 1px 底边线
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
  { date: "2026-08-08", category: "dev", title: "持仓规模计算器的反推逻辑: 为什么 1% 风险 + 10 点止损 = 0.5 手 XAUUSD?",
    excerpt: "从凯利公式到实战仓位管理, 拆解 XAUUSD 1 手 = 100 oz 合约的盈亏模型。", readMin: 6, views: 1248 },
  { date: "2026-07-30", category: "dev", title: "工具区开发笔记: 为什么我们做了 6 款 XAUUSD/K 线计算器",
    excerpt: "从 dailyfx 30+ 工具里选了 6 个实战高频工具, 每个对应一个决策环节。", readMin: 4, views: 892 },
  { date: "2026-07-20", category: "dev", title: "MQL5 源码可读原则: 我们如何让 EA 像开源教科书一样透明",
    excerpt: "变量命名 / 函数注释 / 风控参数表, 3 个让源码自解释的实操规范。", readMin: 8, views: 1456 },
  { date: "2026-07-12", category: "dev", title: "Prisma 7 部署踩坑: dev.db 在 Vercel/ECS 上的可移植性方案",
    excerpt: "SQLite 库在 serverless vs 传统服务器的不同处理思路, cpro-website 怎么选。", readMin: 10, views: 723 },
  { date: "2026-08-03", category: "market", title: "XAUUSD 3300 关口的多空博弈: 50% 斐波那契回撤的实战用法",
    excerpt: "上周 XAUUSD 在 3300 上方 3 次测试未破, 详解 38.2% / 50% / 61.8% 三档关键位的实战意义。", readMin: 5, views: 2103 },
  { date: "2026-07-26", category: "market", title: "R:R 1:2 的实际威力: 50% 胜率长期仍盈利的数学",
    excerpt: "为什么顶级交易者只做 R:R ≥ 1:3? 用数学拆解胜率 × 盈亏比的期望值。", readMin: 5, views: 1872 },
  { date: "2026-07-15", category: "market", title: "EURUSD 1.10 关口非农数据前后的 1 小时波动规律",
    excerpt: "近 6 次非农 EURUSD 在 1.10 上下的反应, 总结 3 类入场机会的胜率。", readMin: 7, views: 1024 },
  { date: "2026-07-26", category: "tech", title: "Next.js 16 + Prisma 7 + Turbopack 实战: cpro-website 部署踩坑记录",
    excerpt: "Prisma 7 无 index.js / next/font/google 自托管 / Turbopack build warning, 三个真实踩坑。", readMin: 12, views: 658 },
  { date: "2026-07-08", category: "tech", title: "MQL5 EA 的 5 个性能陷阱: backtest 与实盘的差距从何而来",
    excerpt: "Tick 数据精度 / 滑点假设 / 隔夜利息 / 网络延迟, 4 个常见 backtest 失真场景。", readMin: 9, views: 1421 },
  { date: "2026-06-30", category: "tech", title: "ECS + Cloud Assistant 部署: aliyun-service daemon 不稳定的 workaround",
    excerpt: "Cloud Assistant 频繁 Aborted 的根因 + pm2 startup systemd 长期方案 + reboot 修复脚本。", readMin: 11, views: 534 },
];

const TAGS = [
  "XAUUSD", "EURUSD", "MQL5", "MQL4", "斐波那契", "枢轴点", "持仓规模",
  "Risk/Reward", "Prisma 7", "Next.js 16", "Turbopack", "ECS", "Cloud Assistant", "pm2",
];

export function AuthorInsights() {
  const [active, setActive] = useState<Category>("dev");
  const posts = POSTS.filter((p) => p.category === active);

  return (
    <section>
      {/* 区块头: left-aligned + 行业细节 */}
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

      {/* 2 栏布局: 左 主表 / 右 侧栏 (无 card-base, 全部 1px 底边线) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-0 border-t border-border">
        {/* 左: 主表 (3 tab 切换 + 10 行文章) */}
        <div className="lg:border-r lg:border-b-0 border-b border-border">
          {/* Tab 切换 (顶部 inline 链接, 不是 tab UI 组件) */}
          <div className="flex border-b border-border text-sm">
            {TABS.map((tab) => {
              const count = POSTS.filter((p) => p.category === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={`px-3 py-2 font-medium transition-colors relative ${
                    active === tab.key ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {tab.label} <span className={`ml-1 text-[10px] num ${active === tab.key ? "text-accent-blue" : "text-text-muted"}`}>({count})</span>
                  {active === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />}
                </button>
              );
            })}
          </div>

          {/* 文章主表 (10 行, fxssi/cn.investing 风格) */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
                <th className="text-left py-1.5 px-3 font-normal w-20">日期</th>
                <th className="text-left py-1.5 px-3 font-normal">标题</th>
                <th className="text-right py-1.5 px-3 font-normal w-16">阅读</th>
                <th className="text-right py-1.5 px-3 font-normal w-20 hidden sm:table-cell">时长</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors group cursor-pointer">
                  <td className="py-2.5 px-3 text-[10px] text-text-muted num align-top">{p.date}</td>
                  <td className="py-2.5 px-3">
                    <div className="text-text-primary font-medium group-hover:text-accent-blue transition-colors line-clamp-1 mb-0.5">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-text-muted line-clamp-1">{p.excerpt}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-[10px] text-text-muted num align-top">👁 {p.views.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-[10px] text-text-muted num align-top hidden sm:table-cell">{p.readMin} 分钟</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 右: 侧栏 (3 个密集块, 无 card-base, 1px 底边线分隔) */}
        <div className="divide-y divide-border">
          {/* 作者卡 (头像 + 名字 + bio + 3 数据行) */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 border border-border flex items-center justify-center text-text-muted">
                <UserIcon size={20} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary">Lookee</div>
                <div className="text-[10px] text-text-muted">量化交易架构师</div>
              </div>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
              8 年外汇黄金量化经验, 主导 cpro-website 全栈架构与 MQL5 EA 严选库。
            </p>
            <div className="text-[10px] text-text-muted space-y-0.5">
              <div className="flex justify-between"><span>文章</span><span className="num text-text-secondary">{POSTS.length}</span></div>
              <div className="flex justify-between"><span>阅读</span><span className="num text-text-secondary">{POSTS.reduce((s, p) => s + p.views, 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>更新</span><span className="num text-text-secondary">2026-08-08</span></div>
            </div>
            <a href="/content" className="mt-3 block text-center text-xs font-semibold py-1.5 border border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-white transition-colors">
              关注 Lookee
            </a>
          </div>

          {/* 标签云 (无 card-base, 1px 边框小标签) */}
          <div className="px-4 py-4">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">热门标签</div>
            <div className="flex flex-wrap gap-1">
              {TAGS.map((t) => (
                <a key={t} href={`/content?tag=${encodeURIComponent(t)}`} className="text-[10px] px-1.5 py-0.5 border border-border text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors">
                  {t}
                </a>
              ))}
            </div>
          </div>

          {/* 数据卡 (1px 边框, accent-blue/5 底色) */}
          <div className="px-4 py-4 bg-accent-blue/5">
            <div className="text-[10px] text-text-muted mb-1">持续更新中</div>
            <div className="text-xl num font-bold text-accent-blue mb-1">每周新增</div>
            <div className="text-[10px] text-text-secondary leading-relaxed mb-3">
              开发心得 + 市场观察 + 技术博客
            </div>
            <a href="/tools" className="block text-center text-xs font-semibold py-1.5 btn-primary">
              6 款实战工具 →
            </a>
          </div>
        </div>
      </div>

      {/* 底部: 整体说明 (fxssi "Beginners Guide" 调性) */}
      <div className="text-[10px] text-text-muted leading-relaxed border-t border-border pt-3">
        所有文章均为 Lookee 真实开发与交易经验。 引用请注明 CProTrading 城诺科技。 不构成投资建议。
      </div>
    </section>
  );
}
