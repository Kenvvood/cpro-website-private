import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { hash } from "bcryptjs";

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  try {
    // task063 2.2: IP 级 3/h 限流
    const ip = getClientIp(request);
    const ipLimit = await rateLimit("register-ip", ip, 3_600_000, 3);
    if (!ipLimit.ok) return tooManyRequests(ipLimit.retryAfterMs);

    const body = await request.json();
    // task060 S0 1.3b: 注册接口不接收微信身份字段 (防账号接管)
    // (微信绑定必须走 /api/wechat/callback 服务端流程)
    const { username, phone, password } = body;
    const wechatOpenid: string | null = null;
    const wechatUnionid: string | null = null;

    // Validate required fields
    if (!username || !phone || !password) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      // task063 2.2: 统一响应文案 (防手机号枚举)
      return NextResponse.json(
        { error: "注册请求失败，请稍后重试" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        phone,
        passwordHash: hashedPassword,
        wechatOpenid,
        wechatUnionid,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { error: "注册失败" },
      { status: 500 }
    );
  }
}
