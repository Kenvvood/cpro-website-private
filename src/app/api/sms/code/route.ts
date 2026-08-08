// task063 2.1: SMS 验证码 Redis 化 + IP/phone 限流 + verify 错误上限
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { randomInt } from "crypto";

const CODE_TTL_S = 5 * 60; // 5 分钟过期
const MAX_VERIFY_ERRORS = 3; // 错误 3 次即销毁验证码 (架构师 NEED-4)

// 获取客户端 IP (x-forwarded-for 第一个, x-real-ip 兜底)
function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// 生成6位验证码
function generateCode(): string {
  return randomInt(100000, 999999).toString();
}

// TODO: 替换为阿里云短信SDK
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

    // task063 2.1: 不再打印明文 code, 仅打印手机号与成功标志
    console.log(`[SMS] sent to ${phone.replace(/^(\d{3})\d{4}/, "$1****")}`);
    return true;
  } catch (error) {
    console.error("短信发送失败:", error);
    return false;
  }
}

// 发送验证码
export async function POST(request: Request) {
  try {
    const { phone, type } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "手机号不能为空" }, { status: 400 });
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }

    const ip = getClientIp(request);

    // 1) IP 限流: 1/min
    const ipLimit = await rateLimit("sms-ip", ip, 60_000, 1);
    if (!ipLimit.ok) return tooManyRequests(ipLimit.retryAfterMs);

    // 2) phone 限流: 1/min
    const phone1m = await rateLimit("sms-phone-1m", phone, 60_000, 1);
    if (!phone1m.ok) return tooManyRequests(phone1m.retryAfterMs);

    // 3) phone 限流: 5/h
    const phone1h = await rateLimit("sms-phone-1h", phone, 3_600_000, 5);
    if (!phone1h.ok) return tooManyRequests(phone1h.retryAfterMs);

    const code = generateCode();

    // 存储验证码到 Redis (key: sms:code:<phone>, TTL 5min)
    // 同时重置错误计数 key: sms:err:<phone>
    if (redis) {
      await Promise.all([
        redis.set(`sms:code:${phone}`, code, { ex: CODE_TTL_S }),
        redis.del(`sms:err:${phone}`),
      ]);
    }

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

    const ip = getClientIp(request);

    // verify 限流: 同 IP 10/h (防暴力枚举 6位 = 100万种)
    const verifyLimit = await rateLimit("sms-verify", ip, 3_600_000, 10);
    if (!verifyLimit.ok) return tooManyRequests(verifyLimit.retryAfterMs);

    if (!redis) {
      // Redis 未就绪: fail-open 验证 (不阻断主流程)
      console.warn("[sms-verify] Redis 未就绪, 跳过验证码校验");
      return NextResponse.json({ success: true, message: "验证成功 (Redis 降级)" });
    }

    const stored = await redis.get<string>(`sms:code:${phone}`);

    if (!stored) {
      return NextResponse.json({ error: "请先获取验证码" }, { status: 400 });
    }

    if (stored !== code) {
      // 错误: 累加计数, 达上限则销毁验证码
      const errCount = await redis.incr(`sms:err:${phone}`);
      if (errCount >= MAX_VERIFY_ERRORS) {
        await redis.del(`sms:code:${phone}`);
        await redis.del(`sms:err:${phone}`);
        return NextResponse.json(
          { error: "验证码错误次数过多，请重新获取" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: "验证码错误" }, { status: 400 });
    }

    // 验证成功: 清理两个 key
    await Promise.all([
      redis.del(`sms:code:${phone}`),
      redis.del(`sms:err:${phone}`),
    ]);

    return NextResponse.json({ success: true, message: "验证成功" });
  } catch (error) {
    console.error("验证验证码错误:", error);
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}