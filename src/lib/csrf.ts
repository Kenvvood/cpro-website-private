// task063 3.1: Origin/Referer 白名单 CSRF 校验 (架构师 NEED-3 拍板)
// (严格: 仅允许生产 BRAND.domain + 开发 localhost; 禁止 *.vercel.app)
import { BRAND } from "@/config/brand";

function buildAllowedOrigins(): Set<string> {
  const allowed = new Set<string>();
  // 生产 (with/without www)
  allowed.add(`https://${BRAND.domain}`);
  allowed.add(`https://www.${BRAND.domain}`);
  // 开发环境
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }
  return allowed;
}

const ALLOWED_ORIGINS = buildAllowedOrigins();

export type CsrfResult =
  | { ok: true }
  | { ok: false; reason: "no_origin" | "not_in_whitelist"; origin: string | null };

export function checkCsrf(request: Request): CsrfResult {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin ?? (referer ? safeOriginFromReferer(referer) : null);
  if (!source) {
    return { ok: false, reason: "no_origin", origin: null };
  }
  if (!ALLOWED_ORIGINS.has(source)) {
    return { ok: false, reason: "not_in_whitelist", origin: source };
  }
  return { ok: true };
}

function safeOriginFromReferer(referer: string): string | null {
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/** 标准 403 响应 */
export function csrfForbidden(reason: string): Response {
  return new Response(JSON.stringify({ error: "跨域请求被拒绝", reason }), {
    status: 403,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}