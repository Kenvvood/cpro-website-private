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
  // v22.0 Phase 7.10+: 公司品牌字母简称 + 完整 slogan
  // PM 品宣材料: 品牌 MTT = More Than That, slogan "让散户交易不只于此 | 不止于此"
  mtt: {
    abbr: 'MTT',
    full: 'More Than That',
    slogan: '让散户交易不只于此',
    altSlogan: '不止于此',
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
    // === 背景层 (v22.0 Phase 2.1-G: 借鉴 cn.investing.com 白底错落风) ===
    bg: {
      primary:   '#ffffff',  // 主背景 - 纯白
      secondary: '#f7f8fa',  // header/footer/section header 浅灰
      tertiary:  '#f0f2f5',  // hover / 抬升层
    },
    // === 文字层（白底对应深色字） ===
    text: {
      primary:   '#1a1a1a',  // 主文字
      secondary: '#4a4a4a',  // 次文字
      muted:     '#888888',  // 弱化文字
    },
    // === 边框（1px 浅灰哲学） ===
    border: {
      default: '#e5e7eb',
      strong:  '#d1d5db',
      focus:   '#2962FF',  // TV 蓝聚焦
    },
    // === 强调色（C2-A 拍板） ===
    accent: {
      blue:   '#2962FF',  // TV 经典蓝 — 主 CTA / 链接
      gold:   '#D4AF37',  // 品牌金 — 会员/Premium 专属 (降级)
      purple: '#6c9cfc',  // v22.0 Phase 7.24 Batch 5: 借鉴 fxssi.com 蓝紫, /products 主色
      up:     '#26a69a',  // Gemini 涨色 / Buy
      down:   '#ef5350',  // Gemini 跌色 / Sell
    },
    // === 历史主色（仅字体/营销位用, 严禁替换 accent.* 语义） ===
    primary:    '#D4AF37',  // 品牌金 — 营销位/字体强调
    background: '#ffffff',  // 主背景（=colors.bg.primary, v22.0 Phase 2.1-G 白底）
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
    // v22.0 Phase 7.24 BATCH 15 PATCH 14: PM 2026-08-13 提供 ICP 备案号
    year: '2026',
    entity: 'CProTrading 城诺科技',
    icp: '粤ICP备2026051198号-1',
    // 公安备案占位 (待 PM 后续提供, 格式: 京公网安备 11010102000000号)
    mps: '[MPS_FILING_NUMBER_TBD]',
  },
  contact: {
    // v22.0 Phase 7.24 Batch 2 PATCH: 4 触点具体化 (PM 决策)
    // - GitHub → QQ: 3624597882
    // - 客服微信 → 官方微信 (虚位以待)
    // - 订阅群 → 公众号 (虚位以待)
    // - 邮箱 → 飞书 (虚位以待)
    // - X → 手机: 18688198932
    email: 'support@cprotrading.com',  // 保留邮箱 (支持链接)
    phone: '18688198932',              // PM 指定
    qq: '3624597882',                  // PM 指定
    wechat: 'Lookee333',               // 个人微信 (内部用, footer 不显示)
    officialWechat: '[OFFICIAL_WECHAT]',   // 官方微信 (footer 4 触点 + 二维码)
    wechatOfficial: '[WECHAT_OFFICIAL]',   // 公众号 (footer 二维码)
    feishu: '[FEISHU_ID]',             // 飞书 (footer 4 触点 + 二维码)
  },
  legal: {
    privacyPolicy: '/privacy',
    termsOfService: '/terms',
    refundPolicy: '/refund',
  },
} as const;

export type BrandConfig = typeof BRAND;
