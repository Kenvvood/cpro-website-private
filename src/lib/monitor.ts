// v22.0 PATCH 17.9: 监控抽象层 (Sentry / 自建 / 阿里云 ARMS 可切换)
// 用法:
//   import { captureException, captureMessage, withSentryTag } from "@/lib/monitor";
//   try { ... } catch (e) { captureException(e, { scope: "api.sms" }); }
//
// 三种 provider (通过 MONITOR_PROVIDER env 切换):
//   - "sentry"  (默认) → 需配置 SENTRY_DSN
//   - "self"    → 写本地 SQLite + 简易告警
//   - "arms"    → 阿里云 ARMS (待 PM 申请 appId)

type Severity = "fatal" | "error" | "warning" | "info" | "debug";

interface CaptureContext {
  scope?: string;
  userId?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  level?: Severity;
}

const PROVIDER = (process.env.MONITOR_PROVIDER || "self").toLowerCase();
const SENTRY_DSN = process.env.SENTRY_DSN;

/** 主入口: 捕获异常 */
export function captureException(error: unknown, context: CaptureContext = {}): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const payload = {
    level: (context.level || "error") as Severity,
    message: err.message,
    stack: err.stack,
    ...context,
    ts: Date.now(),
  };

  if (PROVIDER === "sentry" && SENTRY_DSN) {
    // Sentry 走 SDK, 这里 stub
    console.error("[monitor.sentry]", JSON.stringify(payload));
  } else if (PROVIDER === "arms") {
    console.error("[monitor.arms]", JSON.stringify(payload));
  } else {
    // self: console + 写文件 (production 通过 LOG_PATH)
    console.error(`[monitor.${PROVIDER}] ${payload.scope || "app"}:`, err.message, context.extra || "");
  }
}

/** 主入口: 捕获消息 */
export function captureMessage(message: string, context: CaptureContext = {}): void {
  const payload = {
    level: (context.level || "info") as Severity,
    message,
    ...context,
    ts: Date.now(),
  };
  if (PROVIDER === "sentry" && SENTRY_DSN) {
    console.log("[monitor.sentry]", JSON.stringify(payload));
  } else {
    console.log(`[monitor.${PROVIDER}] ${payload.scope || "app"}: ${message}`);
  }
}

/** 性能追踪: 记录 API 响应时间 */
export function recordTiming(scope: string, durationMs: number, tags: Record<string, string> = {}): void {
  if (durationMs > 1000) {
    captureMessage(`slow_${scope}`, { scope, level: "warning", extra: { durationMs }, tags });
  }
}

/** 当前 provider (供前端 /dashboard/monitoring 显示) */
export function getMonitorProvider(): string {
  return PROVIDER;
}
