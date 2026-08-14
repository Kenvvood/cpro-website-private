// 本地 DB 改 5 王牌 name 字段为简化中文
const path = require('path');
const { createClient } = require('@libsql/client');
const dbPath = path.join('G:\\CodeBase\\cpro-website\\prisma', 'dev.db');
const client = createClient({ url: `file:${dbPath}` });

(async () => {
  // 5 王牌: 旧名 → 新名 (简化版中文, 4-5 字以内, 主页表显示用)
  const updates = [
    ['GoldArbitrageXpert', '黄金套利'],
    ['DCA_Gold_Grid', '黄金网格'],
    ['Goldwarrior02b', '黄金对冲'],
    ['XAU_USD_Scalper_M1', '黄金剥头皮'],
    ['MartingailExpert', '马丁加仓'],
  ];
  for (const [oldName, newName] of updates) {
    const r = await client.execute({
      sql: 'UPDATE Product SET name = ? WHERE name = ?',
      args: [newName, oldName],
    });
    console.log(`${oldName} -> ${newName}: ${r.rowsAffected} rows updated`);
  }

  // 验证
  const r = await client.execute('SELECT id, name, positioning FROM Product WHERE isFeatured = 1 ORDER BY score DESC');
  console.log('--- 5 王牌当前 (name + positioning) ---');
  for (const x of r.rows) {
    console.log(`  ${x.id.padEnd(35)} | name: ${x.name.padEnd(10)} | pos: ${(x.positioning || '').slice(0, 50)}`);
  }
  client.close();
})();
