"use client";
// src/components/layout/header.tsx
// task052 L2 C19: 主菜单 10 项 TV 风
// v22.0 Phase 7.23: 导航重排 - 8 项
// v22.0 Phase 7.24 Batch 2: 导航借鉴 minimaxi 风格 (圆角胶囊 + hover 浅灰)
// v22.0 Phase 7.24 Batch 2 PATCH: 导航左侧靠拢 logo (PM 决策)
// v22.0 Phase 7.24 Batch 2 PATCH2: logo+nav 更紧凑 (ml-4 间距) + 登录状态分支 (PM 决策)
//   1) 未登录: 显示"登录" + "立即开通" 按钮 (右)
//   2) 已登录: 显示"会员 · {name}" 圆角胶囊按钮 (右, 点击跳 /dashboard)
//   3) 借鉴 minimaxi 风格 (PM: '具体可以借鉴目标页面')
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, UserIcon, CrownIcon } from "lucide-react";
import { TickerBar } from "./TickerBar";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/products", label: "产品中心" },
  { href: "/membership", label: "会员订阅" },
  { href: "/tools", label: "实用工具" },
  { href: "/wealth", label: "生财有道" },
  { href: "/content", label: "大航海时代" },
  { href: "/guides", label: "部署教程" },
  { href: "/about", label: "关于我们" },
];

interface SessionData {
  loggedIn: boolean;
  user?: {
    id?: string;
    name?: string | null;
    phone?: string | null;
    memberLevel?: string | null;
  };
}

