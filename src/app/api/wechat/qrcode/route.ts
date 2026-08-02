import { NextResponse } from "next/server";

// 微信开放平台配置
// TODO: 替换为实际配置，购买微信开放平台后获取
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID || "",
  appSecret: process.env.WECHAT_APP_SECRET || "",
  redirectUri: process.env.WECHAT_REDIRECT_URI || "",
};

// 生成随机字符串作为state参数（防CSRF）
function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

// 存储state（生产环境应使用Redis）
const stateStore = new Map<string, { createdAt: number }>();

export async function GET() {
  try {
    if (!WECHAT_CONFIG.appId || !WECHAT_CONFIG.appSecret) {
      return NextResponse.json(
        { error: "微信登录未配置" },
        { status: 503 }
      );
    }

    const state = generateState();
    stateStore.set(state, { createdAt: Date.now() });

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
export async function DELETE() {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  for (const [state, data] of stateStore.entries()) {
    if (now - data.createdAt > fiveMinutes) {
      stateStore.delete(state);
    }
  }

  return NextResponse.json({ success: true, cleaned: true });
}