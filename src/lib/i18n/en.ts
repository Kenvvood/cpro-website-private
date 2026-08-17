// v22.0 BATCH 27 (2026-08-17 02:00): 英文翻译字典
// 跟 dict.ts 一一对应, 同 key 必有同字段
// 架构: t(key, locale) 默认 zh, 传 'en' 走英文

import type { TierEntry, CategoryEntry, PlanEntry, LicenseEntry } from "./dict";

// ============================================================================
// 1. Tier
// ============================================================================
export const TIER_DICT_EN: Record<string, TierEntry> = {
  "Tier 1 (Premium/VIP)": {
    short: "Premium",
    full: "Premium (VIP)",
    desc: "Top-tier · Institutional-grade risk control · Source code readable",
  },
  "Tier 2 (Pro)": {
    short: "Pro",
    full: "Pro",
    desc: "Commercially usable · Full MQL source included",
  },
  "Tier 3 (Basic)": {
    short: "Basic",
    full: "Basic",
    desc: "Foundational templates · Best for beginners",
  },
  "N/A": { short: "Unrated", full: "Unrated", desc: "" },
};

// ============================================================================
// 2. Category
// ============================================================================
export const CATEGORY_DICT_EN: Record<string, CategoryEntry> = {
  "EA": {
    short: "EA",
    full: "Expert Advisor (EA)",
    icon: "🤖",
    aliases: ["EA"],
  },
  "Indicator": {
    short: "Indicator",
    full: "Custom Indicator",
    icon: "📊",
    aliases: ["Indicator"],
  },
  "Script": {
    short: "Script",
    full: "Utility Script",
    icon: "🛠",
    aliases: ["Script", "Code Snippet"],
  },
};

// ============================================================================
// 3. Plan
// ============================================================================
export const PLAN_DICT_EN: Record<string, PlanEntry> = {
  "WEEKLY": { short: "Weekly", full: "Weekly Member", hint: "7-day access" },
  "MONTHLY": { short: "Monthly", full: "Monthly Member", hint: "30-day access" },
  "ANNUAL": { short: "Annual", full: "Annual Member", hint: "365-day access + 6 months updates" },
  "FREE": { short: "Free", full: "Free", hint: "" },
};

// ============================================================================
// 4. Regime
// ============================================================================
export const REGIME_DICT_EN: Record<string, { short: string; full: string }> = {
  trend: { short: "Trending", full: "Trending market" },
  range: { short: "Ranging", full: "Range-bound market" },
  volatile: { short: "Volatile", full: "High-volatility market" },
  breakout: { short: "Breakout", full: "Momentum breakout" },
};

// ============================================================================
// 5. Timeframe
// ============================================================================
export const TIMEFRAME_DICT_EN: Record<string, { short: string; full: string }> = {
  M1: { short: "M1", full: "1-minute (M1)" },
  M5: { short: "M5", full: "5-minute (M5)" },
  M15: { short: "M15", full: "15-minute (M15)" },
  M30: { short: "M30", full: "30-minute (M30)" },
  H1: { short: "H1", full: "1-hour (H1)" },
  H4: { short: "H4", full: "4-hour (H4)" },
  D1: { short: "D1", full: "Daily (D1)" },
  W1: { short: "W1", full: "Weekly (W1)" },
};

// ============================================================================
// 6. License
// ============================================================================
export const LICENSE_DICT_EN: Record<string, LicenseEntry> = {
  GPL_3: { short: "GPL-3.0", full: "GPL-3.0 strong copyleft", color: "red" },
  GPL_2: { short: "GPL-2.0", full: "GPL-2.0 strong copyleft", color: "red" },
  APACHE_2_0: { short: "Apache-2.0", full: "Apache-2.0 permissive", color: "green" },
  MIT: { short: "MIT", full: "MIT minimal license", color: "green" },
  BSD_3: { short: "BSD-3-Clause", full: "BSD-3-Clause permissive", color: "green" },
  LGPL: { short: "LGPL", full: "LGPL (dynamic linking allowed)", color: "yellow" },
  MPL_2_0: { short: "MPL-2.0", full: "Mozilla Public 2.0", color: "yellow" },
  PROPRIETARY: { short: "Proprietary", full: "Proprietary (author authorization required)", color: "orange" },
  NO_LICENSE: { short: "No License", full: "No clear license (redistribution only)", color: "red" },
  UNKNOWN: { short: "Unknown", full: "Unknown license (default: redistribution only)", color: "red" },
};

// ============================================================================
// 7. Tags
// ============================================================================
export const TAG_DICT_EN: Record<string, string> = {
  "Strategy: Martingale": "Strategy · Martingale",
  "Strategy: MA-Cross": "Strategy · MA Crossover",
  "Strategy: Grid": "Strategy · Grid Trading",
  "Trade Utility: Close-All": "Utility · Close All",
  "Trade Utility: Hedging": "Utility · Hedging",
  "Math & AI: ONNX": "Math & AI · ONNX Inference",
  "Math & AI: Matrix": "Math & AI · Matrix Operations",
  "Integration & Alert: Telegram": "Integration · Telegram Alerts",
  "Integration & Alert: CSV-Export": "Integration · CSV Export",
  "UI & Dashboard: Canvas": "UI · Custom Canvas",
};

// ============================================================================
// 8. 通用 UI 文案 (header/footer/buttons)
// ============================================================================
export const UI_DICT_EN = {
  // Header nav
  "nav.home": "Home",
  "nav.products": "Products",
  "nav.membership": "Membership",
  "nav.tools": "Tools",
  "nav.wealth": "Wealth",
  "nav.content": "Community",
  "nav.guides": "Guides",
  "nav.about": "About",
  "nav.articles": "Articles",
  "nav.login": "Login",
  "nav.signup": "Sign Up",
  // Footer
  "footer.copyright": "© 2026 CProTrading Chengnuo Tech. All rights reserved.",
  "footer.icp": "ICP Filing:",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms of Service",
  "footer.refund": "Refund Policy",
  // Common buttons
  "btn.view": "View",
  "btn.download": "Download",
  "btn.subscribe": "Subscribe",
  "btn.try_free": "Try Free",
  "btn.contact": "Contact",
  "btn.read_more": "Read More",
  // Empty states
  "empty.no_data": "No data available",
  "empty.coming_soon": "Coming Soon",
  // Status
  "status.loading": "Loading...",
  "status.success": "Success",
  "status.error": "Error",
  "status.retry": "Retry",
  // Marketing
  "marketing.cta_primary": "Subscribe Now",
  "marketing.cta_secondary": "Browse Products",
  "marketing.featured_label": "Featured",
  "marketing.gold_label": "Premium",
};

// 路由路径 (英文化, /en/... 镜像)
export const ROUTE_EN: Record<string, string> = {
  "/": "/en",
  "/products": "/en/products",
  "/membership": "/en/membership",
  "/tools": "/en/tools",
  "/wealth": "/en/wealth",
  "/content": "/en/content",
  "/guides": "/en/guides",
  "/about": "/en/about",
  "/articles": "/en/articles",
  "/legal/privacy": "/en/legal/privacy",
  "/legal/terms": "/en/legal/terms",
  "/legal/refund": "/en/legal/refund",
  "/legal/cookies": "/en/legal/cookies",
  "/legal/disclaimer": "/en/legal/disclaimer",
  "/legal/mps": "/en/legal/mps",
  "/login": "/en/login",
  "/register": "/en/register",
};
