// task052 L3: about/page.tsx TV 风格拉平 (移除 Sidebar + bg-gradient + value-card + rounded-xl)
import { Footer } from "@/components/layout/footer";
import { ShieldIcon, TrendingUpIcon, UsersIcon, HeadphonesIcon } from "lucide-react";
import { BRAND } from "@/config/brand";

const advantages = [
  {
    icon: <ShieldIcon size={24} className="stroke-1.5 text-accent-blue" />,
    title: "本金安全为先",
    description: "严格风控体系，对冲机制是策略基石，最大限度保障资金安全",
  },
  {
    icon: <TrendingUpIcon size={24} className="stroke-1.5 text-accent-blue" />,
    title: "算法驱动决策",
    description: "全流程由模型自动生成信号，杜绝情绪化交易，纪律性强",
  },
  {
    icon: <UsersIcon size={24} className="stroke-1.5 text-accent-blue" />,
    title: "社区互助共赢",
    description: "携手交易者一起交流心得，共享策略成果",
  },
  {
    icon: <HeadphonesIcon size={24} className="stroke-1.5 text-accent-blue" />,
    title: "全程技术支持",
    description: "提供完整的系统操作培训与持续的脚本技术支持",
  },
];

const cooperationModels = [
  {
    title: "付费资源下载",
    description: "全部 EA、指标、脚本按计划付费下载，USDT 收款，链上确认后立即生效",
  },
  {
    title: "利润分成合作",
    description: "我们投入核心软件和技术，您获得净利润的 50%，利益一致",
  },
  {
    title: "技术支持服务",
    description: "一对一指导，快速响应，让您的量化之路畅通无阻",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-12 lg:py-16 space-y-12 lg:space-y-16">
        {/* Page Header */}
        <header className="border-b border-border pb-8">
          <h1 className="h1 mb-3">
            关于 {BRAND.name.zh}
          </h1>
          <p className="text-base lg:text-lg text-text-secondary max-w-2xl">
            {BRAND.slogan.zh} — 专注量化交易工具研发，助力交易者搭建可量化的交易基础设施
          </p>
        </header>

        {/* Company Story */}
        <section className="max-w-4xl">
          <h2 className="h2 mb-4">公司简介</h2>
          <div className="space-y-4 text-sm lg:text-base leading-relaxed text-text-secondary">
            <p>
              {BRAND.entity} 是一家专注于外汇量化交易工具研发的科技公司。
              我们的团队由资深的外汇交易员和专业的程序开发工程师组成，
              致力于为普通投资者提供简单、易用、稳定的量化交易解决方案。
            </p>
            <p>
              我们相信，量化交易不应该是专业机构的专利。通过我们的工具，
              交易者可以降低量化交易的进入门槛，建立稳定的投资流程。
            </p>
          </div>
        </section>

        {/* Core Advantages */}
        <section>
          <h2 className="h2 mb-6">核心优势</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advantages.map((item, i) => (
              <div key={i} className="card-base p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 border border-border rounded-sm bg-bg-tertiary shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="h3 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cooperation Models */}
        <section>
          <h2 className="h2 mb-6">合作模式</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cooperationModels.map((model, i) => (
              <div key={i} className="card-base p-6 text-center">
                <h3 className="h3 mb-3 text-accent-blue">
                  {model.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {model.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Products Overview */}
        <section>
          <h2 className="h2 mb-6">产品体系</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-base p-6">
              <h3 className="h3 mb-4 text-accent-blue">智能 EA 交易系统</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue shrink-0" />
                  趋势追踪 EA — 全自动判断趋势方向
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue shrink-0" />
                  网格马丁 EA — 经典网格加仓策略
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue shrink-0" />
                  新闻事件 EA — 自动识别重要新闻
                </li>
              </ul>
            </div>
            <div className="card-base p-6">
              <h3 className="h3 mb-4 text-accent-blue">量化指标工具</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue shrink-0" />
                  多空信号指标 — 精准把握市场转折
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue shrink-0" />
                  RSI 超买超卖指标 — 经典 RSI 优化版
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue shrink-0" />
                  批量平仓脚本 — 一键平掉全部持仓
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="max-w-md mx-auto card-base p-8 text-center">
          <h2 className="h2 mb-4">联系我们</h2>
          <div className="space-y-2 text-sm">
            <p className="text-text-secondary">
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