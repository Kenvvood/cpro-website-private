# CPro Trading 网站 Phase 1 实施计划

> **创建日期**: 2026-04-15
> **任务类型**: Phase 1 基础建站
> **状态**: 待执行
> **设计规范**: `superpowers/SPEC-cpro-website-design.md`

---

## 一、任务概述

### 1.1 目标

按照 Tiffany Blue 设计规范，完成 Phase 1 基础建站：
- 完善首页 F 型布局
- 开发产品中心页面
- 开发内容中心页面
- 开发关于我们页面
- 实现响应式适配

### 1.2 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.2.3 | App Router |
| React | 19.2.4 | 组件化 |
| TypeScript | 5 | 类型安全 |
| Tailwind CSS | 4 | 样式 |
| shadcn/ui | 4.2.0 | UI 组件库 |

### 1.3 设计规范要点

```css
/* Tiffany Blue 色彩系统 */
--accent: #00E5DD           /* 主色调 */
--accent-secondary: #7B61FF /* 辅助色 */
--bg-primary: #0a0a0f       /* 主背景 */
--bg-secondary: #0f0f16     /* 次背景 */
--bg-card: #14141c          /* 卡片背景 */
--text-primary: #ffffff     /* 主文字 */
--text-secondary: #b0b0c0   /* 次文字 */
--text-muted: #707080       /* 弱文字 */
--border: rgba(255,255,255,0.08)
```

---

## 二、文件结构

### 2.1 目标目录结构

```
src/
├── app/
│   ├── page.tsx                    # 首页（重构）
│   ├── layout.tsx                  # 根布局（完善）
│   ├── globals.css                # 全局样式（完善CSS变量）
│   ├── products/
│   │   └── page.tsx               # 产品中心
│   ├── content/
│   │   └── page.tsx               # 内容中心
│   ├── about/
│   │   └── page.tsx               # 关于我们
│   ├── login/
│   │   └── page.tsx               # 登录页
│   └── register/
│       └── page.tsx               # 注册页
├── components/
│   ├── ui/                        # shadcn/ui 组件（已有）
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx             # 顶部导航栏
│   │   ├── sidebar.tsx            # 左侧边栏
│   │   ├── footer.tsx             # Footer
│   │   └── mobile-nav.tsx         # 移动端导航
│   └── features/
│       ├── hero-section.tsx       # Hero 区域
│       ├── stats-bar.tsx          # 数据统计条
│       ├── product-card.tsx        # 产品卡片
│       ├── content-card.tsx        # 内容卡片
│       └── cta-section.tsx         # CTA 区块
└── lib/
    └── utils.ts                   # 工具函数
```

### 2.2 需创建/修改的文件

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/app/globals.css` | 完善 CSS 变量系统 |
| 修改 | `src/app/layout.tsx` | 添加字体、全局布局 |
| 修改 | `src/app/page.tsx` | 重构为完整 F 型布局 |
| 创建 | `src/components/layout/header.tsx` | 顶部导航栏 |
| 创建 | `src/components/layout/sidebar.tsx` | 左侧边栏 |
| 创建 | `src/components/layout/footer.tsx` | Footer |
| 创建 | `src/components/layout/mobile-nav.tsx` | 移动端导航 |
| 创建 | `src/components/features/hero-section.tsx` | Hero 区域 |
| 创建 | `src/components/features/stats-bar.tsx` | 数据统计条 |
| 创建 | `src/components/features/product-card.tsx` | 产品卡片 |
| 创建 | `src/components/features/content-card.tsx` | 内容卡片 |
| 创建 | `src/components/features/cta-section.tsx` | CTA 区块 |
| 创建 | `src/app/products/page.tsx` | 产品中心页 |
| 创建 | `src/app/content/page.tsx` | 内容中心页 |
| 创建 | `src/app/about/page.tsx` | 关于我们页 |
| 创建 | `src/app/login/page.tsx` | 登录页 |
| 创建 | `src/app/register/page.tsx` | 注册页 |

---

## 三、实施任务

### Task 1: 完善 CSS 变量系统

**文件:**
- 修改: `src/app/globals.css:1-50`

**步骤:**

- [ ] **Step 1: 添加完整 CSS 变量**

```css
@layer base {
  :root {
    /* Tiffany Blue 色彩系统 */
    --accent: #00E5DD;
    --accent-secondary: #7B61FF;
    --accent-light: rgba(0,229,221,0.8);
    --accent-dim: rgba(0,229,221,0.12);
    --accent-glow: 0 0 30px rgba(0,229,221,0.5);
    --accent-glow-strong: 0 0 60px rgba(0,229,221,0.6), 0 0 120px rgba(0,229,221,0.3);

    /* 背景色 */
    --bg-primary: #0a0a0f;
    --bg-secondary: #0f0f16;
    --bg-card: #14141c;
    --bg-card-hover: #1a1a24;

    /* 文字色 */
    --text-primary: #ffffff;
    --text-secondary: #b0b0c0;
    --text-muted: #707080;

    /* 边框色 */
    --border: rgba(255,255,255,0.08);
    --border-accent: rgba(0,229,221,0.35);

    /* 字体 */
    --font-sans: 'Inter', 'Noto Sans SC', sans-serif;
    --font-mono: 'Geist Mono', monospace;
  }
}
```

- [ ] **Step 2: 添加背景装饰样式**

```css
/* 背景装饰 */
.bg-gradient {
  background: radial-gradient(ellipse at top right, rgba(0,229,221,0.15) 0%, rgba(123,97,255,0.08) 40%, transparent 70%);
}

