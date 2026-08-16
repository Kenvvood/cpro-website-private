/**
 * v22.0 BATCH 24 (2026-08-17 01:00): Resend 邮件集成
 *  - 选型: Resend (HTTP API, 3K/月免费, 域名 cprotrading.com 配置 DKIM/SPF 即可)
 *  - 用途: 注册验证 / 订单确认 / 订阅欢迎 (3 核心模板)
 *  - 后续接入: SMS 已用钉钉 webhook 替代, 邮件用于"重要时刻" (订单/订阅/密码重置)
 *
 * 用法:
 *   import { sendEmail, emailTemplates } from "@/lib/email"
 *   await sendEmail({ to: "user@example.com", template: "orderConfirmation", data: {...} })
 *
 * env (从 .env.production 读):
 *   RESEND_API_KEY      re_xxx (Resend 控制台拿)
 *   EMAIL_FROM          "CProTrading 城诺科技 <noreply@cprotrading.com>" (需域名验证后改)
 *   EMAIL_REPLY_TO      "support@cprotrading.com" (用户回复会到这)
 */
import { Resend } from "resend";
import { BRAND } from "@/config/brand";

// ===== 客户端初始化 (单例) =====
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    // 不报错, 返回 null, 调用方决定怎么处理 (开发环境)
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// ===== 邮件模板类型 =====
export type EmailTemplateName =
  | "verificationCode"      // 注册验证码
  | "orderConfirmation"     // 订单确认
  | "subscriptionWelcome"   // 订阅欢迎
  | "passwordReset"         // 密码重置
  | "refundApproved";       // 退款批准

interface VerificationCodeData {
  code: string;
  expireMinutes?: number;
}
interface OrderConfirmationData {
  orderNo: string;
  productName: string;
  amount: string;
  paymentMethod: "USDT" | "微信" | "支付宝";
  downloadUrl: string;
}
interface SubscriptionWelcomeData {
  plan: "WEEKLY" | "MONTHLY" | "ANNUAL" | "FOUNDER";
  expireAt: string;  // ISO
  manageUrl: string;
}
interface PasswordResetData {
  resetUrl: string;
  expireMinutes: number;
}
interface RefundApprovedData {
  refundId: string;
  amount: string;
  reason: string;
  arriveAt: string;  // 预计到账时间
}

export type EmailData =
  | VerificationCodeData
  | OrderConfirmationData
  | SubscriptionWelcomeData
  | PasswordResetData
  | RefundApprovedData;

// ===== 统一发送接口 =====
export interface SendEmailOptions {
  to: string | string[];
  template: EmailTemplateName;
  data: EmailData;
  subject?: string;  // 可选覆盖默认 subject
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;       // Resend 返回的 message id
  error?: string;
  skipped?: boolean; // 跳过原因 (如 RESEND_API_KEY 未配置)
}

/**
 * 发送邮件 - 主入口
 * 自动选择模板 + 渲染 HTML + 发送到 Resend API
 */
export async function sendEmail({
  to,
  template,
  data,
  subject,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResult> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY 未配置, 跳过发送:", { to, template });
    return { ok: false, skipped: true, error: "RESEND_API_KEY 未配置" };
  }

  const from = process.env.EMAIL_FROM || `CProTrading 城诺科技 <noreply@cprotrading.com>`;
  const reply = replyTo || process.env.EMAIL_REPLY_TO || BRAND.contact.email;

  const { subject: finalSubject, html, text } = emailTemplates[template](data as never);

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      replyTo: reply,
      subject: subject || finalSubject,
      html,
      text,
    });

    if (result.error) {
      console.error("[email] Resend API 错误:", result.error);
      return { ok: false, error: result.error.message };
    }

    return { ok: true, id: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] 发送异常:", message);
    return { ok: false, error: message };
  }
}

// ===== 邮件模板 (返回 subject + html + text) =====

