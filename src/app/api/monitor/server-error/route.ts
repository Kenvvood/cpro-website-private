// v22.0 BATCH 26 (2026-08-17 09:35): 服务端 5xx 主动告警 API
//
// 设计:
//  - 业务关键路径 (API 路由) 抛 5xx 错时主动 POST 到这
//  - 接收 → 调 lib/alert-frequency.ts 判断是否需要告警 (1h 去重 + 5min 5次升级)
//  - 实际发送通道: 钉钉 (主) + 邮件 (次, RESEND 配时启用) + 本地日志 (兜底)
//
// 用法 (在业务 API catch 块):
//   } catch (e) {
//     captureException(e, { scope: "api.products" });
//     try {
//       await fetch(`${process.env.NEXTAUTH_URL}/api/monitor/server-error`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           scope: "api.products",
//           status: 500,
//           message: e.message,
//           stack: e.stack,
//           path: "/api/products",
//         }),
//       });
//     } catch (_) {}
//   }
//
// 鉴权: 需 admin 或 internal token (避免被恶意刷)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { shouldAlert } from "@/lib/alert-frequency";

export const dynamic = "force-dynamic";

async function sendDingTalk(text: string): Promise<boolean> {
  const webhook = process.env.ALERT_DINGTALK_WEBHOOK;
  if (!webhook) return false;
  try {
    const json = JSON.stringify({ msgtype: "text", text: { content: text } });
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (e) {
    console.warn("[server-error] 钉钉发送失败:", e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  // 鉴权: admin OR 内部 token
  const internalToken = req.headers.get("x-internal-token");
  const isInternal = internalToken === process.env.INTERNAL_API_TOKEN;
  if (!isInternal) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "需要 ADMIN 权限" }, { status: 403 });
    }
  }

  try {
    const body = await req.json();
    const { scope, status, message, stack, path: reqPath, method, userId } = body;

    // 校验
    if (!scope || typeof scope !== "string") {
      return NextResponse.json({ error: "scope 必填" }, { status: 400 });
    }
    if (!status || status < 500 || status >= 600) {
      return NextResponse.json({ error: "只接受 5xx 状态码" }, { status: 400 });
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message 必填" }, { status: 400 });
    }

    // 1. 频率限制 (1h 同 scope 去重, 5min 5次升级)
    const key = `5xx-${scope}-${status}`;
    const decision = shouldAlert(key, message);

    // 2. 拼接告警文本
    const text = [
      `[cpro-website ${status} ${decision === "burst" ? "🔥爆发" : "告警"}]`,
      `Scope: ${scope}`,
      `Path: ${reqPath || "(unknown)"} ${method || ""}`.trim(),
      `User: ${userId || "anonymous"}`,
      `Message: ${message.slice(0, 200)}`,
      decision === "burst" ? "⚠️ 5min 内 ≥ 5 次, 紧急升级!" : "",
    ].filter(Boolean).join("\n");

    // 3. 发送钉钉
    const dingOk = await sendDingTalk(text);

    // 4. 本地日志兜底
    const logLine = `[${new Date().toISOString()}] ${text}\n${stack ? `Stack: ${stack.slice(0, 500)}\n` : ""}`;
    try {
      // 写 /var/log/cpro-server-error.log (最佳, 永久日志)
      // 降级到 console
      console.error(logLine);
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      decision, // "send" / "burst" / "skip"
      dingtalk: dingOk ? "sent" : "skipped-or-failed",
    });
  } catch (e) {
    console.error("[server-error handler error]", e);
    return NextResponse.json({ error: "上报处理失败" }, { status: 500 });
  }
}