.bg-grid {
  background-image: radial-gradient(rgba(0,229,221,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add Tiffany Blue CSS variable system and background decorations"
```

---

### Task 2: 开发 Header 组件

**文件:**
- 创建: `src/components/layout/header.tsx`

**步骤:**

- [ ] **Step 1: 创建 Header 组件**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/products", label: "产品中心" },
  { href: "/content", label: "内容中心" },
  { href: "/about", label: "关于我们" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b backdrop-blur-md"
      style={{ backgroundColor: 'rgba(10,10,15,0.9)', borderColor: 'var(--border)' }}>
      <div className="h-full px-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          <span style={{ color: 'var(--accent)', textShadow: '0 0 20px rgba(0,229,221,0.5)' }}>CPro</span>Trading
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            登录
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-bold rounded-md transition-all"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
              boxShadow: '0 0 20px rgba(0,229,221,0.4)'
            }}
          >
            免费注册
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: 'var(--text-primary)' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link href="/login" className="flex-1 text-center py-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}>
                登录
              </Link>
              <Link href="/register" className="flex-1 text-center py-2 text-sm font-bold rounded-md"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>
                免费注册
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: 更新 layout.tsx 引入 Header**

```tsx
import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });
const notoSansSC = Noto_Sans_SC({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CPro Trading - 专业MT4/MT5量化解决方案",
  description: "自主研发的智能EA、精准指标与高效脚本工具，专为外汇小白打造",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} ${notoSansSC.className}`}>
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/header.tsx src/app/layout.tsx
git commit -m "feat: add Header component with mobile menu support"
```

---

### Task 3: 开发 Sidebar 组件

**文件:**
- 创建: `src/components/layout/sidebar.tsx`

**步骤:**

- [ ] **Step 1: 创建 Sidebar 组件**

```tsx
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
    <aside className="w-[280px] flex-shrink-0 border-r hidden lg:block"
      style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(10,10,15,0.8)' }}>
      <div className="sticky top-16 p-10 space-y-10">
        {/* 产品分类 */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: 'var(--accent)' }}>
            产品分类
          </h3>
          <nav className="flex flex-col">
            {productCategories.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 border-transparent hover:border-l-[var(--accent)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <item.icon size={18} className="stroke-1.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 内容分类 */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: 'var(--accent)' }}>
            内容中心
          </h3>
          <nav className="flex flex-col">
            {contentCategories.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 border-transparent hover:border-l-[var(--accent)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <item.icon size={18} className="stroke-1.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 注册 CTA */}
        <div className="mx-4 p-7 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,221,0.1), rgba(123,97,255,0.1))',
            border: '1px solid var(--border-accent)',
            boxShadow: '0 0 30px rgba(0,229,221,0.1), inset 0 0 30px rgba(0,229,221,0.05)'
          }}>
          <h4 className="text-base font-bold mb-2"
            style={{ color: 'var(--accent)', textShadow: '0 0 20px rgba(0,229,221,0.5)' }}>
            免费注册
          </h4>
          <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            下载全部MT4/MT5量化工具
          </p>
          <Link
            href="/register"
            className="block text-sm font-bold py-3 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #00C4CC)',
              color: 'var(--bg-primary)',
              boxShadow: '0 0 20px rgba(0,229,221,0.4)'
            }}
          >
            立即注册
          </Link>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat: add Sidebar component with categories and CTA"
```

---

### Task 4: 开发首页组件

**文件:**
- 创建: `src/components/features/hero-section.tsx`
- 创建: `src/components/features/stats-bar.tsx`
- 创建: `src/components/features/product-card.tsx`
- 创建: `src/components/features/content-card.tsx`
- 创建: `src/components/features/cta-section.tsx`
- 修改: `src/app/page.tsx`

**步骤:**

- [ ] **Step 1: 创建 HeroSection**

```tsx
import Link from "next/link";
import { ZapIcon, ArrowRightIcon } from "lucide-react";

export function HeroSection() {
  return (
    <section className="px-20 py-20 border-b relative"
      style={{ borderColor: 'var(--border)' }}>
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--accent), var(--accent-secondary), transparent)',
          opacity: 0.5
        }} />

      <div className="max-w-2xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-7"
          style={{
            backgroundColor: 'rgba(0,229,221,0.15)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            boxShadow: '0 0 20px rgba(0,229,221,0.2)'
          }}>
          <ZapIcon size={14} />
          专业MT4/MT5量化解决方案
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold mb-5 leading-tight tracking-tight">
          让<span style={{ color: 'var(--accent)', textShadow: '0 0 40px rgba(0,229,221,0.5)' }}>量化交易</span>
          <br />变得简单
        </h1>

        {/* Description */}
        <p className="text-lg mb-9 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          自主研发的智能EA、精准指标与高效脚本工具，专为外汇小白打造，助您轻松开启量化交易之路
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-bold rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #00C4CC)',
              color: 'var(--bg-primary)',
              boxShadow: 'var(--accent-glow-strong)'
            }}
          >
            免费注册会员
            <ArrowRightIcon size={18} />
          </Link>
          <Link
            href="/products"
            className="px-8 py-4 text-base font-semibold rounded-lg border transition-all"
            style={{
              borderColor: 'rgba(0,229,221,0.3)',
              color: 'var(--text-primary)'
            }}
          >
            查看全部产品
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 创建 StatsBar**

```tsx
const stats = [
  { number: '10K+', label: '注册用户' },
  { number: '50+', label: '量化工具' },
  { number: '99.9%', label: '运行稳定性' },
  { number: '24/7', label: '技术支持' },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-4 border-b" style={{ borderColor: 'var(--border)' }}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-8 text-center relative transition-all hover:before:opacity-100"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {/* Top gradient line on hover */}
          <div className="absolute top-0 left-0 right-0 h-0.5 transition-opacity"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
              opacity: 0
            }} />
          <div className="text-3xl font-bold mb-1"
            style={{ color: 'var(--accent)', textShadow: '0 0 20px rgba(0,229,221,0.5)' }}>
            {stat.number}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 创建 ProductCard**

```tsx
import { ImageIcon } from "lucide-react";

interface ProductCardProps {
  name: string;
  description: string;
  tags: string[];
  icon?: React.ReactNode;
}

export function ProductCard({ name, description, tags, icon }: ProductCardProps) {
  return (
    <div
      className="p-7 rounded-xl border transition-all cursor-pointer relative overflow-hidden group"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Hover top gradient */}
      <div className="absolute top-0 left-0 right-0 h-0.5 transition-opacity"
        style={{
          background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary))',
          opacity: 0
        }} />

      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 border transition-shadow"
        style={{
          background: 'linear-gradient(135deg, var(--accent-dim), rgba(123,97,255,0.15))',
          borderColor: 'var(--border-accent)',
          boxShadow: '0 0 20px rgba(0,229,221,0.15)'
        }}
      >
        {icon || <ImageIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />}
      </div>

      <h3 className="text-[17px] font-semibold mb-2.5">{name}</h3>
      <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>

      <div className="flex gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded text-[11px] font-medium"
            style={{
              backgroundColor: 'rgba(0,229,221,0.08)',
              border: '1px solid rgba(0,229,221,0.2)',
              color: 'var(--accent)'
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 创建 ContentCard**

```tsx
import { CalendarIcon } from "lucide-react";

interface ContentCardProps {
  title: string;
  description: string;
  date: string;
}

export function ContentCard({ title, description, date }: ContentCardProps) {
  return (
    <div
      className="p-6 rounded-xl border transition-all cursor-pointer"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
        <CalendarIcon size={14} />
        {date}
      </div>
      <h3 className="text-base font-semibold mb-2 transition-colors">{title}</h3>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </div>
  );
}
```

- [ ] **Step 5: 创建 CTASection**

```tsx
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-20 border-t relative"
      style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, rgba(0,229,221,0.03) 100%)' }}>
      <div className="max-w-lg">
        <h2 className="text-3xl font-bold mb-4"
          style={{
            background: 'linear-gradient(135deg, var(--text-primary), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
          准备好开始了吗？
        </h2>
        <p className="text-[17px] leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
          注册会员，免费下载全部MT4/MT5量化工具，还有专业教程和成功案例参考
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-bold rounded-lg transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--accent), #00C4CC)',
            color: 'var(--bg-primary)',
            boxShadow: 'var(--accent-glow-strong)'
          }}
        >
          立即注册
          <ArrowRightIcon size={18} />
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: 重构首页 page.tsx**

