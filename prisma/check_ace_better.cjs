// Use better-sqlite3 directly (no prisma client needed)
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join('G:\\CodeBase\\cpro-website\\prisma', 'dev.db');
const db = new Database(dbPath, { readonly: true });
const names = ['DCA_Gold_Grid','MartingailExpert','GoldArbitrageXpert','XAU_USD_Scalper_M1','Goldwarrior02b'];
const placeholders = names.map(() => '?').join(',');
const sql = `SELECT id, name, isFeatured, isActive, tier, score, downloadCount, positioning FROM Product WHERE name IN (${placeholders})`;
const rows = db.prepare(sql).all(...names);
console.log('--- 5 王牌当前状态 ---');
for (const r of rows) {
  console.log(`${(r.name || '').padEnd(28)} | id=${(r.id || '').padEnd(40)} | isFeatured=${r.isFeatured} | isActive=${r.isActive} | tier=${(r.tier || '').padEnd(20)} | score=${r.score} | dl=${r.downloadCount}`);
}
const all = db.prepare('SELECT name FROM Product WHERE isFeatured = 1').all();
console.log('---');
console.log('isFeatured=true 共', all.length, '款:', all.map(r => r.name).join(', '));
db.close();
