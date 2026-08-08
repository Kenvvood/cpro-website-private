// task065-1: 全站金融术语映射字典
// (架构师 + PM 联合审词定稿)
// ⚠️ 修改中文翻译 → 走 PR + 架构师审词, 严禁私自改词
// DB 字段保持英文 (Schema 健壮性); 此处只做展示层映射

// ============================================================================
// 1. 产品分级 (Tier)
// ============================================================================
export interface TierEntry {
  short: string;
  full: string;
  desc: string;
}

export const TIER_DICT: Record<string, TierEntry> = {
  "Tier 1 (Premium/VIP)": {
    short: "典藏级",
    full: "典藏级 (VIP)",
    desc: "头部严选 · 机构级风控 · 源码可读",
  },
  "Tier 2 (Pro)": {
    short: "专业级",
    full: "专业级 (Pro)",
    desc: "严选可商用 · MQL 源码完整",
  },
  "Tier 3 (Basic)": {
    short: "标准级",
    full: "标准级 (Basic)",
    desc: "基础模板 · 入门首选",
  },
  "N/A": { short: "未分级", full: "未分级", desc: "" },
};

// ============================================================================
// 2. 产品分类 (Category) — 仅展示 3 类, Code Snippet 强制归入辅助脚本
// ============================================================================
export interface CategoryEntry {
  short: string;
  full: string;
  icon: string;
  /** 选中此分类时实际要查询的 DB 值列表 (用于 FilterPanel 合并查询) */
  aliases: string[];
}

export const CATEGORY_DICT: Record<string, CategoryEntry> = {
  "EA": {
    short: "EA",
    full: "智能交易 (EA)",
    icon: "🤖",
    aliases: ["EA"],
  },
  "Indicator": {
    short: "指标",
    full: "定制指标",
    icon: "📊",
    aliases: ["Indicator"],
  },
  "Script": {
    short: "脚本",
    full: "辅助脚本",
    icon: "🛠",
    aliases: ["Script", "Code Snippet"], // Code Snippet 隐式合并
  },
};

// ============================================================================
// 3. 会员套餐 (Membership Plan)
// ============================================================================
export interface PlanEntry {
  short: string;
  full: string;
  hint: string;
}

export const PLAN_DICT: Record<string, PlanEntry> = {
  "WEEKLY": {
    short: "周付",
    full: "周付会员",
    hint: "7 天权限",
  },
  "MONTHLY": {
    short: "月付",
    full: "月付会员",
    hint: "30 天权限",
  },
  "ANNUAL": {
    short: "年付",
    full: "年付会员",
    hint: "365 天权限 · 含 6 个月持续更新",
  },
  "FREE": { short: "免费", full: "免费", hint: "" },
};

// ============================================================================
// 4. 市场状态 (Market Regime)
// ============================================================================
export const REGIME_DICT: Record<string, { short: string; full: string }> = {
  trend:    { short: "单边趋势", full: "单边趋势行情" },
  range:    { short: "震荡盘整", full: "区间震荡盘整" },
  volatile: { short: "高波动",   full: "高波动率行情" },
  breakout: { short: "动能突破", full: "动能突破行情" },
};

// ============================================================================
// 5. 时间周期 (Timeframe)
// ============================================================================
export const TIMEFRAME_DICT: Record<string, { short: string; full: string }> = {
  M1:  { short: "M1",   full: "1 分钟线 (M1)" },
  M5:  { short: "M5",   full: "5 分钟线 (M5)" },
  M15: { short: "M15",  full: "15 分钟线 (M15)" },
  M30: { short: "M30",  full: "30 分钟线 (M30)" },
  H1:  { short: "H1",   full: "1 小时线 (H1)" },
  H4:  { short: "H4",   full: "4 小时线 (H4)" },
  D1:  { short: "日线",  full: "日线 (D1)" },
  W1:  { short: "周线",  full: "周线 (W1)" },
};

// ============================================================================
// 6. 开源协议 (License)
// ============================================================================
export interface LicenseEntry {
  short: string;
  full: string;
  color: "red" | "yellow" | "green" | "orange";
}

export const LICENSE_DICT: Record<string, LicenseEntry> = {
  GPL_3:        { short: "GPL-3.0",       full: "GPL-3.0 强 copyleft",       color: "red" },
  GPL_2:        { short: "GPL-2.0",       full: "GPL-2.0 强 copyleft",       color: "red" },
  APACHE_2_0:   { short: "Apache-2.0",    full: "Apache-2.0 宽松",            color: "green" },
  MIT:          { short: "MIT",           full: "MIT 极简许可",              color: "green" },
  BSD_3:        { short: "BSD-3-Clause",  full: "BSD-3-Clause 宽松",          color: "green" },
  LGPL:         { short: "LGPL",          full: "LGPL (动态链接可商用)",     color: "yellow" },
  MPL_2_0:      { short: "MPL-2.0",       full: "Mozilla Public 2.0",        color: "yellow" },
  PROPRIETARY:  { short: "专有",          full: "专有协议 (需原作者授权)",   color: "orange" },
  NO_LICENSE:   { short: "无许可",        full: "无明确许可 (仅合规再分发)", color: "red" },
  UNKNOWN:      { short: "未知",          full: "未知协议 (默认仅合规再分发)", color: "red" },
};

// ============================================================================
// 7. 能力标签 (capabilityTags) — 仅展示前 10 个流行标签
// ============================================================================
export const TAG_DICT: Record<string, string> = {
  "Strategy: Martingale":           "策略 · 马丁格尔",
  "Strategy: MA-Cross":             "策略 · 双均线交叉",
  "Strategy: Grid":                 "策略 · 网格交易",
  "Trade Utility: Close-All":       "工具 · 全平仓",
  "Trade Utility: Hedging":         "工具 · 对冲管理",
  "Math & AI: ONNX":                "数学与 AI · ONNX 推理",
  "Math & AI: Matrix":              "数学与 AI · 矩阵运算",
  "Integration & Alert: Telegram":  "集成 · Telegram 推送",
  "Integration & Alert: CSV-Export": "集成 · CSV 导出",
  "UI & Dashboard: Canvas":         "界面 · 自定义画布",
};