```tsx
import { HeroSection } from "@/components/features/hero-section";
import { StatsBar } from "@/components/features/stats-bar";
import { ProductCard } from "@/components/features/product-card";
import { ContentCard } from "@/components/features/content-card";
import { CTASection } from "@/components/features/cta-section";
import { Sidebar } from "@/components/layout/sidebar";
import Link from "next/link";
import { DownloadIcon, MessageCircleIcon, UsersIcon, TrendingUpIcon, ZapIcon, ImageIcon } from "lucide-react";

const hotProducts = [
  {
    name: "趋势追踪EA",
    description: "智能判断趋势方向，全自动执行交易，24小时不间断",
    tags: ["MT4", "MT5"],
    icon: <TrendingUpIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
  },
  {
    name: "多空信号指标",
    description: "精准多空信号提示，实时把握市场转折点",
    tags: ["MT4", "MT5"],
    icon: <ZapIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
  },
  {
    name: "批量平仓脚本",
    description: "一键平掉全部持仓，支持多账号同时操作",
    tags: ["MT4", "MT5"],
    icon: <ImageIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
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
    icon: DownloadIcon
  },
  {
    title: "技术支持",
    description: "遇到问题？联系客服微信：Lookee333",
    icon: MessageCircleIcon
  },
  {
    title: "加入社群",
    description: "与10000+交易者一起交流心得",
    icon: UsersIcon
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Background Effects */}
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10">
        <HeroSection />
        <StatsBar />

        {/* Products Section */}
        <section className="px-20 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">热门产品</h2>
            <Link href="/products" className="text-sm font-medium transition-colors"
              style={{ color: 'var(--accent)' }}>
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {hotProducts.map((product, i) => (
              <ProductCard key={i} {...product} />
            ))}
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-[1fr_340px] gap-10 px-20 py-16 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Main Content */}
          <div>
            <h2 className="text-2xl font-bold mb-6">最新内容</h2>
            <div className="space-y-4">
              {latestContent.map((content, i) => (
                <ContentCard key={i} {...content} />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <aside>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
              快速链接
            </h3>
            <div className="space-y-3">
              {quickLinks.map((link, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl border transition-all"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2.5">
                    <link.icon size={16} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
                    {link.title}
                  </h4>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {link.description}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <CTASection />

        {/* Footer */}
        <footer className="py-10 px-20 flex justify-between items-center text-sm border-t"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'rgba(10,10,15,0.5)' }}>
          <span>© 2024 城诺科技 CPro Trading</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:opacity-80 transition-opacity">隐私政策</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">服务条款</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">联系我们</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/features/
git add src/app/page.tsx
git commit -m "feat: implement complete home page with F-layout"
```

