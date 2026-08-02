import Link from "next/link";
import {
  ImageIcon,
  TrendingUpIcon,
  ZapIcon,
  BookIcon,
  GraduationCapIcon,
  StarIcon,
  LightbulbIcon,
  BuildingIcon,
  UserIcon,
} from "lucide-react";

const productCategories = [
  { href: "/products?type=ea", label: "智能交易EA", icon: ImageIcon },
  { href: "/products?type=indicator", label: "技术指标", icon: TrendingUpIcon },
  { href: "/products?type=script", label: "脚本工具", icon: ZapIcon },
  { href: "/products?type=tutorial", label: "教程文档", icon: BookIcon },
];

const contentCategories = [
  { href: "/content?tutorial", label: "交易教程", icon: GraduationCapIcon },
  { href: "/content?case", label: "成功案例", icon: StarIcon },
  { href: "/content?strategy", label: "策略分享", icon: LightbulbIcon },
  { href: "/about", label: "公司简介", icon: BuildingIcon },
];

export function Sidebar() {
  return (
    <aside className="w-[280px] flex-shrink-0 hidden lg:block sidebar-bg">
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 overflow-y-auto px-10 pt-10 space-y-10">
          {/* 用户中心 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-accent">
              会员中心
            </h3>
            <nav className="flex flex-col gap-1">
              <Link
                href="/account"
                className="group flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 border-transparent hover:border-l-accent relative text-text-secondary"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md sidebar-nav-hover-bg" />
                <UserIcon size={18} className="relative z-10" />
                <span className="relative z-10">个人中心</span>
              </Link>
            </nav>
          </div>

          {/* 产品分类 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-accent">
              产品分类
            </h3>
            <nav className="flex flex-col gap-1">
              {productCategories.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 border-transparent hover:border-l-accent relative text-text-secondary"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md sidebar-nav-hover-bg" />
                  <item.icon size={18} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* 内容中心 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-accent">
              内容中心
            </h3>
            <nav className="flex flex-col gap-1">
              {contentCategories.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 border-transparent hover:border-l-accent relative text-text-secondary"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md sidebar-nav-hover-bg" />
                  <item.icon size={18} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* 注册 CTA */}
          <div className="mx-0 p-7 rounded-2xl text-center sidebar-cta">
            <h4 className="text-base font-bold mb-2 sidebar-cta-title">
              免费注册
            </h4>
            <p className="text-[13px] leading-relaxed mb-5 text-text-secondary">
              下载全部MT4/MT5量化工具
            </p>
            <Link
              href="/register"
              className="block text-sm font-bold py-3 rounded-lg transition-all sidebar-cta-btn"
            >
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
