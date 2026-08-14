// 统计 mtt-* + 5 王牌 总数 + 按 category/capabilityTags 分组
const path = require('path');
const { createClient } = require('@libsql/client');
const dbPath = path.join('G:\\CodeBase\\cpro-website\\prisma', 'dev.db');
const client = createClient({ url: `file:${dbPath}` });

(async () => {
  // 总数
  const r1 = await client.execute(`SELECT COUNT(*) as total FROM Product WHERE isActive = 1 AND (id LIKE 'mtt-%' OR isFeatured = 1) AND positioning IS NOT NULL AND description IS NOT NULL`);
  console.log('严选产品总数:', r1.rows[0].total);

  // 按 category 分组
  const r2 = await client.execute(`SELECT category, COUNT(*) as n FROM Product WHERE isActive = 1 AND (id LIKE 'mtt-%' OR isFeatured = 1) AND positioning IS NOT NULL AND description IS NOT NULL GROUP BY category ORDER BY n DESC`);
  console.log('--- 按 category 分组 ---');
  for (const x of r2.rows) {
    console.log(`  ${(x.category || '').padEnd(20)} | ${x.n}`);
  }

  // 按 tier 分组
  const r3 = await client.execute(`SELECT tier, COUNT(*) as n FROM Product WHERE isActive = 1 AND (id LIKE 'mtt-%' OR isFeatured = 1) AND positioning IS NOT NULL AND description IS NOT NULL GROUP BY tier ORDER BY n DESC`);
  console.log('--- 按 tier 分组 ---');
  for (const x of r3.rows) {
    console.log(`  ${(x.tier || 'N/A').padEnd(30)} | ${x.n}`);
  }

  // 详细列表 (id, name, category, subcategory, capabilityTags)
  const r4 = await client.execute(`SELECT id, name, category, subcategory, capabilityTags FROM Product WHERE isActive = 1 AND (id LIKE 'mtt-%' OR isFeatured = 1) AND positioning IS NOT NULL AND description IS NOT NULL ORDER BY isFeatured DESC, score DESC, createdAt DESC`);
  console.log('--- 详细列表 ---');
  for (const x of r4.rows) {
    let tags = [];
    try { tags = JSON.parse(x.capabilityTags || '[]'); } catch {}
    console.log(`  ${(x.id || '').padEnd(35)} | name=${(x.name || '').padEnd(15)} | cat=${(x.category || '').padEnd(8)} | sub=${(x.subcategory || '').padEnd(10)} | tags=${tags.slice(0,3).join(',')}`);
  }
  client.close();
})();
