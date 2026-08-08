import { NextResponse } from "next/server";
import { createState, cleanExpiredStates } from "@/lib/wechat-state";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { checkCsrf, csrfForbidden } from "@/lib/csrf";

// 微信开放平台配置
// TODO: 替换为实际配置，购买微信开放平台后获取
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID || "",
  appSecret: process.env.WECHAT_APP_SECRET || "",
  redirectUri: process.env.WECHAT_REDIRECT_URI || "",
};

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// task061 2.2: state 生成/校验/清理 已抽出到 @/lib/wechat-state (共享)

export async function GET(request: Request) {
  // task063 3.2: IP 限流 3/min
  const ip = getClientIp(request);
  const ipLimit = await rateLimit("wechat-qr-ip", ip, 60_000, 3);
  if (!ipLimit.ok) return tooManyRequests(ipLimit.retryAfterMs);

  try {
    if (!WECHAT_CONFIG.appId || !WECHAT_CONFIG.appSecret) {
      return NextResponse.json(
        { error: "微信登录未配置" },
        { status: 503 }
      );
    }

    const state = createState();

    // 微信开放平台授权链接
    const authorizeUrl = new URL("https://open.weixin.qq.com/connect/qrconnect");
    authorizeUrl.searchParams.set("appid", WECHAT_CONFIG.appId);
    authorizeUrl.searchParams.set("redirect_uri", WECHAT_CONFIG.redirectUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "snsapi_login");
    authorizeUrl.searchParams.set("state", state);

    return NextResponse.json({
      success: true,
      url: authorizeUrl.toString(),
      state,
    });
  } catch (error) {
    console.error("生成微信登录二维码错误:", error);
    return NextResponse.json(
      { error: "生成登录二维码失败" },
      { status: 500 }
    );
  }
}

// 清理过期state（5分钟内未使用则过期）
export async function DELETE(request: Request) {
  // task063 3.2: DELETE 也走 CSRF
  const csrf = checkCsrf(request);
  if (!csrf.ok) return csrfForbidden(csrf.reason);
  const cleaned = cleanExpiredStates();
  return NextResponse.json({ success: true, cleaned });
}