"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BRAND } from "@/config/brand";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/products", label: "产品中心" },
  { href: "/content", label: "内容中心" },
  { href: "/download", label: "下载中心" },
  { href: "/about", label: "关于我们" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b backdrop-blur-md bg-[rgba(10,10,15,0.9)] border-[rgba(255,255,255,0.06)]">
      <div className="h-full px-16 flex items-center justify-center relative">
        {/* Desktop Nav - centered */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium transition-colors text-gray-300 hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions - right side */}
        <div className="hidden md:flex items-center gap-4 absolute right-16">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-text-secondary hover:text-text-primary"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-bold rounded-md transition-all bg-accent text-bg-primary header-register-btn"
          >
            免费注册
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-bg-secondary border-[rgba(255,255,255,0.06)]">
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <Link href="/login" className="flex-1 text-center py-2 text-sm text-text-secondary">
                登录
              </Link>
              <Link href="/register" className="flex-1 text-center py-2 text-sm font-bold rounded-md bg-accent text-bg-primary">
                免费注册
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
