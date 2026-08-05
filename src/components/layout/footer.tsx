import Link from "next/link";
import { GitBranch, MessageCircle, Mail, X, Globe } from "lucide-react";
import { BRAND } from "@/config/brand";

// L4 v1.6: 借 TradingView cn.tradingview.com 多列页脚
// 5 列布局: 公司简介 / 产品 / 资源 / 法律 / 联系 + 社交图标 + ICP + 风险提示
// 不抄 TV 9 社交 (X/FB/YT/IG/LinkedIn/Telegram/TikTok/Reddit), 只做 4 个真实触点
const COLUMNS = [
  {
    title: "产品",
    links: [
      { href: "/products", label: "产品中心" },
      { href: "/open-source", label: "开源专区" },
      { href: "/tutorials", label: "投研教程" },
      { href: "/membership", label: "会员订阅" },
      { href: "/download", label: "下载中心" },
    ],
  },
  {
    title: "资源",
    links: [
      { href: "/content", label: "内容中心" },
      { href: "/about", label: "关于我们" },
      { href: "/open-source", label: "开源协议说明" },
      { href: "/legal/gpl-notice", label: "GPL 声明" },
    ],
  },
  {
    title: "法律",
    links: [
      { href: BRAND.legal.privacyPolicy, label: "隐私政策" },
      { href: BRAND.legal.termsOfService, label: "服务条款" },
      { href: BRAND.legal.refundPolicy, label: "退款政策" },
      { href: "/security", label: "安全说明" },
    ],
  },
];

const SOCIALS = [
  { icon: MessageCircle, label: "微信", value: BRAND.contact.wechat, href: "#" },
  { icon: Mail, label: "邮箱", value: BRAND.contact.email, href: `mailto:${BRAND.contact.email}` },
  { icon: GitBranch, label: "GitHub", value: "github.com/cprotrading", href: "https://github.com/cprotrading" },
  { icon: X, label: "X (Twitter)", value: "@cprotrading", href: "https://twitter.com/cprotrading" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 5 列: 1 简介 + 3 链接 + 1 联系 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* 列 1: 公司简介 */}
          <div className="col-span-2 md:col-span-2">
            <div className="text-lg font-bold text-accent-gold mb-3">
              {BRAND.name.zh}
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              {BRAND.slogan.zh}。
              <br />
              外汇 / 黄金 / 加密 / 能源指数 — 12 个交易品种多市场覆盖。
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Globe size={12} />
              <span>{BRAND.domain}</span>
            </div>
            <div className="mt-3 text-[10px] text-text-muted">
              ICP 备案 {BRAND.copyright.icp}
            </div>
          </div>

          {/* 列 2-4: 链接 */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-text-primary mb-3">
                {col.title}
              </div>
              <ul className="space-y-2 text-xs text-text-secondary">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-accent-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 分隔 + 社交 + 风险提示 */}
        <div className="mt-10 pt-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {SOCIALS.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "nofollow noopener" : undefined}
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-accent-blue transition-colors w-fit"
                >
                  <Icon size={14} />
                  <span className="font-semibold">{s.label}:</span>
                  <span className="num">{s.value}</span>
                </a>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-text-muted">
            <p>© {BRAND.copyright.year} {BRAND.copyright.entity}. All rights reserved.</p>
            <p>实盘交易盈亏自负 · 本平台资源仅供技术交流与回测用途</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
