// task063 1.3: 滑动窗口限流 (Redis ZSET + Lua 原子操作 + Fail-Open 降级)
import { redis } from "@/lib/redis";

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterMs: number };

// Sliding Window: ZREMRANGEBYSCORE 清理窗口外 + ZCARD 当前计数 + ZADD 写入
// 失败兜底: Redis 不可用 → return ok=true (架构师 NEED-2 fail-open 拍板)
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local windowStart = now - windowMs
redis.call("ZREMRANGEBYSCORE", key, 0, windowStart)
local count = redis.call("ZCARD", key)
if count >= limit then
  return -1
end
-- 成员: now-随机数, 避免同 ms 重复
local member = now .. ":" .. tostring(math.random(1, 1000000))
redis.call("ZADD", key, now, member)
redis.call("PEXPIRE", key, windowMs)
return limit - count - 1
`;

export async function rateLimit(
  scope: string,
  key: string,
  windowMs: number,
  limit: number,
): Promise<RateLimitResult> {
  if (!redis) {
    // fail-open: Redis 未配置 → 放行 + 告警
    console.warn(`[rate-limit] Redis 未就绪, scope=${scope} key=${key} → fail-open`);
    return { ok: true, remaining: limit };
  }
  const fullKey = `rl:${scope}:${key}`;
  try {
    // @upstash/redis eval 返回 number
    const remaining = (await redis.eval(
      SLIDING_WINDOW_LUA,
      [fullKey],
      [String(windowMs), String(limit), String(Date.now())],
    )) as number;
    if (remaining < 0) {
      return { ok: false, retryAfterMs: windowMs };
    }
    return { ok: true, remaining };
  } catch (e) {
    // fail-open: Redis 异常 → 放行 + 告警
    console.error(`[rate-limit] Redis 调用失败, scope=${scope} key=${key}:`, e);
    return { ok: true, remaining: limit };
  }
}

/** 标准 429 响应 (中文) */
export function tooManyRequests(retryAfterMs: number): Response {
  return new Response(
    JSON.stringify({
      error: "操作过于频繁，请稍后再试",
      retryAfterMs,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
      },
    },
  );
}