const emailTemplates: Record<EmailTemplateName, (data: any) => { subject: string; html: string; text: string }> = {
  // 1. 注册验证码
  verificationCode: (data: VerificationCodeData) => {
    const expire = data.expireMinutes || 10;
    return {
      subject: `【${BRAND.name.zh}】您的注册验证码: ${data.code}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">${BRAND.name.zh}</h2>
          <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6;">您好,</p>
          <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6;">您的注册验证码为:</p>
          <div style="background: #f7f8fa; border: 1px solid #e5e7eb; padding: 24px; text-align: center; margin: 24px 0; border-radius: 8px;">
            <span style="font-family: 'Arial Black', monospace; font-size: 36px; font-weight: 700; color: #2962FF; letter-spacing: 8px;">${data.code}</span>
          </div>
          <p style="color: #888888; font-size: 12px; line-height: 1.6;">验证码有效期 <strong>${expire} 分钟</strong>, 请尽快使用。</p>
          <p style="color: #888888; font-size: 12px; line-height: 1.6;">如非您本人操作, 请忽略本邮件。</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #888888; font-size: 11px;">${BRAND.entity} · <a href="https://${BRAND.domain}" style="color: #888888;">${BRAND.domain}</a></p>
        </div>
      `,
      text: `${BRAND.name.zh}\n\n您的注册验证码: ${data.code}\n有效期 ${expire} 分钟\n\n如非您本人操作, 请忽略本邮件。`,
    };
  },

  // 2. 订单确认
  orderConfirmation: (data: OrderConfirmationData) => ({
    subject: `【${BRAND.name.zh}】订单确认 #${data.orderNo}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">订单确认</h2>
        <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6;">感谢您的订购,</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #888888; width: 30%;">订单号</td><td style="padding: 8px 0; color: #1a1a1a; font-family: monospace;">${data.orderNo}</td></tr>
          <tr><td style="padding: 8px 0; color: #888888;">商品</td><td style="padding: 8px 0; color: #1a1a1a;">${data.productName}</td></tr>
          <tr><td style="padding: 8px 0; color: #888888;">金额</td><td style="padding: 8px 0; color: #1a1a1a; font-weight: 700;">${data.amount}</td></tr>
          <tr><td style="padding: 8px 0; color: #888888;">支付方式</td><td style="padding: 8px 0; color: #1a1a1a;">${data.paymentMethod}</td></tr>
        </table>
        <a href="${data.downloadUrl}" style="display: inline-block; background: #2962FF; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 16px 0;">立即下载</a>
        <p style="color: #888888; font-size: 12px; line-height: 1.6; margin-top: 24px;">下载链接 24 小时内有效, 过期请重新登录获取。</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #888888; font-size: 11px;">${BRAND.entity} · <a href="https://${BRAND.domain}" style="color: #888888;">${BRAND.domain}</a></p>
      </div>
    `,
    text: `${BRAND.name.zh} 订单确认\n\n订单号: ${data.orderNo}\n商品: ${data.productName}\n金额: ${data.amount}\n支付方式: ${data.paymentMethod}\n\n下载: ${data.downloadUrl}\n(24 小时内有效)`,
  }),

  // 3. 订阅欢迎
  subscriptionWelcome: (data: SubscriptionWelcomeData) => {
    const planLabel = { WEEKLY: "周付", MONTHLY: "月付", ANNUAL: "年付", FOUNDER: "创始" }[data.plan];
    return {
      subject: `【${BRAND.name.zh}】欢迎加入 ${planLabel}会员 🎉`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">欢迎加入 ${BRAND.name.zh} 🎉</h2>
          <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6;">您的 ${planLabel} 订阅已激活, 严选 ${BRAND.mtt.abbr} 服务正式解锁。</p>
          <div style="background: #f7f8fa; border: 1px solid #e5e7eb; padding: 16px; margin: 24px 0; border-radius: 8px;">
            <p style="color: #888888; font-size: 12px; margin: 0 0 8px 0;">订阅类型</p>
            <p style="color: #1a1a1a; font-size: 18px; font-weight: 700; margin: 0;">${planLabel}会员</p>
            <p style="color: #888888; font-size: 12px; margin: 12px 0 0 0;">到期时间</p>
            <p style="color: #1a1a1a; font-size: 14px; margin: 0;">${new Date(data.expireAt).toLocaleString("zh-CN")}</p>
          </div>
          <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6;">您现在可以:</p>
          <ul style="color: #4a4a4a; font-size: 14px; line-height: 1.8; padding-left: 20px;">
            <li>浏览 5 王牌 + 46 严选订阅 (全部 MQL4/MQL5 EA)</li>
            <li>使用 6 款实战工具 (斐波那契 / 仓位 / R:R 等)</li>
            <li>下载 5 部署教程 (EA 部署 / 服务器 / MTT 终端)</li>
            <li>4 小时工单响应 + 终身质保</li>
          </ul>
          <a href="${data.manageUrl}" style="display: inline-block; background: #2962FF; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 16px 0;">管理订阅</a>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #888888; font-size: 11px;">${BRAND.entity} · <a href="https://${BRAND.domain}" style="color: #888888;">${BRAND.domain}</a></p>
        </div>
      `,
      text: `${BRAND.name.zh} 订阅欢迎\n\n${planLabel}会员已激活\n到期: ${data.expireAt}\n\n您可以浏览 5 王牌 + 46 严选 EA, 6 款工具, 5 部署教程。\n管理订阅: ${data.manageUrl}`,
    };
  },

  // 4. 密码重置
  passwordReset: (data: PasswordResetData) => ({
    subject: `【${BRAND.name.zh}】密码重置`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">密码重置</h2>
        <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6;">您请求重置密码, 点击下方链接继续:</p>
        <a href="${data.resetUrl}" style="display: inline-block; background: #2962FF; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 16px 0;">重置密码</a>
        <p style="color: #888888; font-size: 12px;">链接有效期 <strong>${data.expireMinutes} 分钟</strong>, 仅可使用一次。</p>
        <p style="color: #888888; font-size: 12px;">如非您本人操作, 请忽略本邮件, 您的账号安全。</p>
      </div>
    `,
    text: `${BRAND.name.zh} 密码重置\n\n重置链接: ${data.resetUrl}\n有效期 ${data.expireMinutes} 分钟`,
  }),

  // 5. 退款批准
  refundApproved: (data: RefundApprovedData) => ({
    subject: `【${BRAND.name.zh}】退款已批准 #${data.refundId}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">退款已批准 ✓</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #888888; width: 30%;">退款单号</td><td style="padding: 8px 0; font-family: monospace;">${data.refundId}</td></tr>
          <tr><td style="padding: 8px 0; color: #888888;">退款金额</td><td style="padding: 8px 0; font-weight: 700;">${data.amount}</td></tr>
          <tr><td style="padding: 8px 0; color: #888888;">退款原因</td><td style="padding: 8px 0;">${data.reason}</td></tr>
          <tr><td style="padding: 8px 0; color: #888888;">预计到账</td><td style="padding: 8px 0;">${data.arriveAt}</td></tr>
        </table>
        <p style="color: #888888; font-size: 12px;">如有疑问, 请回复本邮件或联系客服。</p>
      </div>
    `,
    text: `${BRAND.name.zh} 退款已批准\n\n退款单号: ${data.refundId}\n金额: ${data.amount}\n原因: ${data.reason}\n预计到账: ${data.arriveAt}`,
  }),
};

// ===== 便利函数: 单模板直接 send =====

export async function sendVerificationCode(to: string, code: string, expireMinutes = 10) {
  return sendEmail({ to, template: "verificationCode", data: { code, expireMinutes } });
}

export async function sendOrderConfirmation(to: string, data: OrderConfirmationData) {
  return sendEmail({ to, template: "orderConfirmation", data });
}

export async function sendSubscriptionWelcome(to: string, data: SubscriptionWelcomeData) {
  return sendEmail({ to, template: "subscriptionWelcome", data });
}

export async function sendPasswordReset(to: string, data: PasswordResetData) {
  return sendEmail({ to, template: "passwordReset", data });
}

export async function sendRefundApproved(to: string, data: RefundApprovedData) {
  return sendEmail({ to, template: "refundApproved", data });
}
