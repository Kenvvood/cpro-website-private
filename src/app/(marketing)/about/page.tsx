// v22.0 Phase 6.1-About: 去 5 处 card-base → 4 密集表格/段 + text-prose
// PM 反馈: '整齐的卡片方式排布就非常的AI' - about 页 4 优势/3 合作/2 产品/1 联系 都是 card-base
// 借鉴 fxssi / cn.investing 错落有致: 1px 底边线 + 密集行 + 表格
import { Footer } from "@/components/layout/footer";
import { BRAND } from "@/config/brand";

const ADVANTAGES = [
  { title: "本金安全为先", desc: "严格风控体系, 对冲机制是策略基石, 最大限度保障资金安全" },
  { title: "算法驱动决策", desc: "全流程由模型自动生成信号, 杜绝情绪化交易, 纪律性强" },
  { title: "社区互助共赢", desc: "携手交易者一起交流心得, 共享策略成果" },
  { title: "全程技术支持", desc: "提供完整的系统操作培训与持续的脚本技术支持" },
];

const COOPERATION = [
  { title: "付费资源下载", desc: "全部 EA / 指标 / 脚本按计划付费下载, USDT 收款, 链上确认后立即生效" },
  { title: "利润分成合作", desc: "我们投入核心软件和技术, 您获得净利润的 50%, 利益一致" },
  { title: "技术支持服务", desc: "一对一指导, 快速响应, 让您的量化之路畅通无阻" },
];

const PRODUCT_SYSTEM = [
  { title: "智能 EA 交易系统", items: ["趋势追踪 EA - 全自动判断趋势方向", "网格马丁 EA - 经典网格加仓策略", "新闻事件 EA - 自动识别重要新闻"] },
  { title: "量化指标工具", items: ["多空信号指标 - 精准把握市场转折", "RSI 超买超卖指标 - 经典 RSI 优化版", "批量平仓脚本 - 一键平掉全部持仓"] },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12 lg:py-16 space-y-12 lg:space-y-16">
        {/* Page Header */}
        <header className="border-b border-border pb-8">
          <h1 className="h1 mb-3">关于 {BRAND.name.zh}</h1>
          <p className="text-base lg:text-lg text-text-secondary max-w-2xl">
            {BRAND.slogan.zh} - 专注量化交易工具研发, 助力交易者搭建可量化的交易基础设施
          </p>
        </header>

        {/* Company Story (text-prose 长正文) */}
        <section className="max-w-4xl">
          <h2 className="h2 mb-4">公司简介</h2>
          <div className="text-prose text-sm lg:text-base">
            <p>
              {BRAND.entity} 是一家专注于外汇量化交易工具研发的科技公司。
              我们的团队由资深的外汇交易员和专业的程序开发工程师组成,
              致力于为普通投资者提供简单、易用、稳定的量化交易解决方案。
            </p>
            <p>
              我们相信, 量化交易不应该是专业机构的专利。通过我们的工具,
              交易者可以降低量化交易的进入门槛, 建立稳定的投资流程。
            </p>
          </div>
        </section>

        {/* Core Advantages (1 张密集表格 4 行, 替代 4 卡片) */}
        <section>
          <h2 className="h2 mb-6">核心优势</h2>
          <div className="border-y border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
                  <th className="text-left py-2 px-2 font-normal w-12">#</th>
                  <th className="text-left py-2 px-2 font-normal w-40">优势</th>
                  <th className="text-left py-2 px-2 font-normal">说明</th>
                </tr>
              </thead>
              <tbody>
                {ADVANTAGES.map((a, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                    <td className="py-3 px-2 text-text-muted num text-xs w-12">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-3 px-2 text-text-primary font-medium">{a.title}</td>
                    <td className="py-3 px-2 text-text-secondary">{a.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Cooperation Models (1 张密集表格 3 行, 替代 3 卡片) */}
        <section>
          <h2 className="h2 mb-6">合作模式</h2>
          <div className="border-y border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
                  <th className="text-left py-2 px-2 font-normal w-12">#</th>
                  <th className="text-left py-2 px-2 font-normal w-40">模式</th>
                  <th className="text-left py-2 px-2 font-normal">说明</th>
                </tr>
              </thead>
              <tbody>
                {COOPERATION.map((c, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                    <td className="py-3 px-2 text-text-muted num text-xs w-12">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-3 px-2 text-accent-blue font-medium">{c.title}</td>
                    <td className="py-3 px-2 text-text-secondary">{c.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Products Overview (1 张密集表格 2 行, 替代 2 卡片) */}
        <section>
          <h2 className="h2 mb-6">产品体系</h2>
          <div className="border-y border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
                  <th className="text-left py-2 px-2 font-normal w-40">分类</th>
                  <th className="text-left py-2 px-2 font-normal">代表项</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCT_SYSTEM.map((p, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                    <td className="py-3 px-2 text-accent-blue font-medium w-40">{p.title}</td>
                    <td className="py-3 px-2 text-text-secondary">
                      {p.items.map((item, j) => (
                        <span key={j} className="block text-xs">
                          - {item}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact (1 段密集文字, 替代 1 卡片) */}
        <section className="max-w-md border-t border-border pt-6">
          <h2 className="h2 mb-4">联系我们</h2>
          <div className="text-sm space-y-2">
            <p>
              技术支持微信: <span className="font-semibold text-accent-blue">{BRAND.contact.wechat}</span>
            </p>
            <p className="text-text-muted">
              工作时间: 周一至周五 9:00 - 18:00
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
