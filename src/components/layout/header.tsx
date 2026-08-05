"use client";
// src/components/layout/header.tsx
// task052 L2 C19: 主菜单 10 项 TV 风 (行情/产品/开源/教程/会员/定价/帮助/内容/下载/关于)
// 兼容移动端: 汉堡折叠
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/config/brand";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/products", label: "产品中心" },
  { href: "/open-source", label: "开源专区" },
  { href: "/tutorials", label: "教程" },
  { href: "/membership", label: "会员" },
  { href: "/content", label: "内容中心" },
  { href: "/download", label: "下载中心" },
  { href: "/about", label: "关于我们" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-bg-secondary backdrop-blur-md">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-screen-2xl w-full mx-auto">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-accent-gold">
          {BRAND.name.short}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-accent-blue border-b-2 border-accent-blue pb-1" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary">
            登录
          </Link>
          <Link href="/membership" className="btn-primary text-sm">
            立即开通
          </Link>
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
        <div className="lg:hidden border-t border-border bg-bg-secondary">
          <nav className="flex flex-col p-4 gap-3 max-h-[80vh] overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-accent-blue"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Link href="/login" className="flex-1 btn-outline text-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                登录
              </Link>
              <Link href="/membership" className="flex-1 btn-primary text-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                立即开通
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}