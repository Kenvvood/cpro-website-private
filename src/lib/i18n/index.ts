// task065-2: i18n 入口 (统一 t() 函数, 字典查询 + 降级容错)
// v22.0 BATCH 27 (2026-08-17 02:00): 加 locale 参数, 支持中英
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
import {
  TIER_DICT_EN,
  CATEGORY_DICT_EN,
  PLAN_DICT_EN,
  REGIME_DICT_EN,
  TIMEFRAME_DICT_EN,
  LICENSE_DICT_EN,
  TAG_DICT_EN,
  UI_DICT_EN,
  ROUTE_EN,
} from "./en";

// ---- Locale 类型 ----
export type Locale = "zh" | "en";
export const DEFAULT_LOCALE: Locale = "zh";

/** 从 searchParams / cookies / URL 拿 locale (简化: 查 ?lang=en, 默认 zh) */
export function getLocaleFromSearchParams(params: Record<string, string | string[] | undefined>): Locale {
  const lang = params.lang;
  if (typeof lang === "string" && lang.toLowerCase().startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}

// ---- 通用字典查询 (命中返回 entry, 未命中返回 fallback) ----
function lookup<T extends { short: string; full: string }>(
  dictZh: Record<string, T>,
  dictEn: Record<string, T>,
  key: string | null | undefined,
  locale: Locale,
  fallbackZh = "—",
  fallbackEn = "—",
): T | { short: string; full: string } {
  if (!key) {
    const f = locale === "en" ? fallbackEn : fallbackZh;
    return { short: f, full: f };
  }
  const dict = locale === "en" ? dictEn : dictZh;
  return dict[key] ?? { short: key, full: key };
}

// ---- 主 t 函数 (支持 locale) ----
export const t = {
  /** 产品分级: t.tier("Tier 1 (Premium/VIP)", "en").short */
  tier: (key: string | null | undefined, locale: Locale = DEFAULT_LOCALE): TierEntry | { short: string; full: string } =>
    lookup(TIER_DICT, TIER_DICT_EN, key, locale, "未分级", "Unrated"),
  /** 产品分类 */
  category: (
    key: string | null | undefined,
    locale: Locale = DEFAULT_LOCALE
  ): CategoryEntry | { short: string; full: string; icon: string; aliases: string[] } => {
    if (!key) {
      const def = locale === "en"
        ? { short: "—", full: "—", icon: "📦", aliases: [] as string[] }
        : { short: "—", full: "—", icon: "📦", aliases: [] as string[] };
      return def;
    }
    const dict = locale === "en" ? CATEGORY_DICT_EN : CATEGORY_DICT;
    return dict[key] ?? {
      short: key,
      full: key,
      icon: "📦",
      aliases: [key],
    };
  },
  /** 会员套餐 */
  plan: (
    key: string | null | undefined,
    locale: Locale = DEFAULT_LOCALE
  ): PlanEntry | { short: string; full: string; hint: string } => {
    if (!key) return { short: "—", full: "—", hint: "" };
    const dict = locale === "en" ? PLAN_DICT_EN : PLAN_DICT;
    return dict[key] ?? { short: key, full: key, hint: "" };
  },
  /** 市场状态 */
  regime: (key: string | null | undefined, locale: Locale = DEFAULT_LOCALE): { short: string; full: string } => {
    const dict = locale === "en" ? REGIME_DICT_EN : REGIME_DICT;
    return dict[key ?? ""] ?? { short: key ?? "—", full: key ?? "—" };
  },
  /** 时间周期 */
  timeframe: (key: string | null | undefined, locale: Locale = DEFAULT_LOCALE): { short: string; full: string } => {
    const dict = locale === "en" ? TIMEFRAME_DICT_EN : TIMEFRAME_DICT;
    return dict[key ?? ""] ?? { short: key ?? "—", full: key ?? "—" };
  },
  /** 协议 */
  license: (
    key: string | null | undefined,
    locale: Locale = DEFAULT_LOCALE
  ): LicenseEntry | { short: string; full: string; color: "red" | "yellow" | "green" | "orange" } => {
    if (!key) return { short: "—", full: "—", color: "red" };
    const dict = locale === "en" ? LICENSE_DICT_EN : LICENSE_DICT;
    return dict[key] ?? { short: key, full: key, color: "red" };
  },
  /** 能力标签 */
  tag: (key: string | null | undefined, locale: Locale = DEFAULT_LOCALE): string => {
    const dict = locale === "en" ? TAG_DICT_EN : TAG_DICT;
    return dict[key ?? ""] ?? key ?? "—";
  },
  /** 通用 UI 文案: t.ui("nav.home", "en") */
  ui: (key: keyof typeof UI_DICT_EN, locale: Locale = DEFAULT_LOCALE): string => {
    if (locale === "en") return UI_DICT_EN[key];
    // 中文 key 走 dict (翻译 1:1)
    const uiZh: Record<string, string> = {
      "nav.home": "首页",
      "nav.products": "产品中心",
      "nav.membership": "会员订阅",
      "nav.tools": "实用工具",
      "nav.wealth": "生财有道",
      "nav.content": "大航海时代",
      "nav.guides": "部署教程",
      "nav.about": "关于我们",
      "nav.articles": "研报文章",
      "nav.login": "登录",
      "nav.signup": "注册",
      "footer.copyright": "© 2026 CProTrading 城诺科技 保留所有权利.",
      "footer.icp": "粤ICP备",
      "footer.privacy": "隐私政策",
      "footer.terms": "服务条款",
      "footer.refund": "退款政策",
      "btn.view": "查看",
      "btn.download": "下载",
      "btn.subscribe": "立即开通",
      "btn.try_free": "免费试用",
      "btn.contact": "联系",
      "btn.read_more": "阅读全文",
      "empty.no_data": "暂无数据",
      "empty.coming_soon": "敬请期待",
      "status.loading": "加载中...",
      "status.success": "成功",
      "status.error": "出错了",
      "status.retry": "重试",
      "marketing.cta_primary": "立即开通",
      "marketing.cta_secondary": "浏览产品",
      "marketing.featured_label": "热门",
      "marketing.gold_label": "王牌",
    };
    return uiZh[key] ?? key;
  },
  /** 路由英化: t.route("/") = "/en" */
  route: (path: string): string => {
    return ROUTE_EN[path] ?? `/en${path}`;
  },
};

/** 根据 UI 选择的 category, 返回 DB 实际要匹配的 value 列表 (locale 无关, DB 字段保持英文) */
export function getCategoryAliases(categoryShort: string): string[] {
  for (const entry of Object.values(CATEGORY_DICT)) {
    if (entry.short === categoryShort || entry.full === categoryShort) {
      return entry.aliases;
    }
  }
  return [categoryShort];
}

/** 工具: 给当前 locale 加 query param (保留其他参数) */
export function withLocale(currentPath: string, currentParams: Record<string, string | string[] | undefined>, newLocale: Locale): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(currentParams)) {
    if (k === "lang" || v === undefined) continue;
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv));
    else params.set(k, v);
  }
  if (newLocale === "en") params.set("lang", "en");
  const qs = params.toString();
  return qs ? `${currentPath}?${qs}` : currentPath;
}
