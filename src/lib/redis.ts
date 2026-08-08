// task063 1.2: Upstash Redis 客户端封装 (Serverless HTTP, 零运维)
// (PM 上线前在 .env 配置 UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)
import { Redis } from "@upstash/redis";

// 单例 + HMR 安全
const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn("[redis] UPSTASH env 未配置, 限流与验证码将降级 (fail-open)");
    return null;
  }
  return new Redis({ url, token });
}

export const redis: Redis | null =
  globalForRedis.redis ?? createRedis();

if (redis && process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

/** 判断 Redis 是否就绪 (用于限流 / 验证码 等模块的降级判断) */
export function isRedisReady(): boolean {
  return redis !== null;
}