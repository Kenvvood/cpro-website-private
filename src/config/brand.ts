/**
 * 品牌配置 - 唯一来源（Single Source of Truth）
 * ⚠️ 修改品牌信息只需改此文件, 全站 .tsx/.ts 通过 import 引用.
 */

export const BRAND = {
  name: {
    zh: 'CProTrading 城诺科技',
    en: 'CProTrading',
    short: 'CProTrading',
  },
  domain: 'cprotrading.com',
  entity: 'CProTrading 城诺科技',
  slogan: {
    zh: '基于开源 EA 源码深度解析 · 严选合规再分发协议',
    en: 'Open-source EA deep analysis · Compliant redistribution',
  },
  logo: {
    primary: 'CProTrading',
    favicon: '/favicon.ico',
    svgPath: null as string | null,
  },
  colors: {
    primary: '#D4AF37',
    secondary: '#00FF7F',
    accent: '#FF3B30',
    background: '#121212',
    note: '使用 MTT design system 调色板 (品牌色待 PM 替换)',
  },
  fonts: {
    zh: 'Microsoft YaHei',
    en: 'Arial Black',
    note: '沿用 MTT design system 字体',
  },
  copyright: {
    year: 2026,
    entity: 'CProTrading 城诺科技',
    icp: '[ICP_FILING_NUMBER]',
  },
  contact: {
    email: 'support@cprotrading.com',
    phone: '[SUPPORT_PHONE]',
    wechat: 'Lookee333',
  },
  legal: {
    privacyPolicy: '/privacy',
    termsOfService: '/terms',
    refundPolicy: '/refund',
  },
} as const;

export type BrandConfig = typeof BRAND;