---

### Task 5: 开发产品中心页面

**文件:**
- 创建: `src/app/products/page.tsx`

**步骤:**

- [ ] **Step 1: 创建产品中心页面**

```tsx
import { ProductCard } from "@/components/features/product-card";
import { Sidebar } from "@/components/layout/sidebar";
import { TrendingUpIcon, ZapIcon, ImageIcon, BookIcon } from "lucide-react";

const allProducts = [
  {
    name: "趋势追踪EA",
    description: "智能判断趋势方向，全自动执行交易，24小时不间断",
    tags: ["MT4", "MT5"],
    icon: <TrendingUpIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
  },
  {
    name: "多空信号指标",
    description: "精准多空信号提示，实时把握市场转折点",
    tags: ["MT4", "MT5"],
    icon: <ZapIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
  },
  {
    name: "批量平仓脚本",
    description: "一键平掉全部持仓，支持多账号同时操作",
    tags: ["MT4", "MT5"],
    icon: <ImageIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
  },
  {
    name: "网格马丁EA",
    description: "经典网格加仓策略，支持自定义间距和倍数",
    tags: ["MT4", "MT5"],
    icon: <TrendingUpIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
  },
  {
    name: "RSI超买超卖指标",
    description: "经典RSI指标优化版，精准把握市场转折",
    tags: ["MT4", "MT5"],
    icon: <ZapIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
  },
  {
    name: "新闻事件EA",
    description: "自动识别重要新闻事件，智能风控自动平仓",
    tags: ["MT5"],
    icon: <ImageIcon size={26} className="stroke-1.5" style={{ color: 'var(--accent)' }} />
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10">
        {/* Page Header */}
        <div className="px-20 py-12 border-b" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-3xl font-bold mb-2">产品中心</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            浏览全部MT4/MT5量化工具，注册后即可免费下载
          </p>
        </div>

        {/* Products Grid */}
        <section className="px-20 py-12">
          <div className="grid grid-cols-3 gap-5">
            {allProducts.map((product, i) => (
              <ProductCard key={i} {...product} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-20 flex justify-between items-center text-sm border-t"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'rgba(10,10,15,0.5)' }}>
          <span>© 2024 城诺科技 CPro Trading</span>
          <div className="flex gap-6">
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
            <a href="#">联系我们</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/products/page.tsx
git commit -m "feat: add products listing page"
```

