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
// @ts-ignore - Node 脚本, 不参与前端 bundle 类型检查
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require(join(process.cwd(), 'src', 'generated', 'prisma'));
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();
const BATCH_SIZE = 500;

// 19,328 计划定义 (Q1 决策: USDT 6.6/16.6/36.6)
const PLAN_AMOUNT: Record<string, number> = {
  // 这里只是示例映射, 实际产品不用这些金额
  // plan 字段是 membership 用的, Product 用 tier
};

const TIER_MAP: Record<string, 'FREE_TRIAL' | 'MONTHLY_16' | 'ANNUAL_36'> = {
  'Tier 1 (Premium/VIP)': 'ANNUAL_36',
  'Tier 2 (Pro)': 'MONTHLY_16',
  'Tier 3 (Basic)': 'FREE_TRIAL',
  'N/A': 'FREE_TRIAL',
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
  const allPath = 'mql5-phase2/output/product_descriptions/product_descriptions_all.json';
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
  const plan = TIER_MAP[tier] ?? 'FREE_TRIAL';

  // ID 转换: algo-forge__xxx__yyy.mq5 → yyy (简化)
  const cleanId = p.id.replace(/__/g, '-').replace(/\.mq[45]$/, '').slice(-100);

  return {
    id: cleanId,
    name: positioning.slice(0, 100) || cleanId,
    description,
    category: p.category as any,
    fileUrl: `cpro_patched_sandbox/products/${p.id}/`,
    version: '1.0',
    requiredPlan: plan,
    isFree: tier === 'N/A',
    tier,
    score: 0,
    ratingCount: 0,
    downloadCount: 0,
    isActive: true,
    publishedAt: new Date(),
    capabilityTags: p.capabilityTags ?? [],
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
      // createMany 是 Postgres 最高效的批量插入
      await prisma.product.createMany({
        data,
        skipDuplicates: true,  // 重复 ID 跳过
      });
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