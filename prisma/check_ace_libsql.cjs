// Use @libsql/client directly (no prisma)
const path = require('path');
const { createClient } = require('@libsql/client');
const dbPath = path.join('G:\\CodeBase\\cpro-website\\prisma', 'dev.db');
const client = createClient({ url: `file:${dbPath}` });
(async () => {
  const names = ['DCA_Gold_Grid','MartingailExpert','GoldArbitrageXpert','XAU_USD_Scalper_M1','Goldwarrior02b'];
  const placeholders = names.map(() => '?').join(',');
  const sql = `SELECT id, name, isFeatured, isActive, tier, score, downloadCount, positioning FROM Product WHERE name IN (${placeholders})`;
  const result = await client.execute({ sql, args: names });
  console.log('--- 5 王牌当前状态 ---');
  for (const r of result.rows) {
    console.log(`${(r.name || '').padEnd(28)} | id=${(r.id || '').padEnd(40)} | isFeatured=${r.isFeatured} | isActive=${r.isActive} | tier=${(r.tier || '').padEnd(20)} | score=${r.score} | dl=${r.downloadCount}`);
  }
  const all = await client.execute('SELECT name FROM Product WHERE isFeatured = 1');
  console.log('---');
  console.log('isFeatured=true 共', all.rows.length, '款:', all.rows.map(r => r.name).join(', '));
  client.close();
})();
