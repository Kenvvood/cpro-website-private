import { HeroSection } from "@/components/features/hero-section";
import { StatsBar } from "@/components/features/stats-bar";
import { ProductCard } from "@/components/features/product-card";
import { ContentCard } from "@/components/features/content-card";
import { CTASection } from "@/components/features/cta-section";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { DownloadIcon, MessageCircleIcon, UsersIcon, TrendingUpIcon, ZapIcon, ImageIcon } from "lucide-react";
import { BRAND } from "@/config/brand";

const hotProducts = [
  {
    name: "趋势追踪EA",
    description: "智能判断趋势方向，全自动执行交易，24小时不间断",
    tags: ["MT4", "MT5"],
    icon: <TrendingUpIcon size={26} className="stroke-1.5 text-accent" />
  },
  {
    name: "多空信号指标",
    description: "精准多空信号提示，实时把握市场转折点",
    tags: ["MT4", "MT5"],
    icon: <ZapIcon size={26} className="stroke-1.5 text-accent" />
  },
  {
    name: "批量平仓脚本",
    description: "一键平掉全部持仓，支持多账号同时操作",
    tags: ["MT4", "MT5"],
    icon: <ImageIcon size={26} className="stroke-1.5 text-accent" />
  },
];

const latestContent = [
  {
    title: "EA参数优化技巧详解",
    description: "如何根据不同品种调整EA参数，获得更稳定的收益",
    date: "2024-04-10"
  },
  {
    title: "外汇小白入门完全指南",
    description: "从零开始学习外汇交易，避开新手常犯的错误",
    date: "2024-04-08"
  },
  {
    title: "客户案例：工作室月收益30%",
    description: "某工作室使用我们的EA产品，三个月实现稳定盈利",
    date: "2024-04-05"
  },
];

const quickLinks = [
  {
    title: "下载专区",
    description: "注册后即可下载全部EA、指标、脚本",
    icon: DownloadIcon,
    href: "/download"
  },
  {
    title: "技术支持",
    description: `遇到问题？联系客服微信：${BRAND.contact.wechat}`,
    icon: MessageCircleIcon,
    href: "/about"
  },
  {
    title: "加入社群",
    description: "与10000+交易者一起交流心得",
    icon: UsersIcon,
    href: "/content"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex ambient-glow">
      {/* Background Effects */}
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      {/* Sidebar */}
      <div className="w-[280px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 px-8 lg:px-12 py-10 w-full">
        {/* Hero Section */}
        <section className="mb-[60px]">
          <HeroSection />
        </section>

        {/* Stats Bar */}
        <div className="mb-10">
          <StatsBar />
        </div>

        {/* Products Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">热门产品</h2>
            <Link href="/products" className="text-sm font-medium transition-colors text-accent hover:opacity-80">
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {hotProducts.map((product, i) => (
              <ProductCard key={i} {...product} />
            ))}
          </div>
        </section>

        {/* Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8 w-full mt-12">
          {/* Main Content - flex-1 */}
          <div className="flex-1 w-full">
            <h2 className="text-2xl font-bold mb-6">最新内容</h2>
            <div className="space-y-4">
              {latestContent.map((content, i) => (
                <ContentCard key={i} {...content} />
              ))}
            </div>
          </div>

          {/* Quick Links - fixed width */}
          <div className="w-full lg:w-[320px] shrink-0">
            <h3 className="text-base font-semibold mb-4 text-text-secondary">
              快速链接
            </h3>
            <div className="space-y-3">
              {quickLinks.map((link, i) => (
                <Link key={i} href={link.href} className="block p-5 rounded-xl transition-all quick-link-card cursor-pointer">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2.5">
                    <link.icon size={16} className="stroke-1.5 text-accent" />
                    {link.title}
                  </h4>
                  <p className="text-[12px] leading-relaxed text-text-secondary">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
