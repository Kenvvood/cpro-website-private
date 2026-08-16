"use client";

import { useEffect } from "react";
import Script from "next/script";

// v22.0 PATCH 18.3: 阿里云 ARMS 前端监控 (Browser) 初始化
//  集成 @arms/js-sdk (public npm, 集成简单)
// 用法: 在 layout.tsx 渲染 <ARMSBrowserInit />
// pid 来自 ARMS 控制台 → 前端监控 → Web & H5 应用

const ARMS_PID = process.env.NEXT_PUBLIC_ARMS_PID;
const ARMS_IMG_URL = "https://arms-retcode.aliyuncs.com/r.png?";
const ARMS_SDK_URL = "https://sdk.rum.aliyuncs.com/v1/bl.js";

declare global {
  interface Window {
    __bl?: {
      api: (api: string, success: boolean, time: number, code: string, msg: string) => void;
      error: (error: Error | string, info?: Record<string, unknown>) => void;
      info: (msg: string, info?: Record<string, unknown>) => void;
      report: (msg: string, info?: Record<string, unknown>) => void;
      setConfig?: (config: Record<string, unknown>) => void;
    };
  }
}

export function ARMSBrowserInit() {
  // 等 SDK 加载完成后做基础配置
  useEffect(() => {
    if (typeof window === "undefined") return;
    const bl = (window as any).__bl;
    if (bl?.setConfig && ARMS_PID) {
      bl.setConfig({
        pid: ARMS_PID,
        appType: "web",
        imgUrl: ARMS_IMG_URL,
        sendResource: true,
        enableLinkTrace: true,
        behavior: true,
        useFmp: true,
        enableSPA: true,
      });
    }
  }, []);

  if (!ARMS_PID) {
    // 没配 PID, 不加载 SDK (避免 404 拉取)
    return null;
  }

  return (
    <Script
      id="arms-browser-sdk"
      strategy="afterInteractive"
      src={ARMS_SDK_URL}
      onLoad={() => {
        // SDK 加载完成后再 config
        if (typeof window === "undefined") return;
        const bl = (window as any).__bl;
        if (bl?.setConfig) {
          bl.setConfig({
            pid: ARMS_PID,
            appType: "web",
            imgUrl: ARMS_IMG_URL,
            sendResource: true,
            enableLinkTrace: true,
            behavior: true,
            useFmp: true,
            enableSPA: true,
          });
        }
      }}
      onError={(e) => {
        console.error("[ARMS] SDK 加载失败:", e);
      }}
    />
  );
}