---

### Task 6: 开发内容中心页面

**文件:**
- 创建: `src/app/content/page.tsx`

**步骤:**

- [ ] **Step 1: 创建内容中心页面**

```tsx
import { ContentCard } from "@/components/features/content-card";
import { Sidebar } from "@/components/layout/sidebar";

const tutorials = [
  {
    title: "EA参数优化技巧详解",
    description: "如何根据不同品种调整EA参数，获得更稳定的收益",
    date: "2024-04-10"
  },
  {
    title: "MT4安装EA详细教程",
    description: "一步一步教你如何在MT4上安装和运行EA",
    date: "2024-04-08"
  },
  {
    title: "指标参数调整入门",
    description: "了解常用指标参数含义及调整方法",
    date: "2024-04-05"
  },
];

const cases = [
  {
    title: "客户案例：工作室月收益30%",
    description: "某工作室使用我们的EA产品，三个月实现稳定盈利",
    date: "2024-04-08"
  },
  {
    title: "兼职交易者：稳定月收益5%",
    description: "全职工作之余，用EA实现额外收入",
    date: "2024-04-06"
  },
];

const strategies = [
  {
    title: "伦敦突破策略详解",
    description: "利用伦敦开盘时段进行突破交易",
    date: "2024-04-10"
  },
  {
    title: "网格策略的风险控制",
    description: "如何设置合理的网格间距和止损",
    date: "2024-04-07"
  },
];

export default function ContentPage() {
  return (
    <div className="min-h-screen flex">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10">
        {/* Page Header */}
        <div className="px-20 py-12 border-b" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-3xl font-bold mb-2">内容中心</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            交易教程、成功案例、策略分享，帮助您更好地使用量化工具
          </p>
        </div>

        {/* Content Sections */}
        <section className="px-20 py-12 space-y-12">
          {/* Tutorials */}
          <div>
            <h2 className="text-xl font-bold mb-6">交易教程</h2>
            <div className="grid grid-cols-3 gap-5">
              {tutorials.map((item, i) => (
                <ContentCard key={i} {...item} />
              ))}
            </div>
          </div>

          {/* Cases */}
          <div>
            <h2 className="text-xl font-bold mb-6">成功案例</h2>
            <div className="grid grid-cols-3 gap-5">
              {cases.map((item, i) => (
                <ContentCard key={i} {...item} />
              ))}
            </div>
          </div>

          {/* Strategies */}
          <div>
            <h2 className="text-xl font-bold mb-6">策略分享</h2>
            <div className="grid grid-cols-3 gap-5">
              {strategies.map((item, i) => (
                <ContentCard key={i} {...item} />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-20 flex justify-between items-center text-sm border-t"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'rgba(10,10,15,0.5)' }}>
          <span>© 2024 城诺科技 CPro Trading</span>
          <div className="flex gap-6">
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
            <a href="#">联系我们</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/content/page.tsx
git commit -m "feat: add content center page"
```

