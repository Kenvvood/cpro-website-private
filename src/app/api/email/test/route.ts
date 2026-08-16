/**
 * v22.0 BATCH 24: 邮件测试 API
 *  - POST /api/email/test
 *  - body: { to: string, template?: EmailTemplateName }
 *  - 用途: PM 配 RESEND_API_KEY 后, 调这接口验证邮件能发出去
 *  - 安全: 仅 admin 能调 (requireAdmin) - 防止被恶意刷邮件
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, sendVerificationCode } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 鉴权: 仅 admin
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (userRole !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "需要 ADMIN 权限" },
      { status: 403 },
    );
  }

  let body: { to?: string; template?: string; code?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "body 必须 JSON" }, { status: 400 });
  }

  const to = body.to;
  if (!to) {
    return NextResponse.json({ ok: false, error: "to 必填" }, { status: 400 });
  }

  // 默认发验证码测试 (最常用)
  if (!body.template || body.template === "verificationCode") {
    const code = body.code || "123456";
    const result = await sendVerificationCode(to, code, 10);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  }

  // 其他模板走 sendEmail
  const result = await sendEmail({
    to,
    template: body.template as any,
    data: (body as any).data || { code: "123456" },  // 兜底
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
