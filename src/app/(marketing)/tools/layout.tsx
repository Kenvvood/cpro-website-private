// src/app/(marketing)/tools/layout.tsx
// v22.0 Phase 4: 工具区共享 layout (减少 AI 感的对称布局 → 侧栏导航 + 内容区)
// 借鉴 dailyfx.com.hk 的两列布局 (左侧分类导航 + 右侧工具内容)
import { Footer } from "@/components/layout/footer";

const TOOLS = [
  { slug: "fibonacci",   name: "斐波那契回撤",   desc: "23.6/38.2/50/61.8/78.6 关键位", category: "技术分析" },
  { slug: "pivot-point", name: "枢轴点",         desc: "R1-R3 / S1-S3 支撑阻力",     category: "技术分析" },
  { slug: "position-size", name: "持仓规模",     desc: "XAUUSD 一标准手 = 100 oz",   category: "风险管理" },
  { slug: "pip-value",   name: "点值 & 盈亏",     desc: "每点价值 + 多空盈亏",         category: "风险管理" },
  { slug: "risk-reward", name: "风险回报比",     desc: "止损止盈 R:R 评估",           category: "风险管理" },
  { slug: "forex-calculator", name: "汇率换算",  desc: "9 币种实时换算",             category: "基础工具" },
];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          {/* 左侧工具导航 (常驻侧栏, 不像 top nav 那么对称) */}
          <aside className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-text-muted mb-2">
                工具区
              </div>
              <div className="text-base font-semibold text-text-primary mb-1">
                交易者工具箱
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                XAUUSD 与外汇主流对的实战计算工具，严选高频使用场景。
              </p>
            </div>
            <nav className="space-y-1">
              {TOOLS.map((t) => (
                <a
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary border-l-2 border-transparent hover:border-accent-blue transition-colors"
                >
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{t.category}</div>
                </a>
              ))}
            </nav>
            <div className="text-[10px] text-text-muted leading-relaxed border-t border-border pt-4">
              数据为参考计算，实盘前请以 MT4/MT5 终端报价为准。
            </div>
          </aside>
          {/* 右侧内容区 */}
          <div>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export { TOOLS };
