// v22.0 Phase 7.12: 从 AuthorInsights 提取侧栏成独立组件, 新增 2 块让侧栏高度 == E+F 高度
// PM: '侧边栏增加一些元素让左右两侧高度完全一致'
// v22.0 BATCH 16 PATCH 3 (2026-08-14): 头像换 PM 提供的 jpeg (山治廿一), 显示名 LOOKEE → 山治廿一
import Image from "next/image";
import { Calculator, TrendingUp, Bell } from "lucide-react";

const TAGS = [
  "XAUUSD", "黄金套利", "MQL5", "MQL4", "斐波那契", "枢轴点", "持仓规模",
  "Risk/Reward", "Prisma 7", "Next.js 16", "Turbopack", "ECS", "Cloud Assistant", "pm2",
];

// 实战工具速览 (4 工具, 跟 C Hero 钩子"实战工具集" + Footer 链接呼应)
const TOOLS = [
  { name: "斐波那契回撤", href: "/tools/fibonacci", icon: TrendingUp },
  { name: "枢轴点计算", href: "/tools/pivot-point", icon: Calculator },
  { name: "仓位规模", href: "/tools/position-size", icon: Calculator },
  { name: "R:R 风险回报", href: "/tools/risk-reward", icon: TrendingUp },
];

const POSTS_COUNT = 9;  // v22.0 Phase 7.12: 减 1 行 (dev 4 → 3)
const POSTS_VIEWS = 13098;
const POSTS_UPDATE = "2026-08-08";

export function AuthorSidebar() {
  return (
    // 5 个密集块, 无 card-base, 1px 底边线分隔, 高度对齐 E+F 合并区
    // v22.0 Phase 7.12: 2:1 比例 (左 E+F 2fr / 右 AuthorSidebar 1fr), 等高
    // v22.0 Phase 7.24 Batch 1: 侧边栏背景换白色 (PM 决策, 跟工作流保持一致)
    // v22.0 Phase 7.24 Batch 1 PATCH: 去 p-4 (父容器改白底后, 跟工作流对齐不留过多空白)
    // v22.0 Phase 7.24 Batch 1 PATCH2: 侧边栏白→浅灰 (bg-bg-tertiary, 跟工作流(白)+作者分享(白) 错落有致, PM 反馈)
    <aside className="divide-y divide-border border-t border-b border-border self-stretch bg-bg-tertiary -mx-2 px-2">
      {/* 块 1: 作者卡 (头像 + 名字 + bio + 3 数据行 + 关注 CTA) */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 border border-border overflow-hidden shrink-0">
            <Image src="/authors/shanzhi-21.jpg" alt="山治廿一 头像" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">山治廿一</div>
            <div className="text-[10px] text-text-muted">量化交易架构师</div>
          </div>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
          8 年外汇黄金量化经验, 主导 cpro-website 全栈架构与 MQL5 EA 严选库。
        </p>
        <div className="text-[10px] text-text-muted space-y-0.5">
          <div className="flex justify-between"><span>文章</span><span className="num text-text-secondary">{POSTS_COUNT}</span></div>
          <div className="flex justify-between"><span>阅读</span><span className="num text-text-secondary">{POSTS_VIEWS.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>更新</span><span className="num text-text-secondary">{POSTS_UPDATE}</span></div>
        </div>
        <a href="/content" className="mt-3 block text-center text-xs font-semibold py-1.5 border border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-white transition-colors">
          关注 山治廿一
        </a>
      </div>

      {/* 块 2: 实战工具速览 (v22.0 Phase 7.12 新增 - 4 工具链接, 让侧栏高度 == E+F) */}
      <div className="px-4 py-4">
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
          <Calculator size={11} className="text-accent-blue" />
          <span>实战工具速览</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <a key={t.href} href={t.href} className="flex items-center gap-1.5 text-[11px] px-2 py-1.5 border border-border text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors">
                <Icon size={11} className="shrink-0 text-accent-blue/70" />
                <span className="truncate">{t.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* 块 3: 标签云 */}
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

      {/* 块 4: 每周新增 CTA (持续更新中) */}
      <div className="px-4 py-4 bg-accent-blue/5">
        <div className="text-[10px] text-text-muted mb-1">持续更新中</div>
        <div className="text-xl num font-bold text-accent-blue mb-1">每周新增</div>
        <div className="text-[10px] text-text-secondary leading-relaxed mb-3">
          开发心得 + 市场观察 + 技术博客
        </div>
        <a href="/tools" className="block text-center text-xs font-semibold py-1.5 btn-primary">
          实战工具集 →
        </a>
      </div>

      {/* 块 5: 平台动态 (v22.0 Phase 7.12 新增 - 简报) */}
      <div className="px-4 py-4">
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
          <Bell size={11} className="text-accent-gold" />
          <span>平台动态</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          8 月新增趋势线 / 缠论解析工具规划中, 教程同步覆盖。
        </p>
        <a href="/content" className="mt-2 inline-block text-[11px] text-accent-blue hover:underline">
          查看更新日志 →
        </a>
      </div>
    </aside>
  );
}
