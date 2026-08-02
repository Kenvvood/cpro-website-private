import { CTASection } from "@/components/features/cta-section";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { ShieldIcon, TrendingUpIcon, UsersIcon, HeadphonesIcon } from "lucide-react";
import { BRAND } from "@/config/brand";

const advantages = [
  {
    icon: <ShieldIcon size={28} className="stroke-1.5 text-accent" />,
    title: "本金安全为先",
    description: "严格风控体系，对冲机制是策略基石，最大限度保障资金安全"
  },
  {
    icon: <TrendingUpIcon size={28} className="stroke-1.5 text-accent" />,
    title: "算法驱动决策",
    description: "全流程由模型自动生成信号，杜绝情绪化交易，纪律性强"
  },
  {
    icon: <UsersIcon size={28} className="stroke-1.5 text-accent" />,
    title: "社区互助共赢",
    description: "携手10000+交易者一起交流心得，共享策略成果"
  },
  {
    icon: <HeadphonesIcon size={28} className="stroke-1.5 text-accent" />,
    title: "全程技术支持",
    description: "提供完整的系统操作培训与持续的脚本技术支持"
  },
];

const cooperationModels = [
  {
    title: "免费产品下载",
    description: "注册后即可下载全部EA、指标、脚本，先体验再决定"
  },
  {
    title: "利润分成合作",
    description: "我们投入核心软件和技术，您获得净利润的50%，利益一致"
  },
  {
    title: "技术支持服务",
    description: "一对一指导，快速响应，让您的量化之路畅通无阻"
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex ambient-glow">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10">
        {/* Page Header */}
        <div className="px-20 py-16">
          <h1 className="text-4xl font-bold mb-4">关于{BRAND.name.zh}</h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            {BRAND.slogan.zh} — 专注量化交易工具研发，助力外汇小白轻松开启量化之路
          </p>
        </div>

        {/* Company Story */}
        <section className="px-20 py-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-6 text-accent">公司简介</h2>
            <div className="space-y-4 text-base leading-relaxed text-text-secondary">
              <p>
                {BRAND.entity}成立于2020年，是一家专注于外汇量化交易工具研发的科技公司。
                我们的团队由资深的外汇交易员和专业的程序开发工程师组成，
                致力于为普通投资者提供简单、易用、稳定的量化交易解决方案。
              </p>
              <p>
                我们相信，量化交易不应该是专业机构的专利。通过我们的工具，
                即使是外汇小白也能轻松开启量化交易之旅，实现稳定的投资收益。
              </p>
            </div>
          </div>
        </section>

        {/* Core Advantages */}
        <section className="px-20 py-12">
          <h2 className="text-2xl font-bold mb-8 text-accent">核心优势</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            {advantages.map((item, i) => (
              <div key={i} className="p-6 rounded-xl value-card">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg product-card-icon">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-100">
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
        <section className="px-20 py-12">
          <h2 className="text-2xl font-bold mb-8 text-accent">合作模式</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl">
            {cooperationModels.map((model, i) => (
              <div key={i} className="p-6 rounded-xl value-card text-center">
                <h3 className="text-lg font-semibold mb-3 text-accent">
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
        <section className="px-20 py-12">
          <h2 className="text-2xl font-bold mb-8 text-accent">产品体系</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            <div className="p-6 rounded-xl value-card">
              <h3 className="text-lg font-semibold mb-4 text-accent">智能EA交易系统</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  趋势追踪EA — 全自动判断趋势方向
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  网格马丁EA — 经典网格加仓策略
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  新闻事件EA — 自动识别重要新闻
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-xl value-card">
              <h3 className="text-lg font-semibold mb-4 text-accent">精准指标工具</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  多空信号指标 — 精准把握市场转折
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  RSI超买超卖指标 — 经典RSI优化版
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  批量平仓脚本 — 一键平掉全部持仓
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="px-20 py-12 mb-12">
          <div className="max-w-md mx-auto text-center p-8 rounded-xl value-card">
            <h2 className="text-2xl font-bold mb-6 text-accent">联系我们</h2>
            <div className="space-y-3">
              <p className="text-base text-text-secondary">
                技术支持微信：<span className="text-accent font-semibold">{BRAND.contact.wechat}</span>
              </p>
              <p className="text-sm text-text-muted">
                工作时间：周一至周五 9:00-18:00
              </p>
            </div>
          </div>
        </section>

        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
