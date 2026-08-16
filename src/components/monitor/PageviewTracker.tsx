// v22.0 BATCH 25: 自动 pageview 跟踪 (客户端组件)
//  - 集成到 layout.tsx
//  - 路由变化触发 usePageview (hook 来自 lib/analytics.ts)
//  - SPA 路由跳转 (Next.js App Router usePathname) 也算 pageview
//  - 数据流: ARMS 控制台 → 用户行为分析
"use client";

import { usePageview } from "@/lib/analytics";

export function PageviewTracker() {
  usePageview();
  return null;
}
