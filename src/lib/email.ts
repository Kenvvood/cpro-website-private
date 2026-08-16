/**
 * v22.0 BATCH 24 (2026-08-17 01:55): 邮件发送库 (Resend HTTP API)
 *
 * 架构:
 *  - 主 Provider: Resend (推荐, HTTP API, 3K/月免费)
 *  - 备 Provider: 直接 console.log (dev 模式, no RESEND_API_KEY)
 *  - 3 模板: 验证码 / 订单确认 / 订阅欢迎
 *
 * 接入步骤 (PM 端):
 *  1. 注册 Resend (https://resend.com)
 *  2. 加域名 cprotrading.com, 配置 DKIM/SPF/DMARC (Resend 控制台)
 *  3. 生成 API Key, 加到 ECS .env.production: RESEND_API_KEY=re_xxx
 *  4. 验证: POST /api/email/test with { to: "you@gmail.com" } (需 admin 登录)
 */
import "server-only";
import { BRAND } from "@/config/brand";

// ---- Resend SDK (动态 import, 避免 dev 模式无 API key 时报错) ----
type ResendSendResponse = { id?: string; error?: { message: string } };
type ResendClient = { emails: { send: (payload: any) => Promise<ResendSendResponse> } };

let _client: ResendClient | null = null;
async function getResend(): Promise<ResendClient | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (_client) return _client;
  try {
    // 动态 import: Resend 是 ESM, 兼容 server context
    const { Resend } = await import("resend");
    _client = new Resend(apiKey) as unknown as ResendClient;
    return _client;
  } catch (e) {
    console.error("[email] Resend SDK 加载失败:", e);
    return null;
  }
}

// ---- 类型定义 ----
export type EmailTemplateName =
  | "verificationCode"
  | "orderConfirmation"
  | "subscriptionWelcome"
  | "refundApproved"
  | "ticketReply";

// 模板 data 类型 (按 template 选对应字段)
export interface EmailTemplateData {
  verificationCode?: { code: string; expiryMinutes?: number };
  orderConfirmation?: { orderNo: string; plan: string; amount: string; payMethod: string; txHash?: string };
  subscriptionWelcome?: { plan: string; expireAt: string; totalProducts: number };
  refundApproved?: { orderNo: string; refundPct: number; refundAmount: string; note?: string };
  ticketReply?: { ticketId: string; title: string; reply: string; adminName: string };
}

export interface SendEmailOptions {
  to: string | string[];
  // 通用模式 (必填 subject + html)
  subject?: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  // 模板模式 (新, BATCH 24 增强): 用 template 选模板 + data 填字段
  // 当 template 存在时, 自动选对应模板函数 (内部 dispatch, 跟直接调用 sendVerificationCode 等效)
  // 此时 subject + html 可省 (内部生成)
  template?: EmailTemplateName;
  data?: Record<string, any>;
}

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
  mode: "resend" | "console" | "noop"; // 实际发送模式
}

