/**
 * v22.0 BATCH 25 (2026-08-17 01:10): 业务埋点抽象层
 *  - 包装 ARMS Browser SDK (window.__bl) + console 降级 (开发环境)
 *  - 8 个关键业务事件 (pageview, signup, login, view_product, download_product,
 *    start_subscription, complete_subscription, view_article, share, contact_support)
 *  - 集成点: PDP 详情 / 注册 / 订单 / 订阅 / 文章 / Footer
 *  - 后续: 真实数据流到 ARMS 控制台, 数据驱动决策
 *
 * 用法:
 *   import { track, pageview, identify } from "@/lib/analytics"
 *   track.signup("phone")
 *   track.viewProduct(productId, tier)
 *   pageview()  // 自动: Next.js 路由变化触发 (在 layout 集成)
 */
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// ===== 事件类型定义 =====
export type EventName =
  | "pageview"             // 页面访问 (自动)
  | "signup"               // 注册成功
  | "login"                // 登录成功
  | "logout"               // 登出
  | "view_product"         // 浏览商品 (PDP)
  | "view_product_list"    // 浏览商品列表 (PLP)
  | "download_product"     // 下载商品
  | "start_subscription"   // 开始订阅 (点 CTA)
  | "complete_subscription" // 完成订阅 (支付成功)
  | "view_article"         // 浏览文章
  | "share"                // 分享 (微信/链接)
  | "contact_support"      // 联系客服
  | "click_cta";           // 点击 CTA 按钮

export interface EventPayload {
  [key: string]: string | number | boolean | undefined | null;
}

// ===== ARMS Browser SDK 适配 =====
interface BlSDK {
  api: (name: string, success: boolean, time: number, code: string, msg: string) => void;
  error: (error: Error | string, info?: Record<string, unknown>) => void;
  info: (msg: string, info?: Record<string, unknown>) => void;
  report: (msg: string, info?: Record<string, unknown>) => void;
  setConfig?: (config: Record<string, unknown>) => void;
}

function getSDK(): BlSDK | null {
  if (typeof window === "undefined") return null;
  return (window as any).__bl || null;
}

// ===== 统一上报 =====
function send(eventName: EventName, payload: EventPayload = {}): void {
  const sdk = getSDK();
  const enriched = {
    ...payload,
    _env: process.env.NODE_ENV,
    _ts: Date.now(),
    _path: typeof window !== "undefined" ? window.location.pathname : "",
  };

  if (sdk) {
    // ARMS 模式: 走 api (业务事件) 或 report (自定义)
    if (eventName === "pageview") {
      // pageview 走 api (更标准, 关联 SPA 路由变化)
      sdk.api(eventName, true, 0, "", JSON.stringify(enriched));
    } else {
      sdk.report(eventName, enriched);
    }
  } else {
    // 降级: console.log (开发环境, ARMS 未配置或未加载)
    if (process.env.NODE_ENV === "development") {
      console.log(`[analytics.${eventName}]`, enriched);
    }
  }
}

// ===== 自动 pageview (集成到 layout) =====
export function usePageview(): void {
  const pathname = usePathname();
  useEffect(() => {
    send("pageview", { path: pathname });
  }, [pathname]);
}

// ===== 用户识别 (登录后调用) =====
export function identify(userId: string, traits?: EventPayload): void {
  const sdk = getSDK();
  if (sdk?.setConfig) {
    sdk.setConfig({ uid: userId, ...(traits || {}) });
  }
  send("login", { userId, ...(traits || {}) });
}

// ===== 业务事件封装 =====
export const track = {
  // 注册
  signup: (method: "phone" | "wechat" | "email") =>
    send("signup", { method }),

  // 登录
  login: (method: "phone" | "wechat" | "email") =>
    send("login", { method }),

  // 登出
  logout: () => send("logout"),

  // 浏览商品 (PDP)
  viewProduct: (productId: string, tier: string, isFeatured: boolean) =>
    send("view_product", { productId, tier, isFeatured }),

  // 浏览列表 (PLP)
  viewProductList: (tier: string | null, total: number) =>
    send("view_product_list", { tier: tier || "all", total }),

  // 下载商品
  downloadProduct: (productId: string, hasAccess: boolean) =>
    send("download_product", { productId, hasAccess }),

  // 开始订阅
  startSubscription: (plan: "WEEKLY" | "MONTHLY" | "ANNUAL" | "FOUNDER", source: string) =>
    send("start_subscription", { plan, source }),

  // 完成订阅
  completeSubscription: (orderNo: string, plan: string, amount: number) =>
    send("complete_subscription", { orderNo, plan, amount }),

  // 浏览文章
  viewArticle: (slug: string, title: string) =>
    send("view_article", { slug, title }),

  // 分享
  share: (platform: "wechat" | "twitter" | "copy-link" | "weibo", url: string) =>
    send("share", { platform, url }),

  // 联系客服
  contactSupport: (channel: "email" | "wechat" | "qq" | "phone") =>
    send("contact_support", { channel }),

  // CTA 按钮点击
  clickCta: (ctaName: string, location: string) =>
    send("click_cta", { ctaName, location }),
};

// ===== 默认导出 =====
export default {
  track,
  identify,
  usePageview,
  send,
};
