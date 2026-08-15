// v22.0 PATCH 17.9: 客户端错误上报 API
// 接收 GlobalErrorBoundary 上报的错误, 转发到 monitor provider
// 频率限制: 同 IP 1 分钟 20 次 (防刷)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { captureException } from "@/lib/monitor";

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  // 限流: IP 1 分钟 20 次 (防刷)
  const ip = getClientIp(request);
  const limit = await rateLimit("monitor-ip", ip, 60_000, 20);
  if (!limit.ok) return tooManyRequests(limit.retryAfterMs);

  try {
    const body = await request.json();
    const { type, message, stack, url, filename, lineno, colno, ts } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: "消息过长" }, { status: 400 });
    }

    // 1. 转发到 monitor provider
    captureException(new Error(message), {
      scope: `client.${type || "error"}`,
      level: "error",
      extra: { url, filename, lineno, colno },
    });

    // 2. 写 DB (Prisma MonitorEvent 可选, 暂写 console + 留接口)
    // 未来: prisma.monitorEvent.create({ data: { type, message, stack, url, userId: null, ts: new Date(ts) } })
    console.warn(`[monitor.client] ${type}: ${message} @ ${url}`);

    return NextResponse.json({ success: true });
  } catch (e) {
    captureException(e, { scope: "api.monitor.client-error" });
    return NextResponse.json({ error: "上报失败" }, { status: 500 });
  }
}
