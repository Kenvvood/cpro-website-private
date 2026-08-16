import Link from "next/link";
import { MessageCircle, Phone, Globe, Mail } from "lucide-react";
import { BRAND } from "@/config/brand";
// v22.0 BATCH 25: 埋点 - 联系客服 (在 ContactLink 客户端组件中调用)
// 注: footer.tsx 保持 server component, 通过 ContactLink 拆 client
import { ContactLink } from "./ContactLink";

// L4 v1.6: 借 TradingView cn.tradingview.com 多列页脚
// v22.0 Phase 7.23: 链接同步导航重排 (删源码专区 合并进大航海时代)
// v22.0 Phase 7.24 Batch 2: Footer 借鉴 minimaxi 风格 (PM 决策)
// v22.0 Phase 7.24 Batch 2 PATCH:
//   - 导航左侧靠拢 logo (header.tsx 改)
//   - 4 触点: 官方微信/QQ/飞书/手机 (替换 原微信/邮箱/GitHub/X)
//   - 4 二维码: 微信/公众号/QQ/飞书 (替换 原客服微信/订阅群)
//   - 备案号/版权/版权年份: brand.ts 虚位以待 (PM 决策)
// v22.0 Phase 7.24 Batch 12: 链接同步导航 (PM 反馈 2026-08-12 改 header/footer/layout 必查公网)
//   - /download → /wealth (生财有道)
//   - /tutorials → /guides (部署教程)
const COLUMNS = [
  {
    title: "产品",
    links: [
      { href: "/products", label: "产品中心" },
      { href: "/membership", label: "会员订阅" },
      { href: "/wealth", label: "生财有道" },
      { href: "/guides", label: "部署教程" },
    ],
  },
  {
    title: "资源",
    links: [
      { href: "/content", label: "大航海时代" },
      { href: "/articles", label: "精选文章" },
      { href: "/about", label: "关于我们" },
      { href: "/tools", label: "实用工具" },
      { href: "/legal/gpl-notice", label: "GPL 声明" },
    ],
  },
  {
    title: "法律",
    links: [
      { href: "/legal/privacy", label: "隐私政策" },
      { href: "/legal/terms", label: "服务条款" },
      { href: "/legal/refund", label: "退款政策" },
      { href: "/legal/cookies", label: "Cookie 政策" },
      { href: "/legal/disclaimer", label: "免责声明" },
      { href: "/legal/gpl-notice", label: "GPL 声明" },
      { href: "/legal/mps", label: "公安备案" },
    ],
  },
];

// 4 触点 (PM 决策: 微信/邮箱/GitHub/X → 官方微信/QQ/飞书/手机)
const SOCIALS = [
  { icon: MessageCircle, label: "官方微信", value: BRAND.contact.officialWechat, href: "#" },
  { icon: Globe, label: "QQ", value: BRAND.contact.qq, href: `https://wpa.qq.com/msgrd?v=3&uin=${BRAND.contact.qq}` },
  { icon: Mail, label: "飞书", value: BRAND.contact.feishu, href: "#" },
  { icon: Phone, label: "手机", value: BRAND.contact.phone, href: `tel:${BRAND.contact.phone}` },
];

// 4 二维码 (PM 决策: minimaxi 错落风格 2x2, 加描述)
const QR_CODES = [
  { label: "官方微信", placeholder: "[OFFICIAL_WECHAT]", desc: "扫码添加客服 · 工作时间响应" },
  { label: "公众号", placeholder: "[WECHAT_OFFICIAL]", desc: "扫码关注公众号 · 持续更新推送" },
  { label: "QQ 群", placeholder: BRAND.contact.qq, qr: true, desc: "扫码加入 QQ 群 · 严选订阅用户群" },
  { label: "飞书", placeholder: "[FEISHU_ID]", desc: "扫码加入飞书 · 团队协作沟通" },
];