// ---- 主入口 ----
export async function sendEmail(options: SendEmailOptions): Promise<SendResult> {
  // 模板模式 (template + data): 自动 dispatch 到对应模板函数
  if (options.template) {
    const to = Array.isArray(options.to) ? options.to[0] : options.to;
    if (!to) {
      return { ok: false, error: "模板模式 to 必填", mode: "noop" };
    }
    const data = (options.data || {}) as any;
    switch (options.template) {
      case "verificationCode":
        return sendVerificationCode(to, data.code || "000000", data.expiryMinutes || 10);
      case "orderConfirmation":
        if (!data.orderNo || !data.plan || !data.amount || !data.payMethod) {
          return { ok: false, error: "orderConfirmation 缺字段", mode: "noop" };
        }
        return sendOrderConfirmation(to, data);
      case "subscriptionWelcome":
        if (!data.plan || !data.expireAt || !data.totalProducts) {
          return { ok: false, error: "subscriptionWelcome 缺字段", mode: "noop" };
        }
        return sendSubscriptionWelcome(to, data);
      case "refundApproved":
        if (!data.orderNo || data.refundPct === undefined || !data.refundAmount) {
          return { ok: false, error: "refundApproved 缺字段", mode: "noop" };
        }
        return sendRefundApproved(to, data);
      case "ticketReply":
        if (!data.ticketId || !data.title || !data.reply || !data.adminName) {
          return { ok: false, error: "ticketReply 缺字段", mode: "noop" };
        }
        return sendTicketReply(to, data);
      default:
        return { ok: false, error: `未知模板: ${options.template}`, mode: "noop" };
    }
  }

  const from = options.from || process.env.EMAIL_FROM || `CProTrading <noreply@${BRAND.domain}>`;
  const replyTo = options.replyTo || BRAND.contact.email;

  // 通用模式要求 subject + html
  if (!options.subject || !options.html) {
    return { ok: false, error: "通用模式需 subject + html, 或用 template + data 模板模式", mode: "noop" };
  }
  const subject = options.subject;
  const html = options.html;

  const resend = await getResend();
  if (!resend) {
    // Dev 模式或 RESEND_API_KEY 未配置: 打印到 console
    console.log("\n========== [email DEV MODE] ==========");
    console.log(`From:    ${from}`);
    console.log(`To:      ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reply-To: ${replyTo}`);
    console.log(`\n--- TEXT ---`);
    console.log(options.text || "(no text version)");
    console.log(`\n--- HTML (前 500 字符) ---`);
    console.log(html.slice(0, 500) + (html.length > 500 ? "..." : ""));
    console.log("========== [email DEV END] ==========\n");
    return { ok: true, mode: "console", id: `console-${Date.now()}` };
  }

  try {
    const result = await resend.emails.send({
      from,
      to: options.to,
      subject,
      html,
      text: options.text,
      reply_to: replyTo,
    });
    if (result.error) {
      return { ok: false, error: result.error.message, mode: "resend" };
    }
    return { ok: true, id: result.id, mode: "resend" };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e), mode: "resend" };
  }
}

// ---- 模板: 验证码 (注册/重置密码) ----
export async function sendVerificationCode(
  to: string,
  code: string,
  expiryMinutes: number = 10
): Promise<SendResult> {
  const subject = `【CProTrading】您的验证码: ${code}`;
  const html = `
    <div style="font-family: -apple-system, 'Microsoft YaHei', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1a1a1a;">
      <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #D4AF37;">
        <h1 style="margin: 0; font-size: 24px; color: #D4AF37;">CProTrading 城诺科技</h1>
        <p style="margin: 8px 0 0; font-size: 12px; color: #888;">${BRAND.slogan.zh}</p>
      </div>
      <div style="padding: 32px 0;">
        <p style="font-size: 16px; margin: 0 0 16px;">您好,</p>
        <p style="font-size: 14px; line-height: 24px; color: #4a4a4a; margin: 0 0 24px;">
          您正在 CProTrading 进行账户验证. 请使用以下验证码完成操作:
        </p>
        <div style="background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px; text-align: center; margin: 0 0 24px;">
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2962FF; font-family: 'Arial Black', monospace;">${code}</div>
        </div>
        <p style="font-size: 13px; line-height: 22px; color: #888; margin: 0 0 8px;">
          ⏱️ 验证码有效期: <strong>${expiryMinutes} 分钟</strong>, 请尽快使用.
        </p>
        <p style="font-size: 13px; line-height: 22px; color: #888; margin: 0 0 24px;">
          🔒 如果这不是您本人的操作, 请忽略此邮件.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #888; margin: 0;">
          遇到问题? 回复本邮件或联系 <a href="mailto:${BRAND.contact.email}" style="color: #2962FF;">${BRAND.contact.email}</a>
        </p>
      </div>
      <div style="text-align: center; padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 11px; color: #888;">
        <p style="margin: 4px 0;">© 2026 ${BRAND.entity} · <a href="https://${BRAND.domain}" style="color: #888;">${BRAND.domain}</a></p>
        <p style="margin: 4px 0;">${BRAND.copyright.icp}</p>
      </div>
    </div>
  `.trim();
  const text = `CProTrading 验证码: ${code} (${expiryMinutes} 分钟内有效). 如果不是您本人操作请忽略.`;
  return sendEmail({ to, subject, html, text });
}

