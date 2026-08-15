// v22.0 PATCH 17.10: 健康检查 API (CloudMonitor 探测用)
// 返回 200 + JSON: { status, pm2, db, redis, ts }
// ECS health_check.sh 每 5 分钟探一次

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis, isRedisReady } from "@/lib/redis";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HealthStatus {
  status: "ok" | "degraded" | "down";
  pm2: boolean;
  db: boolean;
  redis: boolean;
  uptime_s: number;
  memory: { used_mb: number; total_mb: number; pct: number };
  ts: string;
}

async function checkDb(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  if (!isRedisReady()) return false;
  try {
    await redis!.ping();
    return true;
  } catch {
    return false;
  }
}

function checkPm2(): boolean {
  try {
    const out = execSync("pm2 jlist 2>/dev/null", { encoding: "utf-8" });
    return out.includes('"name":"cpro-web"') && out.includes('"status":"online"');
  } catch {
    return false;
  }
}

function getMemory() {
  const used = process.memoryUsage();
  return {
    used_mb: Math.round(used.heapUsed / 1024 / 1024),
    total_mb: Math.round(used.heapTotal / 1024 / 1024),
    pct: Math.round((used.heapUsed / used.heapTotal) * 100),
  };
}

export async function GET() {
  const [db, redis_ok] = await Promise.all([checkDb(), checkRedis()]);
  const pm2 = checkPm2();
  const memory = getMemory();

  // 综合状态: pm2 + db 都 OK → ok; db 挂 → down; 其他降级 → degraded
  const status: HealthStatus["status"] =
    !pm2 || !db ? "down" : redis_ok && memory.pct < 90 ? "ok" : "degraded";

  const body: HealthStatus = {
    status,
    pm2,
    db,
    redis: redis_ok,
    uptime_s: Math.round(process.uptime()),
    memory,
    ts: new Date().toISOString(),
  };

  // 状态码: down → 503, ok/degraded → 200 (CloudMonitor 通过状态码判健康)
  return NextResponse.json(body, { status: status === "down" ? 503 : 200 });
}
