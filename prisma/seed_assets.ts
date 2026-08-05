/**
 * seed_assets.ts — task-0031 阶段 2: Prisma 数据库注入
 *
 * 输入: mql5-phase2/output/product_descriptions/product_descriptions_all.json (19,328)
 * 输出: 19,328 Product 记录 + Tags + Tier
 *
 * 严禁:
 *   - 改 .mq5/.mq4/.mqh
 *   - 无脑平铺几百行模板代码
 *   - 单次写入 19,328 (会 OOM, 用 BATCH_SIZE=500)
 *
 * 依据: ARCHIVE v6.0/6.1 + task-0031
 *
 * 用法: npx tsx prisma/seed_assets.ts
 */

// @/generated/prisma 是 Next.js Webpack 路径别名, tsc 静态解析失败
// seed_assets.ts 通过 tsx 直接运行, 改用 CommonJS + 物理绝对路径
// task051 PAYMENT-REBUILD: Prisma 7 必须显式传 adapter (libsql)
// @ts-ignore - Node 脚本, 不参与前端 bundle 类型检查
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require(join(process.cwd(), 'src', 'generated', 'prisma'));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaLibSql } = require('@prisma/adapter-libsql');
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

// task051 PAYMENT-REBUILD: 与 src/lib/prisma.ts 一致的 adapter 模式
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });
const BATCH_SIZE = 500;

// 19,328 计划定义 (task051 PAYMENT-REBUILD: USDT 3.6/8.8/36.6)
const PLAN_AMOUNT: Record<string, number> = {
  // 这里只是示例映射, 实际产品不用这些金额
  // plan 字段是 membership 用的, Product 用 tier
};

// task051 重构: 三档纯付费 (WEEKLY/MONTHLY/ANNUAL)
// 分布规则 (PM 拍板 D7=D9 强制):
//   - Tier 1 (Premium/VIP): 100% ANNUAL (高价值)
//   - Tier 2 (Pro):        100% MONTHLY (中价值, 默认)
//   - Tier 3 (Basic):      100% WEEKLY (引流)
const TIER_MAP: Record<string, 'WEEKLY' | 'MONTHLY' | 'ANNUAL'> = {
  'Tier 1 (Premium/VIP)': 'ANNUAL',
  'Tier 2 (Pro)': 'MONTHLY',
  'Tier 3 (Basic)': 'WEEKLY',
  'N/A': 'WEEKLY',
};

interface ProductProfile {
  id: string;
  audience: string;
  category: string;
  tier: string;
  subcategory?: string;
  capabilityTags?: string[];
  positioning?: string;
  productHighlights?: string;
  algorithmicCore?: string;
  practicalApplication?: string;
  riskControl?: string;
  raw_data?: Record<string, unknown>;
}

async function loadAllProfiles(): Promise<ProductProfile[]> {
  // task051 PAYMENT-REBUILD: 用绝对路径, 避免 cwd 依赖
  const allPath = join(process.cwd(), '..', 'mql5-phase2', 'output', 'product_descriptions', 'product_descriptions_all.json');
  const raw = await readFile(allPath, 'utf-8');
  const data = JSON.parse(raw);
  return data.products as ProductProfile[];
}

// Prisma 是 type-only 命名空间, 不作为 runtime value 使用
// 改用 ProductCreateInput 直接引用（避开 @/ 路径解析, 用 import type）
import type { Product } from '../src/generated/prisma';
type PrismaTypes = { ProductCreateInput: any };
type ProductCreateInput = { data: any };
function buildProductData(p: ProductProfile): ProductCreateInput {
  const positioning = p.positioning ?? '';
  const description = [
    positioning,
    p.productHighlights ?? '',
    p.algorithmicCore ?? '',
    p.practicalApplication ?? '',
    p.riskControl ?? '',
  ].filter(Boolean).join('\n\n');

  const tier = p.tier ?? 'Tier 3 (Basic)';
  const plan = TIER_MAP[tier] ?? 'WEEKLY';

  // ID 转换: algo-forge__xxx__yyy.mq5 → yyy (简化)
  const cleanId = p.id.replace(/__/g, '-').replace(/\.mq[45]$/, '').slice(-100);

  return {
    id: cleanId,
    name: positioning.slice(0, 100) || cleanId,
    description,
    // task051: category 默认值兜底 (部分 source profile 缺该字段)
    category: (p.category as any) ?? 'EA',
    fileUrl: `cpro_patched_sandbox/products/${p.id}/`,
    version: '1.0',
    requiredPlan: plan,
    isFree: false, // task051: D7 一刀切, 全站禁白嫖, 无 isFree 字段
    tier,
    score: 0,
    ratingCount: 0,
    downloadCount: 0,
    isActive: true,
    publishedAt: new Date(),
    // task051: capabilityTags 是 String 字段, JSON 序列化
    capabilityTags: JSON.stringify(p.capabilityTags ?? []),
    subcategory: p.subcategory ?? '',
    positioning,
    productHighlights: p.productHighlights ?? '',
    algorithmicCore: p.algorithmicCore ?? '',
    practicalApplication: p.practicalApplication ?? '',
    riskControl: p.riskControl ?? '',
  };
}

async function main() {
  console.log('[task-0031] Loading all profiles...');
  const profiles = await loadAllProfiles();
  console.log(`Total profiles: ${profiles.length}`);

  // === 防 OOM: 分批写入 ===
  let processed = 0;
  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE);
    const data = batch.map(buildProductData);
    try {
      // task051 PAYMENT-REBUILD: Prisma 7 移除 skipDuplicates (重复 ID 由 dedup 流程保证)
      await prisma.product.createMany({ data });
      processed += batch.length;
      console.log(`[${processed}/${profiles.length}] batch OK`);
    } catch (err) {
      console.error(`Batch ${i} failed:`, err);
      // 继续下一个 batch
    }
  }

  console.log(`\nDone. ${processed} products inserted.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});