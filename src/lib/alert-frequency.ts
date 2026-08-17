/**
 * v22.0 BATCH 26 (2026-08-17 09:35): 告警频率限制 + 去重
 *
 * 设计:
 *  - 同类型告警 1h 内只发 1 次 (防告警风暴)
 *  - 5min 内 5 次同类告警 → 触发紧急升级 (发多次 alert)
 *  - 用本地文件 (var/lib/cpro-alerts) 持久化, 避免 Redis 依赖
 *
 * 用法:
 *   if (shouldAlert('5xx-500', 'API /api/products 500')) {
 *     await sendAlert(...);
 *   }
 */
import "server-only";
import fs from "fs";
import path from "path";

const ALERT_DIR = "/var/lib/cpro-alerts";
const ONE_HOUR_MS = 60 * 60 * 1000;
const FIVE_MIN_MS = 5 * 60 * 1000;
const DEDUP_WINDOW_MS = ONE_HOUR_MS;
const BURST_THRESHOLD = 5; // 5min 内 5 次

interface AlertRecord {
  count: number;
  firstAt: number;
  lastAt: number;
  lastMessage: string;
}

function ensureDir() {
  if (!fs.existsSync(ALERT_DIR)) {
    try {
      fs.mkdirSync(ALERT_DIR, { recursive: true });
    } catch (e) {
      // 权限不够就 fall back 到 /tmp
      console.warn(`[alert-frequency] 无法创建 ${ALERT_DIR}, 降级到 /tmp/cpro-alerts`);
    }
  }
}

function getDir(): string {
  ensureDir();
  return fs.existsSync(ALERT_DIR) ? ALERT_DIR : "/tmp/cpro-alerts";
}

function getRecordPath(key: string): string {
  // key 合法化 (替换非字母数字字符为 _)
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
  return path.join(getDir(), `${safe}.json`);
}

function readRecord(key: string): AlertRecord | null {
  const p = getRecordPath(key);
  try {
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw) as AlertRecord;
  } catch (e) {
    return null;
  }
}

function writeRecord(key: string, record: AlertRecord): void {
  const p = getRecordPath(key);
  try {
    fs.writeFileSync(p, JSON.stringify(record), "utf-8");
  } catch (e) {
    console.warn(`[alert-frequency] 写 ${p} 失败:`, e);
  }
}

function cleanExpired(key: string): void {
  const record = readRecord(key);
  if (!record) return;
  const now = Date.now();
  // 超过 1h 窗口 → 删
  if (now - record.firstAt > DEDUP_WINDOW_MS) {
    try {
      fs.unlinkSync(getRecordPath(key));
    } catch (e) {
      // ignore
    }
  }
}

/**
 * 是否应该发送告警
 * @returns "send" 正常发送 / "burst" 紧急升级 (5min 内 ≥ 5 次) / "skip" 1h 内已发过
 */
export function shouldAlert(key: string, message: string): "send" | "burst" | "skip" {
  const now = Date.now();
  cleanExpired(key);
  const record = readRecord(key);

  if (!record) {
    // 首次告警
    writeRecord(key, { count: 1, firstAt: now, lastAt: now, lastMessage: message });
    return "send";
  }

  // 5min 内计数 → 累计
  const isInBurstWindow = now - record.firstAt < FIVE_MIN_MS;
  const updated: AlertRecord = {
    count: record.count + 1,
    firstAt: isInBurstWindow ? record.firstAt : now,
    lastAt: now,
    lastMessage: message,
  };
  writeRecord(key, updated);

  // 5min 内 ≥ 5 次 → 紧急升级
  if (isInBurstWindow && updated.count >= BURST_THRESHOLD) {
    return "burst";
  }

  // 1h 内已发过 → 跳过
  return "skip";
}

/** 清理所有告警记录 (测试用) */
export function clearAllAlerts(): void {
  const dir = getDir();
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".json")) {
      try {
        fs.unlinkSync(path.join(dir, f));
      } catch (e) {
        // ignore
      }
    }
  }
}

/** 当前告警统计 (调试/可视化) */
export function getAlertStats(): { key: string; count: number; lastAt: number; lastMessage: string }[] {
  const dir = getDir();
  if (!fs.existsSync(dir)) return [];
  const stats: { key: string; count: number; lastAt: number; lastMessage: string }[] = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const r = JSON.parse(raw) as AlertRecord;
      stats.push({ key: f.replace(".json", ""), count: r.count, lastAt: r.lastAt, lastMessage: r.lastMessage });
    } catch (e) {
      // skip
    }
  }
  return stats.sort((a, b) => b.lastAt - a.lastAt);
}
