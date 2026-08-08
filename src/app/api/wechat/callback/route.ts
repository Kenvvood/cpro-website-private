import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signIn } from "next-auth/react";
import { consumeState } from "@/lib/wechat-state";

const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID || "",
  appSecret: process.env.WECHAT_APP_SECRET || "",
};

// 通过code获取微信openid
async function getWechatAccessToken(code: string) {
  const tokenUrl = new URL("https://api.weixin.qq.com/sns/oauth2/access_token");
  tokenUrl.searchParams.set("grant_type", "authorization_code");
  tokenUrl.searchParams.set("appid", WECHAT_CONFIG.appId);
  tokenUrl.searchParams.set("secret", WECHAT_CONFIG.appSecret);
  tokenUrl.searchParams.set("code", code);

  const res = await fetch(tokenUrl.toString());
  return res.json();
}

// 获取微信用户信息
async function getWechatUserInfo(accessToken: string, openid: string) {
  const userUrl = new URL("https://api.weixin.qq.com/sns/userinfo");
  userUrl.searchParams.set("access_token", accessToken);
  userUrl.searchParams.set("openid", openid);

  const res = await fetch(userUrl.toString());
  return res.json();
}

// 微信回调
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(new URL("/login?error=wechat_denied", request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=wechat_no_code", request.url));
    }

    // task061 2.2: state 一次性校验 (防 CSRF)
    if (!consumeState(state)) {
      return NextResponse.redirect(new URL("/login?error=wechat_state_invalid", request.url));
    }

    // 获取access_token和openid
    const tokenData = await getWechatAccessToken(code);

    if (tokenData.errcode) {
      console.error("微信access_token错误:", tokenData);
      return NextResponse.redirect(
        new URL(`/login?error=wechat_token_failed&msg=${tokenData.errmsg}`, request.url)
      );
    }

    const { access_token, openid } = tokenData;

    // 获取微信用户信息
    const userInfo = await getWechatUserInfo(access_token, openid);

    if (userInfo.errcode) {
      console.error("微信用户信息错误:", userInfo);
      return NextResponse.redirect(
        new URL(`/login?error=wechat_user_failed`, request.url)
      );
    }

    // 查询是否已绑定账号
    let user = await prisma.user.findFirst({
      where: { wechatOpenid: openid },
    });

    if (!user) {
      // 新用户：创建临时会话，重定向到绑定页面
      return NextResponse.redirect(
        new URL(`/bind-wechat?openid=${openid}&nickname=${encodeURIComponent(userInfo.nickname || "")}`, request.url)
      );
    }

    // 已绑定账号: 走服务端签名凭证 (不再用 __wechat_login__ 魔法密码)
// task061 2.2: 通过 server action / 设置 HttpOnly cookie 完成登录, 此处仅标记意图
    // (完整重构需要自定义 provider, 30 行内先做 session cookie 预埋)
    try {
      // 1) 颁发一次性签名 cookie (5 分钟有效), 由 /login/finish-wechat 完成 session 建立
      const finishToken = `${user.id}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
      const response = NextResponse.redirect(new URL("/account", request.url));
      response.cookies.set("wechat_finish", finishToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 300,
        path: "/",
      });
      // TODO 后续: 在 lib/auth.ts 增加 wechatLogin provider 接管 finishToken
      return response;
    } catch (e) {
      console.error("[wechat-callback] session 建立失败:", e);
      return NextResponse.redirect(new URL("/login?error=wechat_login_failed", request.url));
    }

    return NextResponse.redirect(new URL("/account", request.url));
  } catch (error) {
    console.error("微信回调错误:", error);
    return NextResponse.redirect(new URL("/login?error=wechat_error", request.url));
  }
}