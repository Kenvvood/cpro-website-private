// task065-2: i18n 入口 (统一 t() 函数, 字典查询 + 降级容错)
// 核心铁律: 遇到字典中不存在的 Key, 原样返回该 Key, 绝不抛错
import {
  TIER_DICT,
  CATEGORY_DICT,
  PLAN_DICT,
  REGIME_DICT,
  TIMEFRAME_DICT,
  LICENSE_DICT,
  TAG_DICT,
  type TierEntry,
  type CategoryEntry,
  type PlanEntry,
  type LicenseEntry,
} from "./dict";

/** 通用字典查询 (命中返回 entry, 未命中返回 {short, full: 原值}) */
function lookup<T extends { short: string; full: string }>(
  dict: Record<string, T>,
  key: string | null | undefined,
  fallback?: string,
): T | { short: string; full: string } {
  if (!key) return { short: fallback ?? "—", full: fallback ?? "—" };
  return dict[key] ?? { short: key, full: key };
}

export const t = {
  /** 产品分级: t.tier("Tier 1 (Premium/VIP)").short */
  tier: (key: string | null | undefined): TierEntry | { short: string; full: string } =>
    lookup(TIER_DICT, key, "未分级"),
  /** 产品分类 */
  category: (key: string | null | undefined): CategoryEntry | { short: string; full: string; icon: string; aliases: string[] } => {
    if (!key) return { short: "—", full: "—", icon: "📦", aliases: [] };
    return (
      CATEGORY_DICT[key] ?? { short: key, full: key, icon: "📦", aliases: [key] }
    );
  },
  /** 会员套餐 */
  plan: (key: string | null | undefined): PlanEntry | { short: string; full: string; hint: string } => {
    if (!key) return { short: "—", full: "—", hint: "" };
    return PLAN_DICT[key] ?? { short: key, full: key, hint: "" };
  },
  /** 市场状态 */
  regime: (key: string | null | undefined): { short: string; full: string } =>
    REGIME_DICT[key ?? ""] ?? { short: key ?? "—", full: key ?? "—" },
  /** 时间周期 */
  timeframe: (key: string | null | undefined): { short: string; full: string } =>
    TIMEFRAME_DICT[key ?? ""] ?? { short: key ?? "—", full: key ?? "—" },
  /** 协议 */
  license: (key: string | null | undefined): LicenseEntry | { short: string; full: string; color: "red" | "yellow" | "green" | "orange" } => {
    if (!key) return { short: "—", full: "—", color: "red" };
    return LICENSE_DICT[key] ?? { short: key, full: key, color: "red" };
  },
  /** 能力标签 */
  tag: (key: string | null | undefined): string =>
    TAG_DICT[key ?? ""] ?? key ?? "—",
};

/** 根据 UI 选择的 category, 返回 DB 实际要匹配的 value 列表
 *  (例如 UI 选 "辅助脚本", 实际查 Script + Code Snippet) */
export function getCategoryAliases(categoryShort: string): string[] {
  for (const entry of Object.values(CATEGORY_DICT)) {
    if (entry.short === categoryShort || entry.full === categoryShort) {
      return entry.aliases;
    }
  }
  return [categoryShort];
}