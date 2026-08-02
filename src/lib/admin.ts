// src/lib/admin.ts — 管理员守卫 (Phase 7 task-0048)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * requireAdmin() — 当前 session 用户必须是 ADMIN
 * - 未登录 → null
 * - 非 ADMIN → null
 * - ADMIN → { id, username, role }
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, username: true, email: true },
  });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

/**
 * 解析来源 releaseId (Cookie 优先, Referer 兜底)
 * 双保险归因 (架构师 7/30 拍板):
 *   1. Cookie `from_release_id` 优先 (前端 CheckoutModal 触发时写入, 30min 有效)
 *   2. Referer 兜底 (形如 https://cprotrading.com/open-source/abc123)
 *
 * 容错优先: 任何解析失败返回 null, 不阻塞支付主流程 (架构师叮嘱)
 */
export function parseFromReleaseId(cookieHeader: string | null, referer: string | null): string | null {
  // 1. 试 Cookie
  if (cookieHeader) {
    const m = cookieHeader.match(/from_release_id=([^;]+)/);
    if (m) {
      const id = m[1].trim();
      // cuid 格式校验 (粗略: 长度 16+)
      if (id.length >= 8) return id;
    }
  }
  // 2. 试 Referer
  if (referer) {
    // 匹配 /open-source/<id> 或 /tutorials/<slug>
    const m = referer.match(/\/(?:open-source|tutorials)\/([^/?#]+)/);
    if (m) {
      const slugOrId = m[1].trim();
      if (slugOrId.length >= 8) return slugOrId;
    }
  }
  return null;
}