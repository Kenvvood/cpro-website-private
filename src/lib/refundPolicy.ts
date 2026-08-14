// /lib/refundPolicy.ts — 退款阶梯计算 (v22.0 Phase 7.24 Batch 14B)
// PM 拍板 2026-08-12:
//   - 5 档时间阶梯: 0-3=100 / 4-7=70 / 8-15=40 / 16-30=20 / 30+=0
//   - 4 档下载阶梯: 0=100 / 1-3=70 / 4+=50 / 8+=0
//   - 实际退款比例 = min(时间档, 下载档)
//   - 不冻结账号 (走阶梯自动卡住)

export type TimeBucket = '0-3' | '4-7' | '8-15' | '16-30' | '30+';
export type DownloadBucket = '0' | '1-3' | '4-7' | '8+';

export interface TimeBucketResult {
  bucket: TimeBucket;
  pct: number;  // 退款百分比 0-100
  day: number;  // 订阅天数
}

export interface DownloadBucketResult {
  bucket: DownloadBucket;
  pct: number;  // 退款百分比 0-100
  count: number;  // 下载资源数
  bytes: number;  // 下载字节数
}

export interface RefundCalcResult {
  timeBucket: TimeBucket;
  timePct: number;
  downloadBucket: DownloadBucket;
  downloadPct: number;
  actualPct: number;  // min(time, download)
  orderAmount: number;  // 订单金额 (USDT)
  refundAmount: number;  // 实际退款金额 (USDT)
  deductedAmount: number;  // 扣减金额
  description: string;  // 人话描述
}

// 5 档时间阶梯
const TIME_BUCKETS: Array<{ test: (d: number) => boolean; bucket: TimeBucket; pct: number }> = [
  { test: (d) => d <= 3, bucket: '0-3', pct: 100 },
  { test: (d) => d <= 7, bucket: '4-7', pct: 70 },
  { test: (d) => d <= 15, bucket: '8-15', pct: 40 },
  { test: (d) => d <= 30, bucket: '16-30', pct: 20 },
  { test: () => true, bucket: '30+', pct: 0 },
];

// 4 档下载阶梯
const DOWNLOAD_BUCKETS: Array<{ test: (c: number) => boolean; bucket: DownloadBucket; pct: number }> = [
  { test: (c) => c === 0, bucket: '0', pct: 100 },
  { test: (c) => c <= 3, bucket: '1-3', pct: 70 },
  { test: (c) => c < 8, bucket: '4-7', pct: 50 },
  { test: () => true, bucket: '8+', pct: 0 },
];

// 计算时间档 (基于订单 paidAt 到现在天数)
export function calcTimeBucket(paidAt: Date, now: Date = new Date()): TimeBucketResult {
  const day = Math.max(0, Math.floor((now.getTime() - paidAt.getTime()) / (24 * 60 * 60 * 1000)));
  const match = TIME_BUCKETS.find((b) => b.test(day))!;
  return { bucket: match.bucket, pct: match.pct, day };
}

// 计算下载档
export function calcDownloadBucket(count: number, bytes: number = 0): DownloadBucketResult {
  const match = DOWNLOAD_BUCKETS.find((b) => b.test(count))!;
  return { bucket: match.bucket, pct: match.pct, count, bytes };
}

// 计算实际退款
export function calcRefund(paidAt: Date, orderAmount: number, downloadCount: number, downloadBytes: number = 0): RefundCalcResult {
  const time = calcTimeBucket(paidAt);
  const dl = calcDownloadBucket(downloadCount, downloadBytes);
  const actualPct = Math.min(time.pct, dl.pct);
  // USDT 8 位小数精度 (Prisma Decimal(18,8))
  const refundAmount = Math.floor(orderAmount * actualPct) / 100;
  const deductedAmount = orderAmount - refundAmount;

  const desc =
    actualPct === 0
      ? `订阅 ${time.day} 天 + 已下载 ${dl.count} 个资源, 已超出退款窗口, 无法退款`
      : `订阅 ${time.day} 天 (${time.bucket} 档 ${time.pct}%) + 已下载 ${dl.count} 个资源 (${dl.bucket} 档 ${dl.pct}%), 实际退款 ${actualPct}%`;

  return {
    timeBucket: time.bucket,
    timePct: time.pct,
    downloadBucket: dl.bucket,
    downloadPct: dl.pct,
    actualPct,
    orderAmount,
    refundAmount,
    deductedAmount,
    description: desc,
  };
}

// 退款阶梯规则说明 (前端展示)
export const REFUND_RULES_DESCRIPTION = `
**5 档时间阶梯** (按订阅天数)
• 0-3 天: 100% 退款
• 4-7 天: 70% 退款
• 8-15 天: 40% 退款
• 16-30 天: 20% 退款
• 30+ 天: 不退款

**4 档下载门槛** (按已下载资源数)
• 0 个: 100% 退款
• 1-3 个: 70% 退款
• 4-7 个: 50% 退款
• 8+ 个: 不退款

**实际退款比例 = min(时间档, 下载档)**

**不冻结账号**: 退过 1 次后仍可重新订阅, 但下载量累计计算 (重复退订会被阶梯锁死)。
`.trim();