// 会员等级 → 中文标签
const MEMBER_LABEL: Record<string, string> = {
  TRIAL: "试用",
  WEEKLY: "周付",
  MONTHLY: "月付",
  YEARLY: "年付",
  FOUNDER: "创始",
};

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: SessionData) => setSession(data))
      .catch(() => setSession({ loggedIn: false }));
  }, [pathname]); // pathname 变化时重新拉 (登录后跳转)

  const isLoggedIn = session?.loggedIn === true;
  const userName = session?.user?.name || session?.user?.phone || "会员";
  const memberLevel = session?.user?.memberLevel;
  const memberLabel = memberLevel ? MEMBER_LABEL[memberLevel] || memberLevel : null;

  return (
    // v22.0 Phase 7.24 Batch 15: Header 改 sticky (TickerBar 一起 108px) - 消除跟 TickerBar 之间 280px 漏白
    // 滚动后 Header+TickerBar 永远黏在顶部, 实时数据永远可见
    <header className="sticky top-0 z-40 h-[108px] bg-white/95 backdrop-blur-md border-b border-border">
      {/* v22.0 Phase 7.24 Batch 2 PATCH8: 去掉右 padding 让 right 大胆靠右 (PM 反馈)
          - 左保持 60px (跟 minimaxi 一致)
          - 右改 pr-0 (大胆靠右, 立即开通 紧贴页面右边缘) */}
      <div className="h-[78px] pl-6 md:pl-[60px] pr-0 flex items-center w-full max-w-[1920px] mx-auto">
        {/* Logo - v22.0 Phase 7.24 BATCH 15 PATCH 4: 字号再加大 (PM 拍板 MTT 11 / CPro 20)
            - PATCH 3: 168x36 svg + MTT 9 / CPro 18 (PM 觉得还不够大)
            - PATCH 4: 180x40 svg + MTT 11 / CPro 20 (PM 最终拍板)
            - viewBox 0 -5 180 40 保持, 字号 +29% vs PATCH 3 */}
        <Link href="/" className="flex items-center group shrink-0">
          {/* v22.0 Phase 7.24 BATCH 15 PATCH 6: 修 Logo CPro / Trading 重叠 (PM 反馈 "1-2px 重叠")
              - PATCH 4: width 180 / viewBox 0 -5 180 40, Trading x=91, 文字宽约 84-90px → Trading 末尾到 175-181, 紧贴 viewBox 右边 (180), 视觉重叠
              - PATCH 6: width 200 / viewBox 0 -5 200 40, Trading x=95, 文字宽 90 → 末尾到 185, viewBox 右边 200 → 右侧余量 15px
              - MTT 11/20 字号保持, CPro x=53 保持 (跟 MTT svg 装饰 x=51 紧接)
              - v22.0 BATCH 16 PATCH 2 (2026-08-14): Trading x=95→96 (PM: CPro/Trading 间加 1px 间距) */}
          <svg width="200" height="40" viewBox="0 -5 200 40" fill="none" className="shrink-0">
            <line x1="0" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="0.4" className="text-accent-gold opacity-30" />
            <line x1="10" y1="16" x2="10" y2="24" stroke="currentColor" strokeWidth="0.7" className="text-accent-down" />
            <rect x="8" y="6" width="4" height="10" className="fill-accent-down/80 group-hover:fill-accent-down transition-colors" />
            <line x1="18" y1="-5" x2="18" y2="35" stroke="currentColor" strokeWidth="0.7" className="text-accent-gold" />
            <text x="18" y="13" fontSize="11" fontWeight="500" textAnchor="middle" fill="currentColor" className="text-accent-gold" style={{ fontFamily: 'Arial, sans-serif' }}>M</text>
            <text x="18" y="23" fontSize="11" fontWeight="500" textAnchor="middle" fill="currentColor" className="text-accent-gold" style={{ fontFamily: 'Arial, sans-serif' }}>T</text>
            <text x="18" y="33" fontSize="11" fontWeight="500" textAnchor="middle" fill="currentColor" className="text-accent-gold" style={{ fontFamily: 'Arial, sans-serif' }}>T</text>
            <line x1="26" y1="6" x2="26" y2="16" stroke="currentColor" strokeWidth="0.7" className="text-accent-up" />
            <rect x="24" y="16" width="4" height="8" className="fill-accent-up/80 group-hover:fill-accent-up transition-colors" />
            <path
              d="M 30 15 L 34 15 L 35 12 L 36 18 L 37 4 L 38 26 L 39 15 L 51 15"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-pink-400/80"
            />
            <text x="53" y="24" fontSize="20" fontWeight="700" fill="currentColor" className="text-accent-gold" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '-0.02em' }}>CPro</text>
            <text x="96" y="24" fontSize="20" fontWeight="700" fill="currentColor" className="text-text-primary" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '-0.02em' }}>Trading</text>
          </svg>
        </Link>

        {/* Desktop Nav - PM PATCH6: logo+nav 整体占页面左 50%
            - 字号 15→14 + padding px-4→px-3 (每项宽度 ~80px, 8 项 ~640px)
            - 加上 Logo 110 + ml-6 24px = 774px ≈ 40% 1920 页面 */}
        {/* v22.0 Phase 7.24 BATCH 15 PATCH 11: 1280 视口拥挤修复
            - 旧 px-3 (12px): 8 链接 + padding ~880px, 加上 logo 200 + ml-6 24 = 1104, 立即开通 (104) + 登录 (62) + gap-2 (8) + pr-16 (64) = 1280+ (超出)
            - 新 px-2.5 (10px): 8 链接 ~750px, 总 ~974, 立即开通装得下 1280 视口
            - 桌面 1920 不受影响 (空间足够)
            - 移动断点 (lg < 1024) 不显示 nav, 不影响 */}
        <nav className="hidden lg:flex items-center gap-0 ml-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[14px] font-normal transition-all duration-300 ease-in-out px-2.5 py-2 rounded-[32px] whitespace-nowrap ${
                  active
                    ? "bg-[#F7F8FA] text-text-primary"
                    : "text-text-secondary hover:bg-[#F7F8FA] hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions (Desktop) - v22.0 PATCH 11: pr-16 → pr-10 (64 → 40)
            - 1280 视口: 旧 pr-16 (64) + login (62) + gap-2 (8) + cta (104) = 238, 加上 nav (880) + logo (200) + ml-6 (24) = 1342 > 1280 (挤)
            - 新 pr-10 (40) + login (62) + gap-2 (8) + cta (104) = 214, nav (750 缩) + logo (200) + ml-6 (24) = 1188 < 1280 (够)
            - 1920 桌面: 1920-1188 = 732 余量, 视觉对齐跟 2xl:px-16 (64) 仍协调 */}
        <div className="hidden lg:flex items-center gap-2 ml-auto pr-10">
          {isLoggedIn ? (
            // 已登录: 会员信息按钮 (圆角胶囊, 金色高亮, minimaxi 风格)
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-[32px] px-4 py-2 bg-accent-gold/10 text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/20 transition-all duration-300 text-sm font-medium"
            >
              <CrownIcon size={14} className="shrink-0" />
              <span>
                会员 · {userName}
                {memberLabel && <span className="ml-1 text-[10px] opacity-70">({memberLabel})</span>}
              </span>
            </Link>
          ) : (
            // 未登录: 登录 + 立即开通
            <>
              <Link
                href="/login"
                className="text-[14px] font-medium text-text-primary rounded-[32px] px-3 py-2 hover:bg-[#F7F8FA] transition-all duration-300"
              >
                登录
              </Link>
              <Link href="/membership" className="btn-primary text-sm">
                立即开通
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden p-2 text-text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="flex flex-col p-4 gap-1 max-h-[80vh] overflow-y-auto">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[15px] font-normal px-4 py-2.5 rounded-[24px] ${
                    active
                      ? "bg-[#F7F8FA] text-text-primary"
                      : "text-text-secondary hover:bg-[#F7F8FA] hover:text-text-primary"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex gap-2 pt-3 border-t border-border">
              {isLoggedIn ? (
                <Link href="/dashboard" className="flex-1 text-center text-sm rounded-[24px] px-3 py-2 bg-accent-gold/10 text-accent-gold border border-accent-gold/30">
                  会员 · {userName}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1 btn-outline text-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                    登录
                  </Link>
                  <Link href="/membership" className="flex-1 btn-primary text-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                    立即开通
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* v22.0 Phase 7.24 Batch 15: TickerBar 移入 Header 一起 sticky
          - 实时报价永远在视野里
          - 消除 Header 跟 TickerBar 之间 280px 漏白 */}
      <TickerBar />
    </header>
  );
}
