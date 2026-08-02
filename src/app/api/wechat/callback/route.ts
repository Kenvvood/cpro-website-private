import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signIn } from "next-auth/react";

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

    // 已绑定账号：直接登录
    const result = await signIn("credentials", {
      username: user.username,
      password: "__wechat_login__", // 微信登录不需要密码
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.redirect(new URL("/login?error=wechat_login_failed", request.url));
    }

    return NextResponse.redirect(new URL("/account", request.url));
  } catch (error) {
    console.error("微信回调错误:", error);
    return NextResponse.redirect(new URL("/login?error=wechat_error", request.url));
  }
}