// task061 2.2: 微信登录 state 共享存储 (防 CSRF)
// (从 src/app/api/wechat/qrcode/route.ts 抽出, callback 与 qrcode 共享同一份 Map)
const STATE_TTL_MS = 5 * 60 * 1000; // 5 分钟过期

// 进程内 Map; 多实例/Serverless 下不可靠 (后续 sub-commit 迁 Redis)
const stateStore = new Map<string, number>();

/** 生成并登记一个 state */
export function createState(): string {
  // 简单随机字符串 (16 字符)
  const s =
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10);
  stateStore.set(s, Date.now());
  return s;
}

/** 校验并消费 state (一次性, 校验后立即删除) */
export function consumeState(state: string | null): boolean {
  if (!state) return false;
  const createdAt = stateStore.get(state);
  if (!createdAt) return false;
  stateStore.delete(state); // 一次性消费
  return Date.now() - createdAt <= STATE_TTL_MS;
}

/** 清理过期 state (DELETE /api/wechat/qrcode 触发) */
export function cleanExpiredStates(): number {
  const now = Date.now();
  let cleaned = 0;
  for (const [s, t] of stateStore.entries()) {
    if (now - t > STATE_TTL_MS) {
      stateStore.delete(s);
      cleaned++;
    }
  }
  return cleaned;
}