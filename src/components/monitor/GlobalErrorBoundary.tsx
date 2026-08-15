// v22.0 PATCH 17.9: 全局客户端错误捕获 (replace Next.js error boundary)
// 用法: 在 (marketing)/layout.tsx 跟 (member)/layout.tsx 加 <GlobalErrorBoundary>
// 上报路径: /api/monitor/client-error (待 Mavis 加 API 端点)

"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/monitor";

interface Props {
  children: React.ReactNode;
}

export function GlobalErrorBoundary({ children }: Props) {
  useEffect(() => {
    // 捕获未处理的 Promise rejection
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureException(event.reason, {
        scope: "client.unhandledrejection",
        level: "error",
        extra: { url: window.location.href },
      });
      // 上报到 server
      fetch("/api/monitor/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "unhandledrejection",
          message: String(event.reason?.message || event.reason),
          stack: event.reason?.stack,
          url: window.location.href,
          ts: Date.now(),
        }),
      }).catch(() => { /* 静默失败 */ });
    };

    // 捕获全局 JS 错误
    const handleError = (event: ErrorEvent) => {
      captureException(event.error || new Error(event.message), {
        scope: "client.error",
        level: "error",
        extra: {
          url: window.location.href,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
      fetch("/api/monitor/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "error",
          message: event.message,
          stack: event.error?.stack,
          url: window.location.href,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          ts: Date.now(),
        }),
      }).catch(() => {});
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return <>{children}</>;
}