export function Footer() {
  return (
    <footer className="bg-black pt-20 pb-10 mt-16">
      <div className="w-full px-6 md:px-[60px] max-w-[1920px] mx-auto">
        {/* 5 列: 1 简介 (col-span-2) + 3 链接 + 1 二维码 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* 列 1: 公司简介 (col-span-2 宽) */}
          <div className="col-span-2 md:col-span-2">
            <div className="text-lg font-bold text-accent-gold mb-3">
              {BRAND.name.zh}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              {BRAND.slogan.zh}。
              <br />
              外汇与黄金交易者的严选量化伙伴 · 持续更新中 · 多市场多品种。
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Globe size={12} />
              <span>{BRAND.domain}</span>
            </div>
            <div className="mt-3 text-[10px] text-gray-500">
              ICP 备案 {BRAND.copyright.icp}
            </div>
          </div>

          {/* 列 2-4: 链接 (白字) */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-white mb-3">
                {col.title}
              </div>
              <ul className="space-y-2 text-xs text-gray-400">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 居中品牌带 (PM PATCH2: 去掉 MTT, 直接显示 "More Than That" 整体金色 + slogan) */}
        <div className="mt-12 py-6 border-y border-gray-800 text-center">
          <div className="text-2xl sm:text-3xl font-bold tracking-[0.25em] italic text-accent-gold">
            {BRAND.mtt.full}
          </div>
          <div className="mt-3 text-xs sm:text-sm text-gray-400">
            {BRAND.mtt.slogan} <span className="mx-1 text-gray-600">|</span> {BRAND.mtt.altSlogan}
          </div>
        </div>

        {/* 4 二维码 (minimaxi 错落风格 2x2, PM PATCH2 决策) + 4 触点 + 风险提示 + 备案 */}
        <div className="mt-10 pt-6 border-t border-gray-800">
          {/* 4 二维码 (微信/公众号/QQ/飞书) - 错落卡片 2x2 网格, 虚位以待 */}
          <div className="mb-10">
            <div className="text-sm font-semibold text-white mb-4">扫码联系</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              {QR_CODES.map((qr) => (
                <div
                  key={qr.label}
                  className="flex items-start gap-3 p-3 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors group"
                >
                  <div className="w-14 h-14 border border-dashed border-gray-700 bg-gray-900/30 flex items-center justify-center text-[9px] text-gray-500 p-1 shrink-0 group-hover:border-gray-600 transition-colors">
                    {qr.qr ? qr.placeholder : "QR"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-white font-semibold">{qr.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{qr.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 触点 (官方微信/QQ/飞书/手机) + 风险提示 + 备案 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
            <div>
              <div className="text-sm font-semibold text-white mb-3">联系我们</div>
              <div className="space-y-2 text-xs text-gray-400">
                {SOCIALS.map((s) => {
                  const Icon = s.icon;
                  // v22.0 BATCH 25: 埋点 - 联系客服 (按 label 映射 channel)
                  // channel: 微信/飞书 → wechat, QQ → qq, 手机 → phone
                  const channel = s.label.includes("QQ") ? "qq" : s.label.includes("手机") ? "phone" : "wechat";
                  return (
                    <ContactLink
                      key={s.label}
                      href={s.href}
                      label={s.label}
                      value={s.value}
                      channel={channel}
                      icon={<Icon size={14} className="text-gray-500 shrink-0" />}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-white mb-3">风险提示</div>
              <div className="pt-4 border-t border-gray-800 text-xs text-gray-500 leading-relaxed space-y-1">
                <p>© {BRAND.copyright.year} {BRAND.copyright.entity}. All rights reserved.</p>
                <p className="text-gray-400">
                  实盘交易盈亏自负 · 本平台资源仅供技术交流与回测用途
                </p>
                <p className="text-[10px] text-gray-600 mt-2 flex flex-wrap items-center gap-x-2">
                  {/* v22.0 BATCH 15 PATCH 14: ICP 备案超链接 (PM 2026-08-13 提供粤ICP备2026051198号-1) */}
                  <a
                    href="https://beian.miit.gov.cn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-300 transition-colors"
                  >
                    {BRAND.copyright.icp}
                  </a>
                  <span>|</span>
                  {/* v22.0 PATCH 17.6: 公安备案链接到 /legal/mps 页面 (备案号占位 [MPS_FILING_NUMBER_TBD]) */}
                  <Link
                    href="/legal/mps"
                    className="hover:text-gray-300 transition-colors"
                  >
                    {BRAND.copyright.mps}
                  </Link>
                  <span>|</span>
                  <span>域名 {BRAND.domain}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
