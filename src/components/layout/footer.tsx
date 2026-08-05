import Link from "next/link";
import { BRAND } from "@/config/brand";

// task052 L2 C21: TV 风 Footer (4 列 · 1px 顶边 · 无 glow)
export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* 列 1: 公司简介 */}
          <div>
            <div className="text-base font-bold text-accent-gold mb-3">
              {BRAND.name.short}
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              量化交易基础设施 · 从源码到实盘
            </p>
            <p className="text-xs text-text-muted mt-3">
              ICP {BRAND.copyright.icp}
            </p>
          </div>

          {/* 列 2: 产品导航 */}
          <div>
            <div className="text-sm font-semibold text-text-primary mb-3">产品</div>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><Link href="/products" className="hover:text-accent-blue">产品中心</Link></li>
              <li><Link href="/open-source" className="hover:text-accent-blue">开源专区</Link></li>
              <li><Link href="/tutorials" className="hover:text-accent-blue">投研教程</Link></li>
              <li><Link href="/membership" className="hover:text-accent-blue">会员订阅</Link></li>
            </ul>
          </div>

          {/* 列 3: 法律 */}
          <div>
            <div className="text-sm font-semibold text-text-primary mb-3">法律</div>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><Link href={BRAND.legal.privacyPolicy} className="hover:text-accent-blue">隐私政策</Link></li>
              <li><Link href={BRAND.legal.termsOfService} className="hover:text-accent-blue">服务条款</Link></li>
              <li><Link href="/legal/gpl-notice" className="hover:text-accent-blue">GPL 声明</Link></li>
            </ul>
          </div>

          {/* 列 4: 联系 */}
          <div>
            <div className="text-sm font-semibold text-text-primary mb-3">联系</div>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>微信: {BRAND.contact.wechat}</li>
              <li>邮箱: {BRAND.contact.email}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-text-muted">
            © {BRAND.copyright.year} {BRAND.copyright.entity}. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            实盘交易盈亏自负 · 本平台资源仅供技术交流与回测用途
          </p>
        </div>
      </div>
    </footer>
  );
}