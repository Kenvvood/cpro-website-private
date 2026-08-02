import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";

// 生成6位验证码
function generateCode(): string {
  return randomInt(100000, 999999).toString();
}

// TODO: 替换为阿里云短信SDK
// npm install @alicloud/dysmsapi20170525
async function sendSmsCode(phone: string, code: string): Promise<boolean> {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const signName = process.env.ALIYUN_SMS_SIGN_NAME;
  const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE;

  if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
    console.warn("阿里云短信配置缺失，环境变量未设置");
    return false;
  }

  try {
    // 阿里云短信SDK调用示例（等购买服务后启用）
    // const dysmsapi = require("@alicloud/dysmsapi20170525");
    // const client = new dysmsapi({ accessKeyId, accessKeySecret });
    // await client.sendSms({ phoneNumbers: phone, signName, templateCode, templateParam: `{"code":"${code}"}` });

    console.log(`[SMS Mock] 发送验证码 ${code} 到 ${phone}`);
    return true;
  } catch (error) {
    console.error("短信发送失败:", error);
    return false;
  }
}

// 存储验证码（生产环境应使用Redis）
const codeStore = new Map<string, { code: string; expires: number }>();

export async function POST(request: Request) {
  try {
    const { phone, type } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "手机号不能为空" }, { status: 400 });
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }

    const code = generateCode();
    const expires = Date.now() + 5 * 60 * 1000; // 5分钟后过期

    // 存储验证码
    codeStore.set(phone, { code, expires });

    // 发送短信
    const sent = await sendSmsCode(phone, code);

    if (!sent) {
      return NextResponse.json(
        { error: "短信服务未配置或发送失败" },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, message: "验证码已发送" });
  } catch (error) {
    console.error("发送验证码错误:", error);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}

// 验证验证码
export async function PUT(request: Request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    const stored = codeStore.get(phone);

    if (!stored) {
      return NextResponse.json({ error: "请先获取验证码" }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      codeStore.delete(phone);
      return NextResponse.json({ error: "验证码已过期" }, { status: 400 });
    }

    if (stored.code !== code) {
      return NextResponse.json({ error: "验证码错误" }, { status: 400 });
    }

    // 验证成功，删除验证码
    codeStore.delete(phone);

    return NextResponse.json({ success: true, message: "验证成功" });
  } catch (error) {
    console.error("验证验证码错误:", error);
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}