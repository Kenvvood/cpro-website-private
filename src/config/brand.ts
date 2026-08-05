/**
 * 品牌配置 - 唯一来源（Single Source of Truth）
 * ⚠️ 修改品牌信息只需改此文件, 全站 .tsx/.ts 通过 import 引用.
 * ARCHIVE v11.0 + task052 L1 重构: 嵌套结构 colors.bg/text/border/accent
 * 同步目标: tokens.css (字符级一致) · globals.css @theme 块
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
    // task052 L1 C3 拍板: 量化交易基础设施 · 从源码到实盘
    zh: '量化交易基础设施 · 从源码到实盘',
    en: 'Quantitative trading infrastructure · Source code to live',
  },
  logo: {
    primary: 'CProTrading',
    favicon: '/favicon.ico',
    svgPath: null as string | null,
  },
  colors: {
    // === 背景层（TV 风冷灰深蓝） ===
    bg: {
      primary:   '#131722',  // Gemini TV #131722
      secondary: '#1e222d',  // Gemini TV #1e222d (卡片)
      tertiary:  '#2a2e39',  // hover / 抬升层
    },
    // === 文字层（偏灰白不刺眼） ===
    text: {
      primary:   '#E0E0E0',
      secondary: '#B2B5BE',
      muted:     '#6A6E77',
    },
    // === 边框（1px 哲学） ===
    border: {
      default: '#2a2e39',
      strong:  '#3a3e49',
      focus:   '#2962FF',  // TV 蓝聚焦
    },
    // === 强调色（C2-A 拍板） ===
    accent: {
      blue: '#2962FF',  // TV 经典蓝 — 主 CTA / 链接
      gold: '#D4AF37',  // 品牌金 — 会员/Premium 专属 (降级)
      up:   '#26a69a',  // Gemini 涨色 / Buy
      down: '#ef5350',  // Gemini 跌色 / Sell
    },
    // === 历史主色（仅字体/营销位用, 严禁替换 accent.* 语义） ===
    primary:    '#D4AF37',  // 品牌金 — 营销位/字体强调
    background: '#131722',  // 主背景（=colors.bg.primary）
    note: 'task052 L1 重构后, 新代码必须用嵌套结构 (colors.bg/text/border/accent); primary 仅字体/营销位用',
  },
  fonts: {
    zh: 'Microsoft YaHei',
    en: 'Arial Black',
    number: 'Arial Black, Consolas, monospace',  // 数字 tabular-nums
    note: '数字必须用 Arial Black + CSS tabular-nums 等宽对齐',
  },
  spacing: {
    base: 8,  // 8px 基准 (theme.md 铁律)
    note: '所有 px 值必须是 8 的倍数 (8/16/24/32/48/64)',
  },
  radius: {
    sm: '4px',   // TV 克制圆角
    md: '6px',
    lg: '8px',
    note: '禁用 rounded-xl (12px) / rounded-2xl / rounded-full',
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