---

### Task 7: 开发关于我们页面

**文件:**
- 创建: `src/app/about/page.tsx`

**步骤:**

- [ ] **Step 1: 创建关于我们页面**

```tsx
import { CTASection } from "@/components/features/cta-section";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="relative z-10">
        {/* Page Header */}
        <div className="px-20 py-16 border-b text-center" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-4xl font-bold mb-4">关于城诺科技</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            专注量化交易工具研发，助力外汇小白轻松开启量化之路
          </p>
        </div>

        {/* Company Story */}
        <section className="px-20 py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">公司简介</h2>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              城诺科技成立于2020年，是一家专注于外汇量化交易工具研发的科技公司。
              我们的团队由资深的外汇交易员和专业的程序开发工程师组成，
              致力于为普通投资者提供简单、易用、稳定的量化交易解决方案。
            </p>
            <p>
              我们相信，量化交易不应该是专业机构的专利。通过我们的工具，
              即使是外汇小白也能轻松开启量化交易之旅，实现稳定的投资收益。
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="px-20 py-16 border-t" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-bold mb-8 text-center">我们的价值观</h2>
          <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { title: "简单易用", description: "让复杂的技术为用户隐藏，简单几步即可开始量化交易" },
              { title: "稳定可靠", description: "经过严格测试，确保工具在各种市场环境下稳定运行" },
              { title: "持续优化", description: "不断根据用户反馈和市场变化优化产品，保持竞争力" },
            ].map((value, i) => (
              <div key={i} className="text-center p-6 rounded-xl"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--accent)' }}>
                  {value.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="px-20 py-16 border-t" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-bold mb-8 text-center">联系我们</h2>
          <div className="max-w-md mx-auto text-center">
            <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
              技术支持微信：Lookee333
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              工作时间：周一至周五 9:00-18:00
            </p>
          </div>
        </section>

        <CTASection />

        {/* Footer */}
        <footer className="py-10 px-20 flex justify-between items-center text-sm border-t"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'rgba(10,10,15,0.5)' }}>
          <span>© 2024 城诺科技 CPro Trading</span>
          <div className="flex gap-6">
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
            <a href="#">联系我们</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: add about page"
```

---

### Task 8: 开发登录/注册页面

**文件:**
- 创建: `src/app/login/page.tsx`
- 创建: `src/app/register/page.tsx`

**步骤:**

- [ ] **Step 1: 创建登录页面**

