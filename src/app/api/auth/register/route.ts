import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, phone, password, wechatOpenid, wechatUnionid, wechatQrTicket } = body;

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
      return NextResponse.json(
        { error: "该手机号已注册" },
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
        wechatOpenid: wechatOpenid || null,
        wechatUnionid: wechatUnionid || null,
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
