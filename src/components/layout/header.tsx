"use client";
// src/components/layout/header.tsx
// L4 v1.10: 简化导航 5 项 (PM 决策: 聚焦 XAUUSD 黄金 + 跨品种对冲, 不堆入口)
// 保留桌面端横排 + 移动端汉堡折叠
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/products", label: "策略库" },
  { href: "/hedge", label: "跨品种对冲" },
  { href: "/tutorials", label: "教程" },
  { href: "/creator", label: "创作者" },
  { href: "/about", label: "关于" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-bg-secondary backdrop-blur-md">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full mx-auto">
        {/* Logo + 副标 */}
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-accent-gold">
            CProTrading
          </span>
          <span className="text-[11px] text-text-muted hidden sm:inline">
            | 城诺量化
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-accent-gold border-b-2 border-accent-gold pb-1"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            登录
          </Link>
          <Link href="/membership" className="btn-primary text-sm">
            开通会员
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden p-2 text-text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="菜单"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-bg-secondary">
          <nav className="flex flex-col p-4 gap-3 max-h-[80vh] overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-accent-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Link
                href="/login"
                className="flex-1 btn-outline text-center text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                登录
              </Link>
              <Link
                href="/membership"
                className="flex-1 btn-primary text-center text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                开通会员
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