```tsx
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <span style={{ color: 'var(--accent)' }}>CPro</span>Trading
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            专业MT4/MT5量化解决方案
          </p>
        </div>

        <div className="p-8 rounded-2xl border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-6 text-center">登录账号</h2>

          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                手机号
              </label>
              <Input
                type="tel"
                placeholder="请输入手机号"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                密码
              </label>
              <Input
                type="password"
                placeholder="请输入密码"
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span style={{ color: 'var(--text-muted)' }}>记住我</span>
              </label>
              <a href="#" className="font-medium" style={{ color: 'var(--accent)' }}>
                忘记密码？
              </a>
            </div>

            <Button className="w-full" size="lg"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #00C4CC)',
                color: 'var(--bg-primary)'
              }}>
              登录
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            还没有账号？{" "}
            <Link href="/register" className="font-medium" style={{ color: 'var(--accent)' }}>
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建注册页面**

```tsx
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <span style={{ color: 'var(--accent)' }}>CPro</span>Trading
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            专业MT4/MT5量化解决方案
          </p>
        </div>

        <div className="p-8 rounded-2xl border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-6 text-center">注册账号</h2>

          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                手机号
              </label>
              <Input
                type="tel"
                placeholder="请输入手机号"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                验证码
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="请输入验证码"
                  className="flex-1"
                />
                <Button variant="outline" className="whitespace-nowrap">
                  获取验证码
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                设置密码
              </label>
              <Input
                type="password"
                placeholder="请设置密码"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                确认密码
              </label>
              <Input
                type="password"
                placeholder="请确认密码"
                className="w-full"
              />
            </div>

            <Button className="w-full" size="lg"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #00C4CC)',
                color: 'var(--bg-primary)'
              }}>
              注册
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            已有账号？{" "}
            <Link href="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
              立即登录
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          注册即表示同意{" "}
          <a href="#" style={{ color: 'var(--accent)' }}>服务条款</a> 和{" "}
          <a href="#" style={{ color: 'var(--accent)' }}>隐私政策</a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx src/app/register/page.tsx
git commit -m "feat: add login and register pages"
```

---

### Task 9: 完善 Footer 组件并统一布局

**文件:**
- 创建: `src/components/layout/footer.tsx`

**步骤:**

- [ ] **Step 1: 创建 Footer 组件**

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-10 px-20 flex justify-between items-center text-sm border-t"
      style={{
        borderColor: 'var(--border)',
        color: 'var(--text-muted)',
        backgroundColor: 'rgba(10,10,15,0.5)'
      }}>
      <span>© 2024 城诺科技 CPro Trading</span>
      <div className="flex gap-6">
        <Link href="#" className="hover:opacity-80 transition-opacity">隐私政策</Link>
        <Link href="#" className="hover:opacity-80 transition-opacity">服务条款</Link>
        <Link href="#" className="hover:opacity-80 transition-opacity">联系我们</Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "feat: add Footer component"
```

---

### Task 10: 响应式适配

**文件:**
- 修改: 各页面组件

**步骤:**

- [ ] **Step 1: 添加响应式工具类到 globals.css**

```css
/* 响应式断点 */
@media (max-width: 1024px) {
  .sidebar-left { display: none; }
}

@media (max-width: 768px) {
  .hero-section,
  .products-section,
  .content-grid {
    padding-left: 32px;
    padding-right: 32px;
  }

  .product-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .hero-section,
  .products-section,
  .content-grid {
    padding-left: 20px;
    padding-right: 20px;
  }

  .product-cards {
    grid-template-columns: 1fr;
  }

  .stats-bar {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add responsive breakpoints for mobile adaptation"
```

---

## 四、验证清单

- [ ] CSS 变量系统完整
- [ ] Header 组件正常工作
- [ ] Sidebar 组件正常工作
- [ ] Footer 组件正常工作
- [ ] 首页 F 型布局完整
- [ ] 产品中心页面正常
- [ ] 内容中心页面正常
- [ ] 关于我们页面正常
- [ ] 登录页面正常
- [ ] 注册页面正常
- [ ] 移动端适配完成
- [ ] 页面间导航正常

---

## 五、下一步

Phase 1 完成后，进入 Phase 2：

1. **数据库设计** - 用户表、产品表、内容表
2. **会员功能** - 登录注册逻辑
3. **产品管理** - CMS 内容管理
4. **下载功能** - 文件下载逻辑

---

**版本**: v1.0
**创建**: 2026-04-15
**下一步**: 开始执行 Task 1