// ---- 模板: 订单确认 (USDT 订阅成功) ----
export async function sendOrderConfirmation(
  to: string,
  orderInfo: {
    orderNo: string;
    plan: string;
    amount: string;
    payMethod: string;
    txHash?: string;
  }
): Promise<SendResult> {
  const subject = `【CProTrading】订单确认 - ${orderInfo.plan} (${orderInfo.amount})`;
  const html = `
    <div style="font-family: -apple-system, 'Microsoft YaHei', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1a1a1a;">
      <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #D4AF37;">
        <h1 style="margin: 0; font-size: 24px; color: #D4AF37;">CProTrading 城诺科技</h1>
      </div>
      <div style="padding: 32px 0;">
        <p style="font-size: 16px; margin: 0 0 16px;">感谢您的订阅! 🎉</p>
        <div style="background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px; margin: 0 0 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #888;">订单号</td><td style="padding: 8px 0; text-align: right; font-family: monospace;">${orderInfo.orderNo}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">订阅方案</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #D4AF37;">${orderInfo.plan}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">支付金额</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${orderInfo.amount}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">支付方式</td><td style="padding: 8px 0; text-align: right;">${orderInfo.payMethod}</td></tr>
            ${orderInfo.txHash ? `<tr><td style="padding: 8px 0; color: #888;">链上 Hash</td><td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 11px; word-break: break-all;">${orderInfo.txHash}</td></tr>` : ""}
          </table>
        </div>
        <p style="font-size: 14px; line-height: 24px; color: #4a4a4a;">
          您现在可以访问 <a href="https://${BRAND.domain}/products" style="color: #2962FF;">产品中心</a> 下载严选可商用 EA.
        </p>
        <p style="font-size: 14px; line-height: 24px; color: #4a4a4a;">
          4h 工单响应 · 终身质保 — 任何问题联系 <a href="mailto:${BRAND.contact.email}" style="color: #2962FF;">${BRAND.contact.email}</a>
        </p>
      </div>
      <div style="text-align: center; padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 11px; color: #888;">
        <p style="margin: 4px 0;">© 2026 ${BRAND.entity} · <a href="https://${BRAND.domain}" style="color: #888;">${BRAND.domain}</a></p>
        <p style="margin: 4px 0;">${BRAND.copyright.icp}</p>
      </div>
    </div>
  `.trim();
  const text = `订单确认: ${orderInfo.plan} (${orderInfo.amount}) - 订单号 ${orderInfo.orderNo}. 支付方式: ${orderInfo.payMethod}.`;
  return sendEmail({ to, subject, html, text });
}

// ---- 模板: 订阅欢迎 (订阅激活后) ----
export async function sendSubscriptionWelcome(
  to: string,
  info: { plan: string; expireAt: string; totalProducts: number }
): Promise<SendResult> {
  const subject = `【CProTrading】欢迎加入严选订阅 - ${info.plan}`;
  const html = `
    <div style="font-family: -apple-system, 'Microsoft YaHei', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1a1a1a;">
      <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #D4AF37;">
        <h1 style="margin: 0; font-size: 24px; color: #D4AF37;">CProTrading 城诺科技</h1>
      </div>
      <div style="padding: 32px 0;">
        <p style="font-size: 16px; margin: 0 0 16px;">欢迎加入 CProTrading 严选订阅! 🎉</p>
        <p style="font-size: 14px; line-height: 24px; color: #4a4a4a;">
          您的 <strong style="color: #D4AF37;">${info.plan}</strong> 订阅已激活, 有效期至 <strong>${info.expireAt}</strong>.
        </p>
        <p style="font-size: 14px; line-height: 24px; color: #4a4a4a;">
          您现在可以解锁全部 <strong>${info.totalProducts}</strong> 款严选可商用 EA, 包括 5 王牌门面.
        </p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="https://${BRAND.domain}/products" style="display: inline-block; background: #2962FF; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">立即浏览产品中心 →</a>
        </p>
        <p style="font-size: 13px; line-height: 22px; color: #888;">
          💡 推荐首看: <a href="https://${BRAND.domain}/guides" style="color: #2962FF;">部署教程</a> 5 集实战手册
        </p>
      </div>
      <div style="text-align: center; padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 11px; color: #888;">
        <p style="margin: 4px 0;">© 2026 ${BRAND.entity} · <a href="https://${BRAND.domain}" style="color: #888;">${BRAND.domain}</a></p>
        <p style="margin: 4px 0;">${BRAND.copyright.icp}</p>
      </div>
    </div>
  `.trim();
  const text = `欢迎加入 CProTrading 严选订阅! ${info.plan} 已激活, 有效期至 ${info.expireAt}.`;
  return sendEmail({ to, subject, html, text });
}

// ---- 模板: 退款批准 ----
export async function sendRefundApproved(
  to: string,
  info: { orderNo: string; refundPct: number; refundAmount: string; note?: string }
): Promise<SendResult> {
  const subject = `【CProTrading】退款已批准 - 订单 ${info.orderNo}`;
  const html = `
    <div style="font-family: -apple-system, 'Microsoft YaHei', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1a1a1a;">
      <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #26a69a;">
        <h1 style="margin: 0; font-size: 24px; color: #26a69a;">退款批准通知</h1>
      </div>
      <div style="padding: 32px 0;">
        <p style="font-size: 14px; line-height: 24px; color: #4a4a4a;">
          您的退款申请已批准, 详情如下:
        </p>
        <div style="background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #888;">订单号</td><td style="padding: 8px 0; text-align: right; font-family: monospace;">${info.orderNo}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">退款比例</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #26a69a;">${info.refundPct}%</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">退款金额</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${info.refundAmount}</td></tr>
            ${info.note ? `<tr><td style="padding: 8px 0; color: #888;">备注</td><td style="padding: 8px 0; text-align: right;">${info.note}</td></tr>` : ""}
          </table>
        </div>
        <p style="font-size: 13px; line-height: 22px; color: #888;">
          USDT 退款将通过原支付通道返还, 请在 24h 内查收.
        </p>
      </div>
      <div style="text-align: center; padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 11px; color: #888;">
        <p style="margin: 4px 0;">© 2026 ${BRAND.entity} · <a href="https://${BRAND.domain}" style="color: #888;">${BRAND.domain}</a></p>
        <p style="margin: 4px 0;">${BRAND.copyright.icp}</p>
      </div>
    </div>
  `.trim();
  const text = `退款批准: 订单 ${info.orderNo} - ${info.refundAmount} (${info.refundPct}%) 已批准.`;
  return sendEmail({ to, subject, html, text });
}

// ---- 模板: 工单回复 ----
export async function sendTicketReply(
  to: string,
  info: { ticketId: string; title: string; reply: string; adminName: string }
): Promise<SendResult> {
  const subject = `【CProTrading】工单回复 - ${info.title}`;
  const html = `
    <div style="font-family: -apple-system, 'Microsoft YaHei', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1a1a1a;">
      <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #2962FF;">
        <h1 style="margin: 0; font-size: 24px; color: #2962FF;">工单回复</h1>
      </div>
      <div style="padding: 32px 0;">
        <p style="font-size: 14px; line-height: 24px; color: #4a4a4a; margin: 0 0 16px;">
          您的工单 <strong>#${info.ticketId} - ${info.title}</strong> 有新回复:
        </p>
        <div style="background: #f7f8fa; border-left: 3px solid #2962FF; padding: 16px 20px; margin: 0 0 16px; font-size: 14px; line-height: 22px;">
          ${info.reply.replace(/\n/g, "<br/>")}
        </div>
        <p style="font-size: 13px; color: #888; margin: 0 0 16px;">
          回复人: <strong>${info.adminName}</strong>
        </p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="https://${BRAND.domain}/dashboard/tickets/${info.ticketId}" style="display: inline-block; background: #2962FF; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">查看完整工单 →</a>
        </p>
      </div>
      <div style="text-align: center; padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 11px; color: #888;">
        <p style="margin: 4px 0;">© 2026 ${BRAND.entity} · <a href="https://${BRAND.domain}" style="color: #888;">${BRAND.domain}</a></p>
        <p style="margin: 4px 0;">${BRAND.copyright.icp}</p>
      </div>
    </div>
  `.trim();
  const text = `工单 #${info.ticketId} - ${info.title} 有新回复: ${info.reply}`;
  return sendEmail({ to, subject, html, text });
}
